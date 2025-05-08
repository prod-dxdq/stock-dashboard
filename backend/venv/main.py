from fastapi import FastAPI
from pydantic import BaseModel
import yfinance as yf
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Only allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StockHolding(BaseModel):
    symbol: str
    shares: float
    buyPrice: float

class Portfolio(BaseModel):
    holdings: list[StockHolding]

@app.post("/portfolio/value")
def get_portfolio_value(portfolio: Portfolio):
    total_value = 0.0
    for stock in portfolio.holdings:
        price = yf.Ticker(stock.symbol).info.get("regularMarketPrice", 0)
        total_value += stock.shares * price
    return {"totalValue": round(total_value, 2)}

@app.post("/portfolio/prices")
def get_prices(portfolio: Portfolio):
    prices = {}
    for stock in portfolio.holdings:
        ticker = yf.Ticker(stock.symbol)
        price = ticker.info.get("regularMarketPrice", 0)
        prices[stock.symbol] = price
    return {"prices": prices}