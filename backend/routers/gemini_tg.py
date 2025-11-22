import json
import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Request
from google import genai
from google.genai import types

router = APIRouter()
load_dotenv()
TOKEN = os.getenv("TELEGRAM")

if not TOKEN:
    raise RuntimeError("Missing env vars! Check your .env file.")


client = genai.Client(
    api_key=os.environ["GEMINI_API_KEY"],
    vertexai=False,
)

print("Starting Telegram webhook server...")


def gemini_transcribe_and_extract(audio_bytes: bytes):
    prompt = """
    Transkribiere die folgende Sprachnachricht (Deutsch). Es geht darum, dass du eine Hilfeanfrage von einem Senioren entgegennimmst, der Hilfe bei alltäglichen Aufgaben benötigt. Wir wollen die wichtigsten Informationen extrahieren, um die Anfrage zu kategorisieren und zu priorisieren. Wenn unklar ist was gefragt ist oder was die Person gesagt hat , gib beim Titel Unklar an und sonst Null.
    Extrahiere danach ein JSON:

    {
        "titel": "<kurzer Titel der Hilfeanfrage>",
        "name": "<Name der hilfesuchenden Person oder null>",
        "help_type": "<Einkaufen | Haushalt | Begleitung | Transport | Technik | Ärztlicher Notfall | verfollständige nach Kontext>",
        "address":"full address or null",
        "requested_time": "<Zeit oder null>",
        "urgency": "<low | medium | high>",
        "notes": "<kurze Zusammenfassung>"
    }

    Gib NUR gültige JSONs zurück.
    """

    resp = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            prompt,
            types.Part.from_bytes(data=audio_bytes, mime_type="audio/ogg"),
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    return json.loads(resp.text)


@router.post("/telegram-webhook")
async def telegram_webhook(req: Request):
    update = await req.json()
    msg = update.get("message") or {}
    file_obj = msg.get("voice") or msg.get("audio") or msg.get("document")
    if not file_obj:
        return {"ok": True}

    file_id = file_obj["file_id"]

    print("Received file_id:", file_id)

    r = requests.get(
        f"https://api.telegram.org/bot{TOKEN}/getFile",
        params={"file_id": file_id},
        timeout=10,
    )
    file_path = r.json()["result"]["file_path"]

    audio_url = f"https://api.telegram.org/file/bot{TOKEN}/{file_path}"
    audio_bytes = requests.get(audio_url, timeout=10).content

    print("Downloaded audio, size:", len(audio_bytes))

    data = gemini_transcribe_and_extract(audio_bytes)

    print("EXTRACTED:", data)

    # hier euer DB-create:
    # db.create_help_request(...data...)

    return {"ok": True}
