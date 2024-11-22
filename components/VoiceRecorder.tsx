import React, { useState, useEffect, useRef, useCallback } from "react";

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        audioChunksRef.current = [];
        stopMic();
      };

      mediaRecorderRef.current.start();
    } catch (error: any) {
      console.error("Error accessing microphone:", error);

      if (error.name === "NotAllowedError") {
        alert("Microphone access denied. Please grant permissions in your browser settings.");
      } else if (error.name === "NotFoundError") {
        alert("No microphone found. Please connect a microphone and try again.");
      } else {
        alert("An unexpected error occurred while accessing the microphone.");
      }
    }
  }, []);

  const stopMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    return () => {
      stopMic();
    };
  }, [isRecording, startRecording, stopMic]);

  const saveRecording = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.wav";
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => {
        window.location.href = "https://forms.gle/x3dZ83CkzvgmXAQr6";
      }, 3000);
    }
  };

  return (
    <div className="voice-recorder">
      <button
        onClick={() => setIsRecording(!isRecording)}
        style={{
          backgroundColor: isRecording ? "#ff6347" : "#4caf50",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
      {audioBlob && !isRecording && (
        <button
          onClick={saveRecording}
          style={{
            backgroundColor: "#4caf50",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Save Recording
        </button>
      )}
    </div>
  );
};

export default VoiceRecorder;
