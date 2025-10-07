import os

from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
)
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader, WebBaseLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import dotenv

dotenv.load_dotenv()

current_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(current_dir, "data")
db_dir = os.path.join(current_dir, "db")


def prepare_company_data():
    documents = []

    # 1. Company website
    web_loader = WebBaseLoader(
        web_path=[
            "https://www.edifydata.com/",
            "https://technopark.in/company-details/6347?company=EDIFY%20DATASCIENCE%20(P)%20Ltd",
        ]
    )
    web_docs = web_loader.load()
    documents.extend(web_docs)

    text_files = [
        os.path.join(data_dir, f)
        for f in os.listdir(data_dir)
        if f.lower().endswith(".txt")
    ]

    pdf_files = [
        os.path.join(data_dir, f)
        for f in os.listdir(data_dir)
        if f.lower().endswith(".pdf")
    ]
    # 2. txt files
    for text_path in text_files:
        text_loader = TextLoader(text_path)
        text_docs = text_loader.load()
        documents.extend(text_docs)

    # 3. Pdf files
    for pdf_path in pdf_files:
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
            chunk_size=300,
            chunk_overlap=50,
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
        search_type="similarity_score_threshold",
        search_kwargs={"score_threshold": 0.5, "k": 3},
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
