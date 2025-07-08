# Prosus: Agentic Voice Restaurant Ordering Webapp with Groq & LiveKit
 This guide helps you build an AI-powered e-commerce app for the Prosus Challenge using Coral Protocol and multi-agent collaboration. Follow step-by-step setup instructions for agents, server, and UI.

![Agentimage](https://github.com/Coral-Protocol/awesome-agents-for-multi-agent-systems/blob/main/images/Coral-RestaurantVoice-Agent.png)

## Outline
- **Setup Coral Server and Coral Studio**  
  Step-by-step guide to install and run Coral Server and Coral Studio with necessary dependencies (Java, Yarn, Node.js).

- **Setup the Agents**  
  Instructions to install and configure the Interface Agent and Restaurant Voice Agent using uv.

- **Run the Agents**  
  Three available options to run agents:
  - Dev Mode (terminal-based) for easier debugging  
  - Custom UI Mode with independent frontend
  - Dev Mode with Coral Studio UI
  
## Introduction

The Prosus Challenge track is centered around building an AI-powered e-commerce application using the Coral Protocol, an open, standardized framework for AI agent collaboration. Coral enables multiple AI agents to communicate, share tasks, and coordinate through a structured messaging layer with threads and mentions. In this track, participants will leverage Coral Server along with specialized agents such as the Interface Agent to handle user instructions and the Restaurant Voice Agent for real-time, voice-based interactions. The solution integrates technologies like Groq and LiveKit to power AI, speech, and communication capabilities, with an optional custom UI to deliver a seamless user experience.
- Agents: [Interface Agent](https://github.com/Coral-Protocol/Coral-InterfaceAgentForWebapp) | [Restaurant Voice Agent](https://github.com/Coral-Protocol/Coral-RestaurantVoice-Agent)
- [Demo Video for Running with custom UI](https://drive.google.com/file/d/1eErTy2j4U-lXbkJVukoeHmn0aWCN04YJ/view)
- [Demo Video Output of Custom UI](https://drive.google.com/file/d/1aUT95e2FwuBFzrCZJsMhcwcqMF9VqHV4/view?usp=sharing)

### 1. Setup Coral Server and Coral Studio

<details>

- To setup the [Coral Server](https://github.com/Coral-Protocol/coral-server) and [Coral Studio UI](https://github.com/Coral-Protocol/coral-studio), follow the steps given in repository to install.

- In order to test if both are working, open the same instance in two terminals and run both simultaneously.

```bash
# run studio
yarn dev
```
- You will see both running like this simultaneously if succesful and should be able to access Coral Studio from your browser.

![Coral Server and Studio Running](images/server-studio.png)

- On Coral Studio, ensure the connection to Coral Server.

![Coral Server and Studio Connection UI](images/coral-connection.png)

<details>

<summary>Install Java if UNAVAILABLE in order to run Coral Server</summary>

Install Java

```bash

# Apt update
sudo apt update

# Install the JDK
sudo apt install openjdk-17-jdk

# Check version
java -version
```

Run Coral Server

```bash

./gradlew run

```

</details>

<details>

<summary>Install Yarn if UNAVAILABLE in order to run Coral Studio</summary>

Install Yarn

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.17.0".
nvm current # Should print "v22.17.0".

# Download and install Yarn:
corepack enable yarn

# Verify Yarn version:
yarn -v

# Install from yarn
yarn install

# Allow port for eternal access
sudo ufw allow 5173

```

Run Coral Studio

```bash

yarn dev

```

</details>

</details>

### 2. Setup the Agents

<details>  

- Terminate the Coral Server and Coral Studio connections from above and start below steps.
- In this example, we are using the agents: [Coral Interface Agent](https://github.com/Coral-Protocol/Coral-Interface-Agent) and [Restaurant Agent](https://github.com/Coral-Protocol/Coral-RestaurantVoice-Agent).  
- Please click on the link and set up the agents by following the setup instructions in the repository.
  
</details>

### 3. Run the Agents:
You can run it in three modes but Dev mode is preferable for beginner


<details>
  <summary>Option 1: Dev Mode(Running on terminal) </summary>
 
- The Dev Mode allows the Coral Server and all agents to be seaprately running on each terminal without UI support.  

- Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running on your system and run below commands in separate terminals.

- Ensure that you have setup the `.env` file with required keys.
  
Make Sure you run both agents at approximately same time:

Run the Interface Agent

```bash
# cd to directory
cd Coral-Interface-Agent

# Run the agent using `uv`:
uv run python main.py
```

Run the Restaurant Agent

```bash
# cd to directory
cd Coral-RestaurantVoice-Agent

# Run the agent using `uv`:
uv run main.py console
```
</details>

<details>


<summary>Option 2: Agents running without Coral-Studio and using custom UI:</summary>

Ensure that the [Coral Server](https://github.com/Coral-Protocol/coral-server) is running on your system

#### 1. Git clone the repository and install dependencies

```bash
# Clone the repository
git clone https://github.com/Coral-Protocol/Prosus-Agentic-Voice-Restaurant-Webapp

# Install `uv`:
pip install uv
```

##### For Coral Interface Agent
```bash
# Navigate to the interface agent agent directory
cd Coral-InterfaceAgentForWebapp

# Install dependencies from `pyproject.toml` using `uv`:
uv sync
```

##### For Restaurant Agent
```bash
# Navigate to the monzo agent directory
cd Coral-RestaurantVoice-Agent

# Install dependencies from `pyproject.toml` using `uv`:
uv sync
```

#### 2. Environment Configuration

##### For Coral Interface Agent
Get the API Key:
[Openai](https://platform.openai.com/api-keys)/[Groq](https://console.groq.com/keys)

Create a `.env` file in the `Coral-InterfaceAgentForWebapp` directory based on the `.env_sample` file:
```bash
cd Coral-InterfaceAgentForWebapp
cp -r .env_sample .env
# Edit .env with your specific configuration
```

##### For Restaurant Agent
Get the api key
API_KEY=[Openai](https://platform.openai.com/api-keys)/[Groq](https://console.groq.com/keys).

Note:
If you want to use cloud services by Livekit then use [Livekit Cloud](https://cloud.livekit.io/) for these api keys and url but for Self hosting you can check out there documentation for [Self Hosting](https://docs.livekit.io/home/self-hosting/local/).

```LIVEKIT_API_KEY```=your_livekit_api_key_here 

```LIVEKIT_API_SECRET```=your_livekit_api_secret_here  

```LIVEKIT_URL```=your_livekit_url_here 

Create a `.env` file in the `Coral-RestaurantVoice-Agent` directory based on the `.env.example` file:
```bash
cd Coral-RestaurantVoice-Agent
cp -r env.example .env
# Edit .env with your specific configuration
```
#### UI Frontend
To use the UI do this setup in a separate terminal:
```bash
cd UI
npm install
```
Create a `.env.local` file in the `UI` directory:
```bash
# Create .env.local with these variables:

# LiveKit Configuration
LIVEKIT_API_KEY=your_livekit_api_key_here 
LIVEKIT_API_SECRET=your_livekit_api_secret_here  
LIVEKIT_URL=your_livekit_url_here  

# API Endpoint Configuration (for Interface Agent)
NEXT_PUBLIC_CONN_DETAILS_ENDPOINT=/api/connection-details

# Interface Agent API Endpoint (default: http://localhost:8000)
NEXT_PUBLIC_INTERFACE_AGENT_API_ENDPOINT=http://localhost:8000
```

#### 3. Run Agents in Separate Terminals
Start all three components in their respective terminals:

#### Terminal 1: Start Coral Interface Agent
```bash
cd Coral-InterfaceAgentForWebapp
uv run main.py
```

#### Terminal 2: Start Restaurant Voice Agent
```bash
cd Coral-RestaurantVoice-Agent
uv run main.py dev
```

#### Terminal 3: Start UI Frontend
```bash
cd UI
npm run dev
```



### How to Connect to UI:

<details>

<summary>Click to expand UI app running instructions</summary>

- Access the Application: Open your browser and navigate to the UI application (typically http://localhost:3000)

- Try Now Button: Click the "Try Now" button to be directed to the main page

![Prosus Demo 1](images/prosus-demo-img1.png)

- Start Conversation: On the main page, press the "Start Restaurant Conversation" button for the restaurant agent

![Prosus Demo 2](images/prosus-demo-img2.png)

- Interact: You can now chat with the agentic system for restaurant-related queries and interactions

</details>

### How to use:

<summary>Click to expand sample input/output</summary>

<details>

#### 1. Input

```bash
Greet the restaurant agent by saying "Hi!".  
You can message the interface agent like this:  
Ask the restaurant agent to tell you the menu for the restaurant.  

You can also talk directly to the restaurant agent using voice, but only when it is not using the "wait for mentions" tool.
```

#### 2. Output

```bash
The restaurant agent will greet you and listen to your queries.  

When using the interface agent, it will communicate with the restaurant agent through Coral tools. The restaurant agent will reply to the interface agent.

For speech-based interaction, you need to talk to the restaurant agent directly.
```
</details>

</details>
<details>

<summary>Option 3: Running in Dev Mode with Coral Studio</summary>

If you want to run the Agent using [Coral-Studio UI](https://github.com/Coral-Protocol/coral-studio) you can do so but it may not support Voice input and outputs from the UI and only the messages sent using Coral tools will be visible.You
clone it and run it according to the instructions in the readme and run these two agents in your terminal.

[Interface Agent](https://github.com/Coral-Protocol/Coral-Interface-Agent) | [Restaurant Voice Agent](https://github.com/Coral-Protocol/Coral-RestaurantVoice-Agent)

</details>

### Support 

If you have any questions about anything you can join our discord here, and put something in the dev support channel, if you beleivie it to be a bug or a feate that you want you can add it as a github issue: [Discord](https://discord.com/invite/Xjm892dtt3)

