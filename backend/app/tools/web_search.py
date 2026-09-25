from ddgs import DDGS
from langchain_core.tools import tool


@tool
def search_web(query: str) -> list:
    """Search the web and return relevant search results."""

    search = DDGS()
    results = search.text(query, max_results=5)

    return results