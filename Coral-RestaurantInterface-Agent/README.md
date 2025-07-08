## [Interface Agent](https://github.com/Coral-Protocol/Coral-Interface-Agent)

This is the modified interface agent with Fast api endpoints for the UI.

User Interaction Agent is the main interface for receiving user instructions, coordinating multi-agent tasks, and logging conversations via the terminal.

## Responsibility
User Interaction Agent acts as the main interface for coordinating user instructions and managing multi-agent tasks. It interacts with the user via terminal and orchestrates requests among various agents, ensuring seamless workflow and conversation logging.

## Details
- **Framework**: LangChain
- **Tools used**: Coral MCP Tools, ask_human Tool (human-in-the-loop)
- **AI model**: OpenAi/Groq LLM
- **Date added**: June 4, 2025
- **License**: MIT 

## Use the Agent in Orchestration
You will need to have API keys from [Openai](https://platform.openai.com/api-keys)/[Groq](https://console.groq.com/keys).

## Use the Agent  

### 1. Clone & Install Dependencies


<details>  

Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running on your system. If you are trying to run Interface agent and require coordination with other agents, you can run additional agents that communicate on the coral server.

```bash
# In a new terminal clone the repository:
git clone https://github.com/Coral-Protocol/Coral-InterfaceAgentForWebapp.git

# Navigate to the project directory:
cd Coral-InterfaceAgentForWebapp

# Install `uv`:
pip install uv

# Install dependencies from `pyproject.toml` using `uv`:
uv sync
```
### Troubleshooting

If you encounter errors related to post_writer, run these commands:

```bash
# Copy the client sse.py from utils to mcp package (Linux/ Mac)
cp -r utils/sse.py .venv/lib/python3.13/site-packages/mcp/client/sse.py

# OR Copy this for Windows
cp -r utils\sse.py .venv\Lib\site-packages\mcp\client\sse.py
```


</details>
 

### 2. Configure Environment Variables

<details>
 
Get the API Key:
 [Openai](https://platform.openai.com/api-keys)/[Groq](https://console.groq.com/keys)


```bash
# Create .env file in project root
cp -r .env_sample .env
```
</details>


### 3. Run Agent in Dev Mode

<details>

```bash
# Run the agent using `uv`:
uv run main.py
```
</details>


### 4. Example

<details>


```bash
# Input:
Agent: How can I assist you today?

#Output:
The agent will interact with you directly in the console and coordinate with other agents as needed.
```
</details>


## Creator Details
- **Name**: Suman Deb
- **Affiliation**: Coral Protocol
- **Contact**: [Discord](https://discord.com/invite/Xjm892dtt3)
