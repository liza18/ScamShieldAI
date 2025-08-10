export async function getElevenLabsTTS(text) {
  const apiKey = "sk_450dde72973f75305415e61276a75dd74d0813da8835fadd"; // Pon aquí tu API key
  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Voz en inglés por defecto, puedes cambiar

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: text,
      voice_settings: { stability: 0.75, similarity_boost: 0.75 },
    }),
  });

  if (!response.ok) {
    throw new Error("Error al llamar a ElevenLabs TTS");
  }

  const audioBlob = await response.blob();
  return URL.createObjectURL(audioBlob); // Retorna URL para usar en audio src
}
