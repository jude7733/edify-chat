from langchain.tools.retriever import create_retriever_tool
from langchain_core.tools import tool
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from vectorstore_functions import create_retriver
from knowledge_base import ALLOWED_TOPICS

embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

retriever = create_retriver(embeddings, "edify-data")
allowed_topics_str = ", ".join(ALLOWED_TOPICS)

retriever_tool = create_retriever_tool(retriever, "retriever_tool", allowed_topics_str)


@tool
def off_topic():
    """Catch all Questions NOT related to Edifydata's information"""
    return "Forbidden - do not respond to the user"


tools = [retriever_tool, off_topic]
