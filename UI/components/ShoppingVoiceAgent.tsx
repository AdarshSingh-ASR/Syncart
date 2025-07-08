import {
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  useVoiceAssistant,
  VoiceAssistantControlBar
} from "@livekit/components-react";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "../app/api/shopping-connection-details/route";
import TranscriptionBubble from "./TranscriptionBubble";

export function ShoppingVoiceAgent() {
  const [room] = useState(
    () =>
      new Room({
        adaptiveStream: true,
        dynacast: true,
      })
  );

  const onConnectButtonClicked = useCallback(async () => {
    const url = new URL(
      process.env.NEXT_PUBLIC_SHOPPING_CONN_DETAILS_ENDPOINT ?? "/api/shopping-connection-details",
      window.location.origin
    );
    // TODO: Need a different endpoint for the shopping agent - DONE
    const response = await fetch(url.toString());
    const connectionDetailsData: ConnectionDetails = await response.json();

    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  }, [room]);

  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);

    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);

  return (
    <RoomContext.Provider value={room}>
      <ShoppingAssistant onConnectButtonClicked={onConnectButtonClicked} />
    </RoomContext.Provider>
  );
}

function ShoppingAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="flex flex-col gap-4">
      {agentState === "disconnected" ? (
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={() => props.onConnectButtonClicked()}
        >
          Start Shopping Conversation
        </button>
      ) : (
        <>
          <div className="w-full">
            <TranscriptionBubble />
          </div>
          <div className="w-full">
            <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
          </div>
          <RoomAudioRenderer />
        </>
      )}
    </div>
  );
}

function ControlBar(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();

  return (
    <div className="flex items-center justify-center h-10">
       {agentState !== "disconnected" && agentState !== "connecting" && (
          <div className="flex items-center gap-2">
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <span className="text-sm">Stop</span>
            </DisconnectButton>
          </div>
        )}
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
} 