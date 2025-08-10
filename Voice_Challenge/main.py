from fastapi import FastAPI, WebSocket
import json
from vosk import Model, KaldiRecognizer
from scam_detector import detect_scam

app = FastAPI()

model = Model("vosk-model-small-es-0.42")  # Verifica que esta ruta sea correcta

@app.websocket("/ws/audio")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    rec = None
    result_text = ""

    try:
        while True:
            data = await websocket.receive_bytes()
            print(f"Recibidos {len(data)} bytes de audio")  # Imprime tamaño del audio recibido

            if not rec:
                rec = KaldiRecognizer(model, 16000)

            if rec.AcceptWaveform(data):
                res = json.loads(rec.Result())
                text_final = res.get("text", "")
                print(f"Texto final reconocido: '{text_final}'")  # Imprime texto final reconocido

                result_text += text_final + " "

                label, rationale = detect_scam(text_final)

                await websocket.send_text(json.dumps({
                    "partial": result_text.strip(),
                    "label": label,
                    "rationale": rationale
                }))

            else:
                partial_res = json.loads(rec.PartialResult())
                text_parcial = partial_res.get("partial", "")
                print(f"Texto parcial reconocido: '{text_parcial}'")  # Imprime texto parcial reconocido

                label, rationale = detect_scam(text_parcial)

                await websocket.send_text(json.dumps({
                    "partial": text_parcial,
                    "label": label,
                    "rationale": rationale
                }))

    except Exception as e:
        print(f"Error en WebSocket: {e}")
        await websocket.close()
