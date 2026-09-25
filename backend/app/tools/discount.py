from langchain_core.tools import tool


@tool
def calculate_discount(price: float, discount_percent: float) -> dict:
    """Calculate discount amount and final price after discount."""

    discount_amount = price * (discount_percent / 100)
    final_price = price - discount_amount

    return {
        "price": price,
        "discount_percent": discount_percent,
        "discount_amount": round(discount_amount, 2),
        "final_price": round(final_price, 2),
    }