from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from generator import generate_research_stream

load_dotenv()

app = FastAPI(title="Adecos MVP API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    niche: str

class ChatRequest(BaseModel):
    messages: list

@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Adecos MVP Backend"}

@app.post("/api/research/stream")
async def stream_research(request: ResearchRequest):
    return StreamingResponse(
        generate_research_stream(request.niche),
        media_type="application/x-ndjson"
    )

@app.post("/api/chat/stream")
async def stream_chat(request: ChatRequest):
    """
    LEGACY endpoint for conversational interface.
    Accepts history, routes intent, and streams back 'type: table' or 'type: text'.
    For the new AI Agent feature, use /api/agent/chat instead.
    """
    from generator import generate_chat_stream
    return StreamingResponse(
        generate_chat_stream(request.messages),
        media_type="application/x-ndjson"
    )

@app.post("/api/agent/chat")
async def agent_chat(request: ChatRequest):
    """
    NEW AI Agent endpoint with crewAI-powered workflow.
    
    Features:
    - Multi-agent orchestration (Router, Analyst, Narrator)
    - Dynamic chart/table rendering
    - Narrative introductions before data
    - Conversation context preservation
    
    Returns response types:
    - composite: narrative + chart/table sections
    - chart: chart data with config
    - table: tabular data
    - text: plain text/markdown
    """
    from generator import generate_agent_stream
    return StreamingResponse(
        generate_agent_stream(request.messages),
        media_type="application/x-ndjson"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

