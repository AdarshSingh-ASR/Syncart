# Project Summary

**Syncart-Prosus Agentic Ecommerce Web App** is a modular, agent-based platform for ecommerce and restaurant scenarios. It features:
- Four Python backend agents (Restaurant/Shopping, Voice/Interface) for advanced conversational and interface automation.
- A modern web UI built with Next.js, React, and Tailwind CSS.
- Docker support for easy deployment.
- Each agent and the UI are standalone and can be run independently.

# Quick Start

## 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Syncart-Prosus-AgenticEcommerceWebApp
```

## 2. Set Up the UI (Frontend)
```bash
cd UI
npm install
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 3. Set Up Backend Agents
Each agent is a separate Python project. For each agent (e.g., `Coral-RestaurantInterface-Agent`):

### a. Install Python dependencies
```bash
cd Coral-RestaurantInterface-Agent
pip install -r requirements.txt  # or use pyproject.toml with pip or uv
python main.py
```

### b. Or use Docker (recommended for isolation)
```bash
cd Coral-RestaurantInterface-Agent
docker build -t restaurant-interface-agent .
docker run -p 5555:5555 restaurant-interface-agent
```
Repeat for each agent directory (`Coral-RestaurantVoice-Agent`, `Coral-ShoppingInterface-Agent`, `Coral-ShoppingVoice-Agent`).

## 4. Requirements
- Node.js (for UI)
- Python 3.13+ (for agents)
- Docker (optional, for containerized agents)

---

# Detailed Overview

# Syncart-Prosus Agentic Ecommerce Web App

This project is an agentic, modular ecommerce web application designed to demonstrate advanced agent-based interactions for shopping and restaurant scenarios. It features both voice and interface agents, a modern web UI, and Dockerized Python backends for scalable deployment.

## Project Structure

```
Syncart-Prosus-AgenticEcommerceWebApp/
├── Coral-RestaurantInterface-Agent/   # Python agent for restaurant interface
├── Coral-RestaurantVoice-Agent/       # Python agent for restaurant voice
├── Coral-ShoppingInterface-Agent/     # Python agent for shopping interface
├── Coral-ShoppingVoice-Agent/         # Python agent for shopping voice
├── UI/                               # Next.js (React) frontend
│   ├── app/                          # App directory (pages, API routes)
│   ├── components/                   # React components
│   └── public/                       # Static assets
├── images/                           # Project and documentation images
├── README.md                         # Project documentation
├── package.json, bun.lock            # Project dependencies
```

## Features
- Modular agent architecture for both shopping and restaurant domains
- Voice and interface-based agent interactions
- Modern web UI built with Next.js, React, and Tailwind CSS
- Docker support for backend agents
- Extensible and easy to deploy

## Getting Started

### Prerequisites
- Node.js (for UI)
- Python 3.8+ (for agents)
- Docker (optional, for containerized agents)

### Setup UI
```bash
cd UI
npm install
npm run dev
```

### Setup Backend Agents
Each agent is a standalone Python module. Example for Restaurant Interface Agent:
```bash
cd Coral-RestaurantInterface-Agent
pip install -r requirements.txt
python main.py
```
Or use Docker:
```bash
docker build -t restaurant-interface-agent .
docker run -p 8000:8000 restaurant-interface-agent
```

Repeat for other agent modules as needed.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE) (or specify your license here)

---

For more details, see the README files in each submodule or the UI directory.

# LLM Agents Used

This project leverages advanced Large Language Model (LLM) agents for both interface and voice-based automation:

- **LLM Providers:**
  - Supports both **OpenAI** (e.g., GPT-4, GPT-4o) and **Groq** models, configurable via environment variables.

- **Agent Frameworks:**
  - **LangChain** (for Interface Agents):
    - Used in `Coral-RestaurantInterface-Agent` and `Coral-ShoppingInterface-Agent`.
    - Enables tool-using, multi-step reasoning agents with support for OpenAI and Groq LLMs.
  - **LiveKit Agents** (for Voice Agents):
    - Used in `Coral-RestaurantVoice-Agent` and `Coral-ShoppingVoice-Agent`.
    - Integrates LLMs (OpenAI, Groq), speech-to-text (Deepgram), text-to-speech (Cartesia), and voice activity detection (Silero) for real-time, multi-agent voice conversations.

- **Multi-Agent Orchestration:**
  - Agents can communicate, delegate tasks, and coordinate via a central MCP (Multi-Channel Protocol) server.
  - Both interface and voice agents can call tools, interact with users, and collaborate with other agents for complex workflows.
