# ScamShieldAI

## Description

ScamShieldAI is a real-time call fraud detection system. It uses artificial intelligence to transcribe call audio and detect scam-related keywords, alerting the user visually and audibly.

The project consists of two main parts:

- **Backend:** FastAPI server that receives real-time audio, transcribes it with Vosk, and detects potential scams.
- **Frontend:** React app that captures microphone audio, streams it to the backend, and displays alerts and transcriptions.

---

## Installation and Setup

### Backend

1. Clone the repository:

```bash
git clone https://github.com/liza18/ScamShieldAI.git
cd ScamShieldAI/Voice_Challenge

2. Create and activate a virtual environment (optional but recommended):
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

3. Install dependencies:
pip install -r requirements.txt

4. Run the backend server:
uvicorn main:app --reload

Frontend
1. Navigate to the frontend folder:
cd ../voice-scam-monitor

2. Install dependencies:
npm install

3. Start the React app:
npm start

4. Open your browser at http://localhost:3000

//Usage
When you start a call in the frontend app, it captures microphone audio and sends it to the backend.
The backend transcribes and analyzes the audio to detect potential scams.
The interface displays real-time transcription and alert levels.
If fraud signals are detected, the app issues visual and voice alerts.

//Main Dependencies

Backend:
fastapi
uvicorn
vosk
websockets

Frontend:
react
elevenlabs text-to-speech API

//Team
Elizabeth Aguilar
Obed Casillas

//Important Notes
Configure your ElevenLabs API key securely; do not publish it in public repositories.
Ensure the backend is running before starting the frontend.
For best performance, use an updated browser with microphone permissions enabled.

Thank you for using ScamShieldAI! If you have questions or suggestions, feel free to open an issue!!!!!!!!!!!!
