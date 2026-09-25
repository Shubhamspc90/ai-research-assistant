from langchain_core.tools import tool


@tool
def calculate_gst(amount: float, gst_rate: float) -> dict:
    """Calculate GST amount and total amount including GST."""

    gst_amount = amount * (gst_rate / 100)
    total_amount = amount + gst_amount

    return {
        "amount": amount,
        "gst_rate": gst_rate,
        "gst_amount": round(gst_amount, 2),
        "total_amount": round(total_amount, 2),
    }