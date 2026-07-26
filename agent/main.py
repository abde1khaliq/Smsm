import json
import httpx
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

MODEL = "llama3.2:3b"

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def event_generator():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": MODEL,
                    "messages": [{"role": "user", "content": req.message}],
                    "stream": True,
                    "keep_alive": "30m",
                },
            ) as response:
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    chunk = json.loads(line)
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content

    return StreamingResponse(event_generator(), media_type="text/plain")


@app.get("/health")
async def health():
    async with httpx.AsyncClient(timeout=5) as client:
        try:
            r = await client.get(f"{OLLAMA_URL}/api/tags")
            return {"ollama": "up" if r.status_code == 200 else "down"}
        except Exception:
            return {"ollama": "down"}
