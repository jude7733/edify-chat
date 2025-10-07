from langchain_core.tools import create_retriever_tool, tool
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from vectorstore_functions import create_retriver
from knowledge_base import ALLOWED_TOPICS

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", task_type="RETRIEVAL_DOCUMENT"
)

retriever = create_retriver(embeddings, "edify-data")
allowed_topics_str = ", ".join(ALLOWED_TOPICS)

retriever_tool = create_retriever_tool(
    retriever,
    "retriever_tool",
    f"Search for information about {allowed_topics_str}. Use this tool to find relevant documents when users ask questions about these topics.",
)


@tool
def off_topic():
    """Catch all Questions NOT related to Edifydata's information"""
    return "Forbidden - do not respond to the user"


tools = [retriever_tool, off_topic]
