import React, { useState, useEffect, useRef } from "react";
import { getElevenLabsTTS } from "../utils/elevenlabs";

export default function LiveTranscription() {
  const [transcription, setTranscription] = useState("");
  const [label, setLabel] = useState("Safe");
  const [rationale, setRationale] = useState("");
  const ws = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8000/ws/audio");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTranscription(data.partial || "");
      setLabel(data.label || "Safe");
      setRationale(data.rationale || "");
    };
    return () => ws.current.close();
  }, []);

  useEffect(() => {
    async function playAlert() {
      if (label === "Scam") {
        try {
          const audioUrl = await getElevenLabsTTS("Alerta: posible llamada de estafa detectada.");
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play();
          }
        } catch (error) {
          console.error("Error en alerta hablada:", error);
        }
      }
    }
    playAlert();
  }, [label]);

  return (
    <div>
      <h2>Monitoreo de Estafas en Vivo</h2>
      <p>Transcripción en vivo</p>
      <textarea value={transcription} readOnly rows={6} cols={50} />
      <p>Estado: {label}</p>
      <p>Razón: {rationale}</p>
      <audio ref={audioRef} />
    </div>
  );
}
