from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from uuid import uuid4
from agent import graph


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    user_input: str
    thread_id: str = str(uuid4())


@app.post("/chat")
async def chat_stream_endpoint(request: ChatRequest):
    """Streaming chat endpoint"""
    input_data = {"messages": [HumanMessage(content=request.user_input)]}
    print("thread_id:", request.thread_id)
    config = {"configurable": {"thread_id": request.thread_id}}

    graph_response = graph.invoke(input_data, config=config)
    result = graph_response["messages"][-1].content

    return StreamingResponse(result, media_type="text/plain")
