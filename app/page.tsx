"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import { useCallback, useEffect, useState } from "react";
import { MediaDeviceFailure } from "livekit-client";
import type { ConnectionDetails } from "./api/connection-details/route";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import { CloseIcon } from "@/components/CloseIcon";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function Page() {
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(
    undefined
  );
  const [agentState, setAgentState] = useState<AgentState>("disconnected");
  const [showModal, setShowModal] = useState(false);
  const [userKey, setUserKey] = useState("");
  const [timer, setTimer] = useState(600); // Timer starts at 780 seconds (13 minutes)
  const [timerActive, setTimerActive] = useState(false);

  const validKey = "v77"; // Replace with your actual valid key

  // Start interview button click handler
  const onConnectButtonClicked = useCallback(() => {
    setShowModal(true);
  }, []);

  // Key submission and fetching connection details
  const handleKeySubmit = useCallback(() => {
    if (userKey !== validKey) {
      alert("Invalid access key. Please try again.");
      return;
    }

    setShowModal(false);
    const endpoint = process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT || "/api/connection-details";

    fetch(endpoint.startsWith("http") ? endpoint : `${window.location.origin}${endpoint}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((connectionDetailsData) => setConnectionDetails(connectionDetailsData))
      .catch((err) => {
        console.error("Error fetching connection details:", err);
        alert("Failed to fetch connection details. Please try again later.");
      });

    // Start the timer
    setTimerActive(true);
  }, [userKey]);

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      alert("Time's up!");
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Error handler for microphone access issues
  function onDeviceFailure(error?: MediaDeviceFailure) {
    console.error(error);
    alert(
      "Error acquiring microphone permissions. Please ensure you grant the necessary permissions in your browser and reload the tab."
    );
  }

  return (
    <main data-lk-theme="default" className="h-full grid content-center bg-[var(--lk-bg)]">
      <h1 className="text-center text-2xl font-bold mb-4">Mockster: Let's Begin</h1>

      <LiveKitRoom
        token={connectionDetails?.participantToken}
        serverUrl={connectionDetails?.serverUrl}
        connect={!!connectionDetails}
        audio={true}
        video={false}
        onMediaDeviceFailure={onDeviceFailure}
        onDisconnected={() => setConnectionDetails(undefined)}
        className="grid grid-rows-[2fr_1fr] items-center"
      >
        <SimpleVoiceAssistant onStateChange={setAgentState} />
        <ControlBar onConnectButtonClicked={onConnectButtonClicked} agentState={agentState} />
        <RoomAudioRenderer />
        <NoAgentNotification state={agentState} />
      </LiveKitRoom>

      {/* Voice Recorder and Timer */}
      {userKey === validKey && (
        <>
          <div className="mt-4 flex justify-center">
          </div>
          <div className="mt-4 text-center">
            <p>
              Time remaining: {Math.floor(timer / 60)}:
              {String(timer % 60).padStart(2, "0")}
            </p>
          </div>
        </>
      )}

      {/* Access Key Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Enter Access Key</h2>
            <input
              type="text"
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="Access Key"
            />
            <button onClick={handleKeySubmit}>Submit</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}

function SimpleVoiceAssistant({ onStateChange }: { onStateChange: (state: AgentState) => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  return (
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        options={{ minHeight: 24 }}
      />
    </div>
  );
}

function ControlBar({
  onConnectButtonClicked,
  agentState,
}: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
}) {
  return (
    <div className="relative h-[100px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, top: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 1, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="uppercase absolute left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black rounded-md"
            onClick={onConnectButtonClicked}
          >
            Start Interview
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, top: "10px" }}
            animate={{ opacity: 1, top: 0 }}
            exit={{ opacity: 0, top: "-10px" }}
            transition={{ duration: 0.4, ease: [0.09, 1.04, 0.245, 1.055] }}
            className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center"
          >
            <VoiceAssistantControlBar controls={{ leave: false }} />
            <DisconnectButton>
              <CloseIcon />
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
