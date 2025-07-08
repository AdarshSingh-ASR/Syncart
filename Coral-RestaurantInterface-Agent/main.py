import asyncio
import os
import json
import logging
import urllib.parse
from dotenv import load_dotenv
from anyio import ClosedResourceError
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.chat_models import init_chat_model
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain.agents import create_tool_calling_agent, AgentExecutor
from langchain.tools import Tool
from langchain_community.callbacks import get_openai_callback
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Interface Agent API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
print(os.getenv("MODEL_NAME"))
print(os.getenv("MODEL_PROVIDER"))
print(os.getenv("API_KEY"))
print(os.getenv("MODEL_TEMPERATURE"))
print(os.getenv("MODEL_TOKEN"))

base_url = os.getenv("CORAL_SSE_URL")
# Use a dedicated environment variable for the restaurant interface agent so that its identifier is
# guaranteed to be unique from other agents that might be running on the same Coral server.
# Falls back to a descriptive default when the variable is not provided.
agentID = os.getenv("CORAL_RESTAURANT_INTERFACE_AGENT_ID", "restaurant-interface-agent")
params = {
    #"waitForAgents": 2,
    "agentId": agentID,
    "agentDescription": "You are user_interaction_agent, handling user instructions and coordinating testing tasks across agents"
}

query_string = urllib.parse.urlencode(params)
MCP_SERVER_URL = f"{base_url}?{query_string}"
AGENT_NAME = "user_interaction_agent"

# Create queues for communication
agent_question_queue = asyncio.Queue()
agent_response_queue = asyncio.Queue()
tool_status_queue = asyncio.Queue()

# Pydantic models
class AgentResponse(BaseModel):
    response: str

class AgentQuestion(BaseModel):
    question: str

class ToolStatus(BaseModel):
    tool_name: str
    status: str
    details: Dict[str, Any]

# Keep track of the current tool being executed
current_tool_status = {"tool_name": "", "status": "idle", "details": {}}

async def update_tool_status(tool_name: str, status: str, details: Dict[str, Any] = {}):
    global current_tool_status
    current_tool_status = {"tool_name": tool_name, "status": status, "details": details}
    await tool_status_queue.put(current_tool_status)

@app.get("/agent/tool-status")
async def get_tool_status():
    """Endpoint for the frontend to get the current tool execution status"""
    try:
        # Try to get status with a timeout of 30 seconds
        status = await asyncio.wait_for(tool_status_queue.get(), timeout=30)
        return status
    except asyncio.TimeoutError:
        return current_tool_status

def get_tools_description(tools):
    return "\n".join(
        f"Tool: {tool.name}, Schema: {json.dumps(tool.args).replace('{', '{{').replace('}', '}}')}"
        for tool in tools
    )

async def ask_human_tool(question: str) -> str:
    print(f"Agent asks: {question}")
    runtime = os.getenv("CORAL_ORCHESTRATION_RUNTIME", "devmode")
    
    if runtime == "docker":
        load_dotenv(override=True)
        response = os.getenv("HUMAN_RESPONSE")
        if response is None:
            logger.error("No HUMAN_RESPONSE coming from Coral Server Orchestrator")
            response = "No response received from orchestrator"
    else:
        # Put the question in the queue
        await agent_question_queue.put(question)
        # Wait for the response from the web interface
        response = await agent_response_queue.get()
    
    
    return response

@app.get("/agent/question")
async def get_agent_question():
    """Endpoint for the frontend to get the latest question from the agent"""
    try:
        # Try to get a question with a timeout of 30 seconds
        question = await asyncio.wait_for(agent_question_queue.get(), timeout=30)
        return {"question": question}
    except asyncio.TimeoutError:
        raise HTTPException(status_code=204, detail="No question available")

@app.post("/agent/response")
async def post_agent_response(response: AgentResponse):
    """Endpoint for the frontend to send responses back to the agent"""
    await agent_response_queue.put(response.response)
    return {"status": "success"}

async def create_interface_agent(client, tools):
    tools_description = get_tools_description(tools)
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            f"""You are an agent interacting with the tools from Coral Server and using your own `ask_human` tool to communicate with the user,**You MUST NEVER finish the chain**

            Follow these steps in order:

            1. Use `list_agents` to list all connected agents and get their descriptions.
            IMPORTANT: Only interact with agents whose identifier (agentId) contains the text "restaurant-voice-agent". Ignore any agent that is not related to the restaurant domain (e.g. shopping agents).
            2. Use `ask_human` to ask: "How can I assist you today?" and wait for the response.
            3. Understand the user's intent and decide which agent(s) are needed based on their descriptions.
            4. If the user requests Coral Server information (e.g., agent status, connection info), use your tools to retrieve and return the information directly to the user, then go back to Step 1.
            5. If fulfilling the request requires multiple agents, determine the sequence and logic for calling them.
            6. For each selected agent:
            * **If a conversation thread with the agent does not exist, use `create_thread` to create one.**
            * Construct a clear instruction message for the agent.
            * Use **`send_message(threadId=..., content="instruction", mentions=[Receive Agent Id])`.** (NEVER leave `mentions` as empty)
            * Use `wait_for_mentions(timeoutMs=60000)` to receive the agent's response up to 5 times if no message received.
            * Record and store the response for final presentation.
            * Immediately relay each received response to the user using `ask_human` so the user stays informed in real-time.
            7. After all required agents have responded, show the complete conversation (all thread messages) to the user.
            8. Call `ask_human` to ask: "Is there anything else I can help you with?"
            9. Repeat the process from Step 1.
            
            - Use only tools: {tools_description}"""),
        ("placeholder", "{agent_scratchpad}")
    ])

    # model = ChatOpenAI(
    #     model="gpt-4.1-mini-2025-04-14",
    #     api_key=os.getenv("OPENAI_API_KEY"),
    #     temperature=0.3,
    #     max_tokens=32768
    # )

    model = init_chat_model(
        model=os.getenv("MODEL_NAME", "gpt-4.1"),
        model_provider=os.getenv("MODEL_PROVIDER", "openai"),
        api_key=os.getenv("API_KEY"),
        temperature=float(os.getenv("MODEL_TEMPERATURE", "0.1")),
        max_tokens=int(os.getenv("MODEL_TOKEN", "8000"))
    )

    agent = create_tool_calling_agent(model, tools, prompt)
    return AgentExecutor(agent=agent, tools=tools, max_iterations=None, verbose=True, stream_runnable=False)

async def stream_agent_response(agent_executor):
    """Handle streaming response from the agent executor"""
    full_response = ""
    
    async for chunk in agent_executor.astream({}):
        if isinstance(chunk, dict):
            for key, value in chunk.items():
                if key == "actions" and value:
                    for action in value:
                        # Update tool status when a tool is being executed
                        await update_tool_status(
                            tool_name=action.tool,
                            status="executing",
                            details={"input": action.tool_input}
                        )
                        
                        if action.tool == "send_message":
                            print(f"\n🤖💬 AGENT 2 AGENT MESSAGE : {action.tool_input}")
                            print(f"=" * 50)
                        if action.tool == "ask_human":
                            if isinstance(action.tool_input, dict):
                                question = action.tool_input.get('question', action.tool_input)
                            else:
                                question = action.tool_input
                            print(f"\n🤖💬 AGENT 2 HUMAN MESSAGE : {question}")
                            print(f"=" * 50)
                
                elif key == "output":
                    # Update tool status when execution is complete
                    await update_tool_status(
                        tool_name="",
                        status="idle",
                        details={"output": str(value)}
                    )
                    full_response += str(value)
        else:
            full_response += str(chunk)
    return full_response


async def main():
    max_retries = 5
    retry_delay = 5  # seconds
    client = None
    
    for attempt in range(max_retries):
        try:
            # Create client without context manager (new approach for v0.1.0+)
            client = MultiServerMCPClient(
                connections={
                    "coral": {
                        "transport": "sse",
                        "url": MCP_SERVER_URL,
                        "timeout": 600,
                        "sse_read_timeout": 600,
                    }
                }
            )
            
            logger.info(f"Connected to MCP server at {MCP_SERVER_URL}")
            
            # Get tools using the new approach
            mcp_tools = await client.get_tools()
            tools = mcp_tools + [Tool(
                name="ask_human",
                func=None,
                coroutine=ask_human_tool,
                description="Ask the user a question and wait for a response."
            )]
            
            tools_description = get_tools_description(tools)
            print(tools)
            logger.info(f"Tools Description:\n{get_tools_description(tools)}")

            agent_executor = await create_interface_agent(client, tools)
            
            # Start the agent in the background
            background_task = asyncio.create_task(stream_agent_response(agent_executor))
            
            # Start the FastAPI server
            config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
            server = uvicorn.Server(config)
            await server.serve()
            
            # Wait for the background task to complete
            await background_task
            
            # If we reach here, everything was successful, so break the retry loop
            break
        except ClosedResourceError as e:
            logger.error(f"ClosedResourceError on attempt {attempt + 1}: {e}")
            if client:
                try:
                    await client.close()
                except:
                    pass
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error("Max retries reached. Exiting.")
                raise
        except Exception as e:
            logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
            if client:
                try:
                    await client.close()
                except:
                    pass
            if attempt < max_retries - 1:
                logger.info(f"Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                continue
            else:
                logger.error("Max retries reached. Exiting.")
                raise
    
    # Clean up client connection when done
    if client:
        try:
            await client.close()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())
