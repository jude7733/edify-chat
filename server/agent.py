from typing import Annotated, Literal, TypedDict
from uuid import uuid4
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START
from langgraph.prebuilt import ToolNode
from langchain.chat_models import init_chat_model
import pprint
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver
from utils import load_system_prompt
from custom_tools import tools


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


def agent(state):
    messages = state["messages"]

    system_prompt = load_system_prompt()
    messages = state.get("messages", [])

    if not any(
        isinstance(msg, SystemMessage)
        or (isinstance(msg, dict) and msg.get("role") == "system")
        for msg in messages
    ):
        messages.insert(0, SystemMessage(content=system_prompt))

    llm = init_chat_model("gemini-2.5-flash", model_provider="google_genai")
    model = llm.bind_tools(tools)
    response = model.invoke(messages)
    return {"messages": [response]}


def should_continue(state) -> Literal["tools", "__end__"]:
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return "__end__"


workflow = StateGraph(AgentState)

workflow.add_node("agent", agent)

tool_node = ToolNode(tools)
workflow.add_node("tools", tool_node)
workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
)
workflow.add_edge("tools", "agent")

sqlite_connection = sqlite3.connect("checkpoint.sqlite", check_same_thread=False)
memory = SqliteSaver(sqlite_connection)

graph = workflow.compile(checkpointer=memory)


if __name__ == "__main__":
    thread_id = str(uuid4())
    print("starting chat at thread", thread_id)
    config = {"configurable": {"thread_id": thread_id}}
    while True:
        input_text = input("\nEnter your question (or type 'exit' to quit): ")
        if input_text.lower() == "exit":
            break
        events = graph.stream(
            input={"messages": [HumanMessage(content=input_text)]},
            stream_mode="updates",
            config=config,
        )
        for event in events:
            pprint.pprint(event, indent=2)
