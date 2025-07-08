import logging
from dataclasses import dataclass, field
from typing import Annotated, Optional
import os
import urllib.parse

import yaml
from dotenv import load_dotenv
from pydantic import Field

from livekit.agents import JobContext, WorkerOptions, cli, mcp
from livekit.agents.llm import function_tool
from livekit.agents.voice import Agent, AgentSession, RunContext
from livekit.agents.voice.room_io import RoomInputOptions
from livekit.plugins import cartesia, deepgram, openai, silero, groq

logger = logging.getLogger("shopping-example")
logger.setLevel(logging.INFO)

load_dotenv()

def get_llm_instance(parallel_tool_calls=None):
    """Get LLM instance based on environment configuration"""
    llm_provider = os.getenv("LLM_PROVIDER", "openai").lower()
    llm_model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    api_key = os.getenv("API_KEY")
    
    kwargs = {}
    if parallel_tool_calls is not None:
        kwargs["parallel_tool_calls"] = parallel_tool_calls
    
    if llm_provider == "openai":
        return openai.LLM(model=llm_model, api_key=api_key, **kwargs)
    elif llm_provider == "groq":
        return groq.LLM(model=llm_model, api_key=api_key, **kwargs)
    else:
        logger.warning(f"Unsupported LLM provider: {llm_provider}. Falling back to OpenAI.")
        return openai.LLM(model=llm_model, api_key=api_key, **kwargs)

voices = {
    "greeter": "794f9389-aac1-45b6-b726-9d9369183238",
    "shopping_cart": "156fb8d2-335b-4950-9cb3-a2d33befec77",
    "takeaway": "6f84f4b8-58a2-430c-8c79-688dad597532",
    "checkout": "39b376fc-488e-4d0c-8b37-e00b72059fdd",
}

@dataclass
class UserData:
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    shopping_cart: list[str] = field(default_factory=list)
    order: Optional[list[str]] = None

    customer_credit_card: Optional[str] = None
    customer_credit_card_expiry: Optional[str] = None
    customer_credit_card_cvv: Optional[str] = None

    expense: Optional[float] = None
    checked_out: Optional[bool] = None
    agents: dict[str, Agent] = field(default_factory=dict)
    prev_agent: Optional[Agent] = None

    def summarize(self) -> str:
        data = {
            "customer_name": self.customer_name or "unknown",
            "customer_phone": self.customer_phone or "unknown",
            "shopping_cart": self.shopping_cart or "unknown",
            "order": self.order or "unknown",
            "credit_card": {
                "number": self.customer_credit_card or "unknown",
                "expiry": self.customer_credit_card_expiry or "unknown",
                "cvv": self.customer_credit_card_cvv or "unknown",
            }
            if self.customer_credit_card
            else None,
            "expense": self.expense or "unknown",
            "checked_out": self.checked_out or False,
        }
        return yaml.dump(data)

RunContext_T = RunContext[UserData]

@function_tool()
async def update_name(
    name: Annotated[str, Field(description="The customer's name")],
    context: RunContext_T,
) -> str:
    """Called when the user provides their name.
    Confirm the spelling with the user before calling the function."""
    userdata = context.userdata
    userdata.customer_name = name
    return f"The name is updated to {name}"

@function_tool()
async def update_phone(
    phone: Annotated[str, Field(description="The customer's phone number")],
    context: RunContext_T,
) -> str:
    """Called when the user provides their phone number.
    Confirm the spelling with the user before calling the function."""
    userdata = context.userdata
    userdata.customer_phone = phone
    return f"The phone number is updated to {phone}"


@function_tool()
async def to_greeter(context: RunContext_T) -> Agent:
    """Called when user asks any unrelated questions or requests
    any other services not in your job description."""
    curr_agent: BaseAgent = context.session.current_agent
    return await curr_agent._transfer_to_agent("greeter", context)


class BaseAgent(Agent):
    async def on_enter(self) -> None:
        agent_name = self.__class__.__name__
        logger.info(f"entering task {agent_name}")

        userdata: UserData = self.session.userdata
        chat_ctx = self.chat_ctx.copy()

        if isinstance(userdata.prev_agent, Agent):
            truncated_chat_ctx = userdata.prev_agent.chat_ctx.copy(
                exclude_instructions=True, exclude_function_call=False
            ).truncate(max_items=6)
            existing_ids = {item.id for item in chat_ctx.items}
            items_copy = [item for item in truncated_chat_ctx.items if item.id not in existing_ids]
            chat_ctx.items.extend(items_copy)

        chat_ctx.add_message(
            role="system",
            content=f"You are {agent_name} agent. Current user data is {userdata.summarize()}. "
            f"You can communicate with external agents outside the restaurant system using wait_for_mentions to listen for incoming messages all the time and send_message tool to respond to external agents. "
            f"Continuously monitor for mentions from external agents and respond appropriately when contacted by outside systems.Soon after your introduction, you should start calling the wait_for_mentions tool to monitor for external agents.",
        )
        await self.update_chat_ctx(chat_ctx)
        self.session.generate_reply(tool_choice="none")

    async def _transfer_to_agent(self, name: str, context: RunContext_T) -> tuple[Agent, str]:
        userdata = context.userdata
        current_agent = context.session.current_agent
        next_agent = userdata.agents[name]
        userdata.prev_agent = current_agent
        return next_agent, f"Transferring to {name}."

class ShoppingGreeter(BaseAgent):
    def __init__(self, product_catalog: str) -> None:
        super().__init__(
            instructions=(
                f"You are a friendly shopping assistant. You have to remain completely silent until an external agent mentions you just introduce yourself and do not wait for the person to respond to your greeting, then you must call the 'wait for mentions' tool continuously from the MCP integration to listen for messages from external agents. The product catalog is: {product_catalog}\n"
                "Your jobs are to greet the other agent that mentions you and understand what they want "
                "and help them with their shopping needs. Guide them to the right agent using tools.\n"
                "External Agent Communication:\n"
                "- Use wait_for_mentions tool all the time to check for messages from external agents\n"
                "- Use send_message tool to respond to external agents when they contact you\n"
                "- If customers want to send messages to external services, help facilitate that communication using send_message tool\n"
            ),
            llm=get_llm_instance(parallel_tool_calls=False),
            tts=cartesia.TTS(voice=voices["greeter"]),
        )
        self.product_catalog = product_catalog

    @function_tool()
    async def to_shopping_cart(self, context: RunContext_T) -> tuple[Agent, str]:
        """Called when the user wants to manage their shopping cart, like adding, removing, or viewing items."""
        return await self._transfer_to_agent("shopping_cart", context)

class ShoppingCartAgent(BaseAgent):
    def __init__(self, product_catalog: str) -> None:
        super().__init__(
            instructions=(
                f"You are a shopping cart agent. Your job is to manage the user's shopping cart. "
                f"The product catalog is: {product_catalog}\n"
                "You can add items, remove items, and view the current cart."
            ),
            tools=[to_greeter],
            tts=cartesia.TTS(voice=voices["shopping_cart"]),
        )

    @function_tool()
    async def add_to_cart(
        self,
        item: Annotated[str, Field(description="The item to add to the cart.")],
        context: RunContext_T,
    ) -> str:
        """Adds an item to the shopping cart."""
        userdata = context.userdata
        userdata.shopping_cart.append(item)
        return f"Added {item} to your cart. Your cart now has: {', '.join(userdata.shopping_cart)}"

    @function_tool()
    async def remove_from_cart(
        self,
        item: Annotated[str, Field(description="The item to remove from the cart.")],
        context: RunContext_T,
    ) -> str:
        """Removes an item from the shopping cart."""
        userdata = context.userdata
        if item in userdata.shopping_cart:
            userdata.shopping_cart.remove(item)
            return f"Removed {item} from your cart. Your cart now has: {', '.join(userdata.shopping_cart)}"
        else:
            return f"{item} is not in your cart."

    @function_tool()
    async def view_cart(self, context: RunContext_T) -> str:
        """Views the items currently in the shopping cart."""
        userdata = context.userdata
        if not userdata.shopping_cart:
            return "Your shopping cart is empty."
        return f"Your cart contains: {', '.join(userdata.shopping_cart)}"

class TakeawayAgent(BaseAgent):
    def __init__(self, menu: str) -> None:
        super().__init__(
            instructions=(
                f"Your are a takeaway agent that takes orders from the customer. "
                f"Our menu is: {menu}\n"
                "Clarify special requests and confirm the order with the customer.",
            ),
            tools=[to_greeter],
            tts=cartesia.TTS(voice=voices["takeaway"]),
        )

    @function_tool()
    async def update_order(
        self,
        items: Annotated[list[str], Field(description="The items of the full order")],
        context: RunContext_T,
    ) -> str:
        """Called when the user create or update their order."""
        userdata = context.userdata
        userdata.order = items
        return f"The order is updated to {items}"

    @function_tool()
    async def to_checkout(self, context: RunContext_T) -> str | tuple[Agent, str]:
        """Called when the user confirms the order."""
        userdata = context.userdata
        if not userdata.order:
            return "No takeaway order found. Please make an order first."

        return await self._transfer_to_agent("checkout", context)


class CheckoutAgent(BaseAgent):
    def __init__(self, menu: str) -> None:
        super().__init__(
            instructions=(
                 f"You are a checkout agent at a restaurant. The menu is: {menu}\n"
                "Your are responsible for confirming the expense of the "
                "order and then collecting customer's name, phone number and credit card "
                "information, including the card number, expiry date, and CVV step by step."
            ),
            tools=[update_name, update_phone, to_greeter],
            tts=cartesia.TTS(voice=voices["checkout"]),
        )

    @function_tool()
    async def confirm_expense(
        self,
        expense: Annotated[float, Field(description="The expense of the order")],
        context: RunContext_T,
    ) -> str:
        """Called when the user confirms the expense."""
        userdata = context.userdata
        userdata.expense = expense
        return f"The expense is confirmed to be {expense}"

    @function_tool()
    async def update_credit_card(
        self,
        number: Annotated[str, Field(description="The credit card number")],
        expiry: Annotated[str, Field(description="The expiry date of the credit card")],
        cvv: Annotated[str, Field(description="The CVV of the credit card")],
        context: RunContext_T,
    ) -> str:
        """Called when the user provides their credit card number, expiry date, and CVV.
        Confirm the spelling with the user before calling the function."""
        userdata = context.userdata
        userdata.customer_credit_card = number
        userdata.customer_credit_card_expiry = expiry
        userdata.customer_credit_card_cvv = cvv
        return f"The credit card number is updated to {number}"

    @function_tool()
    async def confirm_checkout(self, context: RunContext_T) -> str | tuple[Agent, str]:
        """Called when the user confirms the checkout."""
        userdata = context.userdata
        if not userdata.expense:
            return "Please confirm the expense first."

        if (
            not userdata.customer_credit_card
            or not userdata.customer_credit_card_expiry
            or not userdata.customer_credit_card_cvv
        ):
            return "Please provide the credit card information first."

        userdata.checked_out = True
        return await to_greeter(context)

    @function_tool()
    async def to_takeaway(self, context: RunContext_T) -> tuple[Agent, str]:
        """Called when the user wants to update their order."""
        return await self._transfer_to_agent("takeaway", context)



async def entrypoint(ctx: JobContext):
    await ctx.connect()

    # MCP Server configuration
    base_url = os.getenv("CORAL_SSE_URL")
    params = {
        "agentId": os.getenv("CORAL_SHOPPING_VOICE_AGENT_ID", "shopping-voice-agent"),
        "agentDescription": "You are a helpful shopping AI assistant that can help with finding products and managing a shopping cart."
    }
    query_string = urllib.parse.urlencode(params)
    MCP_SERVER_URL = f"{base_url}?{query_string}"

    # The product catalog now explicitly lists both **new** and **used** (refurbished) variants so
    # the voice-assistant can help customers purchase either condition. Feel free to extend or
    # modify these entries via environment variables or future code updates.
    product_catalog = (
        "Laptop (new): $1200, Laptop (used): $800, "
        "Mouse (new): $25, Mouse (used): $15, "
        "Keyboard (new): $75, Keyboard (used): $50, "
        "Monitor (new): $300, Monitor (used): $200"
    )
    userdata = UserData()
    userdata.agents.update(
        {
            "greeter": ShoppingGreeter(product_catalog),
            "shopping_cart": ShoppingCartAgent(product_catalog),
            "takeaway": TakeawayAgent(product_catalog),
            "checkout": CheckoutAgent(product_catalog),
        }
    )
    session = AgentSession[UserData](
        userdata=userdata,
        stt=deepgram.STT(),
        llm=get_llm_instance(),
        tts=cartesia.TTS(),
        vad=silero.VAD.load(),
        max_tool_steps=5,
        mcp_servers=[
            mcp.MCPServerHTTP(
                url=MCP_SERVER_URL,
                timeout=100,
                client_session_timeout_seconds=100,
            ),
        ],
    )

    await session.start(
        agent=userdata.agents["greeter"],
        room=ctx.room,
        room_input_options=RoomInputOptions(),
    )

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
