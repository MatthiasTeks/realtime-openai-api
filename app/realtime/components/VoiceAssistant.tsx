'use client';
import { getToken } from '@/services/openai/token';
import React, { useRef, useState } from 'react';

export default function VoiceAssistant() {
  const [connected, setConnected] = useState(false);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const [messages, setMessages] = useState<{ from: string; text: string }[]>(
    []
  );

  function handleServerEvent(e: MessageEvent) {
    try {
      const event = JSON.parse(e.data);

      // Switch based on the type of event received
      switch (event.type) {
        // 1. Handle partial updates for the user's message
        case 'response.text.delta': {
          const deltaText = event.delta;
          setMessages(prev => {
            // If the last message is a user message and it's still updating,
            // append the new text, otherwise, create a new entry.
            if (
              prev[prev.length - 1]?.from === 'user' &&
              !event.response?.completed
            ) {
              const updatedText = prev[prev.length - 1].text + deltaText;
              const newArr = [...prev];
              newArr[newArr.length - 1] = { from: 'user', text: updatedText };
              return newArr;
            } else {
              return [...prev, { from: 'user', text: deltaText }];
            }
          });
          break;
        }

        // 2. Finalize the user's message when it's complete
        case 'response.text.done': {
          const finalText = event.response.output[0].text || '';
          setMessages(prev => {
            if (prev[prev.length - 1]?.from === 'user') {
              const newArr = [...prev];
              newArr[newArr.length - 1] = { from: 'user', text: finalText };
              return newArr;
            } else {
              return [...prev, { from: 'user', text: finalText }];
            }
          });
          break;
        }

        // 3. Handle partial updates for the assistant's response
        case 'response.text.delta.assistant': {
          const deltaText = event.delta;
          setMessages(prev => {
            // If the last message is from the assistant, append the new delta text,
            // otherwise, add a new message entry.
            if (prev[prev.length - 1]?.from === 'assistant') {
              const updatedText = prev[prev.length - 1].text + deltaText;
              const newArr = [...prev];
              newArr[newArr.length - 1] = {
                from: 'assistant',
                text: updatedText,
              };
              return newArr;
            } else {
              return [...prev, { from: 'assistant', text: deltaText }];
            }
          });
          break;
        }

        // 4. Finalize the assistant's response when it's complete
        case 'response.done': {
          const fullText =
            event.response.output[0]?.content[0]?.transcript || '';
          setMessages(prev => {
            if (prev[prev.length - 1]?.from === 'assistant') {
              const newArr = [...prev];
              newArr[newArr.length - 1] = { from: 'assistant', text: fullText };
              return newArr;
            } else {
              return [...prev, { from: 'assistant', text: fullText }];
            }
          });
          break;
        }
      }
    } catch (err) {
      console.error('JSON parsing error:', err);
    }
  }

  async function init() {
    // 1. Retrieve the ephemeral token for authenticating the session with OpenAI.
    const EPHEMERAL_KEY = await getToken();

    // 2. Create a new RTCPeerConnection instance to manage the WebRTC connection.
    const peer = new RTCPeerConnection();
    peerRef.current = peer;

    // 3. Create an audio element that will play the incoming audio stream from the assistant.
    const audioIa = document.createElement('audio');
    audioIa.autoplay = true;
    peer.ontrack = e => {
      audioIa.srcObject = e.streams[0];
    };

    // 4. Capture the audio stream from the user's microphone.
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    localStream.getTracks().forEach(track => peer.addTrack(track, localStream));

    // 5. Create a data channel for exchanging messages (commands, updates, etc.) with the assistant.
    const dataChannel = peer.createDataChannel('oai-events');
    dataChannelRef.current = dataChannel;

    // 6. Prepare the SDP (Session Description Protocol) exchange.
    // Create an SDP offer that describes your connection capabilities (audio, data channel, etc.).
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    // 7. Send the SDP offer to OpenAI's realtime API to receive an SDP answer.
    // The ephemeral token is used here to authenticate this exchange.
    const baseUrl = 'https://api.openai.com/v1/realtime';
    const model = 'gpt-4o-realtime-preview';
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        'Content-Type': 'application/sdp',
      },
    });

    // 8. Retrieve the SDP answer and set it as the remote description for the connection.
    const answer = {
      type: 'answer',
      sdp: await sdpResponse.text(),
    };
    await peer.setRemoteDescription(answer as RTCSessionDescriptionInit);

    // 9. Once the data channel opens, we consider the connection established.
    // We then send an initial message to the assistant to set the session instructions.
    dataChannel.addEventListener('open', () => {
      setConnected(true);
      console.log('🔔 DataChannel is open!');
      dataChannel.send(
        JSON.stringify({
          type: 'session.update',
          session: {
            instructions:
              'You are a francophone AI assistant. Always respond in French.',
          },
        })
      );
    });

    console.log('🔔 WebRTC connection established. The AI can now speak.');
  }

  return (
    <div className="p-4 border border-gray-300 rounded">
      {!connected ? (
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          onClick={init}
        >
          Start Conversation
        </button>
      ) : (
        <p className="text-green-700 font-bold">
          ✔ Connection established. Speak into your mic…
        </p>
      )}

      <div className="mt-4 p-2 border border-gray-300 rounded">
        <h2 className="font-bold mb-2">Conversation:</h2>
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <strong>{m.from === 'user' ? 'You' : 'AI'}: </strong>
            <span>{m.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
