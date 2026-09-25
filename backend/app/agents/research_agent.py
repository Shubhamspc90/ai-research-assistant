from langchain.agents import create_agent
from langchain_ollama import ChatOllama

from backend.app.config import (
    OLLAMA_API_KEY,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
)

from backend.app.tools.discount import calculate_discount
from backend.app.tools.gst import calculate_gst
from backend.app.tools.web_search import search_web


llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_BASE_URL,
    client_kwargs={
        "headers": {
            "Authorization": f"Bearer {OLLAMA_API_KEY}"
        }
    },
    temperature=0.1,
)


research_agent = create_agent(
    model=llm,
    tools=[
        search_web,
        calculate_gst,
        calculate_discount,
    ],
)