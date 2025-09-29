import os
import re

from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
)
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import dotenv

dotenv.load_dotenv()

current_dir = os.path.dirname(os.path.abspath(__file__))
text_path = os.path.join(current_dir, "data", "expertise.txt")
pdf_path = os.path.join(current_dir, "data", "linkedin-data.pdf")
db_dir = os.path.join(current_dir, "db")


def prepare_company_data():
    documents = []
    if not os.path.exists(text_path):
        raise FileNotFoundError(
            f"The file {text_path} does not exist. Please check the path."
        )

    # 1. Company website
    web_loader = WebBaseLoader("https://www.edifydata.com/")
    web_docs = web_loader.load()
    for doc in web_docs:
        doc.page_content = re.sub(r"\s+", " ", doc.page_content).strip()
    documents.extend(web_docs)

    # 2. Company info text files
    text_loader = TextLoader(text_path)
    text_docs = text_loader.load()
    documents.extend(text_docs)

    # 3. PDFs about services
    pdf_loader = PyPDFLoader(pdf_path)
    pdf_docs = pdf_loader.load()
    documents.extend(pdf_docs)

    return documents


def create_vector_store(embeddings, store_name: str):
    persistent_directory = os.path.join(db_dir, store_name)

    if not os.path.exists(persistent_directory):
        print(f"\n--- Creating vector store {store_name} ---")
        documents = prepare_company_data()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=200,
            length_function=len,
        )
        splits = text_splitter.split_documents(documents)

        Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            persist_directory=persistent_directory,
        )
        print(f"--- Finished creating vector store {store_name} ---")
    else:
        print(f"--- Vector store {store_name} already exists ---")


def create_retriver(embeddings, store_name: str):
    persistent_directory = os.path.join(db_dir, store_name)

    if not os.path.exists(persistent_directory):
        create_vector_store(embeddings, store_name)

    db = Chroma(
        persist_directory=persistent_directory,
        embedding_function=embeddings,
    )
    retriever = db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 3, "score_threshold": 0.5},
    )
    return retriever


def query_vector_store(store_name, query, embedding_function):
    print(f"--- searching: {query}. ---")
    persistent_directory = os.path.join(db_dir, store_name)

    if not os.path.exists(persistent_directory):
        print(f"--- Vector store {store_name} does not exist. ---")
        create_vector_store(embedding_function, store_name)
    print(f"\n--- Querying the Vector Store {store_name} ---")
    db = Chroma(
        persist_directory=persistent_directory,
        embedding_function=embedding_function,
    )
    retriever = db.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 3, "score_threshold": 0.5},
    )
    relevant_docs = retriever.invoke(query)

    # Display the relevant results with metadata
    print(f"\n--- Relevant Documents for {store_name} ---")
    for i, doc in enumerate(relevant_docs, 1):
        print(f"Document {i}:\n{doc.page_content}\n")
        if doc.metadata:
            print(f"Source: {doc.metadata.get('source', 'Unknown')}\n")

    return relevant_docs


if __name__ == "__main__":
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    query = "How to contact edify?"

    query_vector_store("edifydata", query, embeddings)
