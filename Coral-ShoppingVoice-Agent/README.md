# Restaurant Voice Agent System

The Restaurant Voice Agent System is a multi-agent voice conversation system for restaurants that handles reservations, takeaway orders, and checkout through natural voice interactions. It features four specialized AI agents that seamlessly transfer conversations while maintaining context.

## Responsibility
A multi-agent voice system for restaurants, enabling natural, seamless voice-based reservations, orders, and payments by routing conversations between specialized agents.

## Details
- **Framework:** LiveKit Agents
- **Tools Used:** Deepgram STT, Cartesia TTS, OpenAI/Groq LLM, Silero VAD
- **Date Added:** January 2025
- **License:** MIT
- **Original Source:** [Restaurant Voice Agent System](https://github.com/livekit/agents/blob/main/examples/voice_agents/restaurant_agent.py)

## Use the Agent

### 1. Clone & Install Dependencies

Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running on your system. If you are trying to run Restaurant Voice Agent and require an input, you can either create your agent which communicates on the coral server or run and register the [Interface Agent](https://github.com/Coral-Protocol/Coral-Interface-Agent) on the Coral Server.

<details>

```bash
# In a new terminal clone the repository:
git clone https://github.com/Coral-Protocol/Coral-RestaurantVoice-Agent.git

# Navigate to the project directory:
cd Coral-RestaurantVoice-Agent
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

Copy the example file and add your API keys:

```bash
cp .env.example .env
```

Update `.env` with:
- `LIVEKIT_URL`
- `LIVEKIT_API_KEY` ([Get LiveKit API Key](https://cloud.livekit.io/))
- `LIVEKIT_API_SECRET` ([Get LiveKit API Secret](https://cloud.livekit.io/))
- `DEEPGRAM_API_KEY` ([Get Deepgram API Key](https://deepgram.com/))
- `CARTESIA_API_KEY` ([Get Cartesia API Key](https://play.cartesia.ai/keys))
- `API_KEY` ([Get OpenAI API Key](https://platform.openai.com/api-keys)) /([Get GROQ API Key](https://console.groq.com/keys))
- configure the LLM model you want to use

</details>

## 3. Run Agent in Dev Mode
<details>

```bash
uv run python main.py console
```
If you want to run the Agent using [Coral-Studio UI](https://github.com/Coral-Protocol/coral-studio) you can do so but it may not support Voice input and outputs from the UI and only the messages sent using Coral tools will be visible.You
clone it and run it according to the instructions in the readme and run this agent in your terminal.

</details>

## 4. Example
<details>

## Agent System

### 🏪 Greeter Agent
Welcomes customers, presents menu (Pizza $10, Salad $5, Ice Cream $3, Coffee $2), and routes to specialized agents.

### 📅 Reservation Agent
Handles dining reservations - collects time, customer name, and phone number.

### 🥡 Takeaway Agent
Processes food orders - takes orders from menu, clarifies requests, confirms details.

### 💳 Checkout Agent
Handles payments - calculates expenses, collects contact info and credit card details.

## Usage Examples

<details>

**Getting Started:**
1. Start the agent using `uv run python main.py console`
2. The Greeter Agent will automatically welcome you to the restaurant
3. Say "Hi!" or any greeting to initiate the conversation
4. The agent will then listen to other agent calling it (for example interface agent)
5. Continue your conversation naturally - the system will route you to the appropriate specialized agent

**Making a Reservation:**
1. Say: "I'd like to make a reservation"
2. The system routes you to the Reservation Agent
3. Provide preferred time, name, and phone
4. Confirm details

**Ordering Takeaway:**
1. Say: "I want to order food"
2. The system routes you to the Takeaway Agent
3. Place order from menu
4. Get routed to Checkout Agent for payment
5. Provide payment information and complete transaction

</details>
</details>

## Creator Details
- **Name:** Ahsen Tahir
- **Affiliation**: Coral Protocol
- **Contact**: [Discord](https://discord.com/invite/Xjm892dtt3)
