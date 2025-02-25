import VoiceAssistant from "./components/VoiceAssistant";

export default function RealtimePage() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Realtime AI Voice Assistant</h1>
      <p>This page connects to OpenAI's realtime API to power your AI assistant.</p>
      <VoiceAssistant />
    </div>
  );
}