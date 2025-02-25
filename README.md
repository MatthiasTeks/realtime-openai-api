# Realtime AI Voice Assistant with Next.js

This project is a demo implementation of a realtime AI voice assistant built with Next.js, TailwindCSS, and OpenAI’s cutting-edge realtime API. The goal is to enable hands-free, efficient interaction by letting you speak your prompts and receive real-time transcriptions and responses from the AI.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Additional Resources](#additional-resources)

---

## Features

- **Realtime Voice Connection:** Establish a secure WebRTC connection to stream audio from your microphone and receive audio responses from the AI assistant.
- **Live Transcription:** Dynamically update the conversation transcript with both your spoken input and the AI’s responses.
- **Session Management:** Uses an ephemeral token retrieved from OpenAI to secure API calls.

---

## Installation

1. **Clone the repository:**

```bash
   git clone https://github.com/yourusername/realtime-ai-voice-assistant.git
   cd realtime-ai-voice-assistant
```

2. **Install dependencies:**
   
```bash
  npm install
```

3. **Create a .env file in the root directory and add your OpenAI API key:**
```bash
  OPENAI_API_KEY=sk-yoursupersecretkey
```

## Usage
1. **Run the development server:**
```bash
  npm install
```

2. **Open your browser and navigate to:**
```bash
  http://localhost:3000/realtime
```

## Project Structure
```bash
realtime-ai-voice-assistant/
├── app/
│   ├── api/
│   │   └── openai/
│   │       └── token/
│   │           └── route.ts       # API route to fetch an ephemeral token from OpenAI
│   ├── realtime/
│   │   ├── components/
│   │   │   └── VoiceAssistant.tsx # Core component handling voice connection and transcription
│   │   └── page.tsx               # Page rendering the VoiceAssistant component
├── services/
│   └── openai/
│       └── token.ts               # Helper function to retrieve the ephemeral token
├── .env                         # Environment variables (not committed)
├── package.json
└── README.md
```

## Additional Resources
For more advanced usage and to explore the full potential of the OpenAI Realtime API, please check out the OpenAI documentation (https://platform.openai.com/docs/guides/realtime-model-capabilities). The docs provide detailed information on how to set specific instructions, send out-of-context messages, combine written prompts with voice commands, and much more.
