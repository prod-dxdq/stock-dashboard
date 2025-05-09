from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
from sklearn.linear_model import LogisticRegression


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TICKERS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "JPM", "V", "DIS",
    "PEP", "KO", "MCD", "WMT", "NFLX", "BAC", "XOM", "UNH", "PFE", "NKE"
]

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

@app.get("/screener/gainers")
def top_gainers():
    results = []
    for ticker in TICKERS:
        try:
            stock = yf.Ticker(ticker)
            data = stock.history(period="1d")
            if len(data) > 1:
                open_price = data['Open'].iloc[0]
                close_price = data['Close'].iloc[-1]
                change_pct = ((close_price - open_price) / open_price) * 100
                results.append({"symbol": ticker, "change": round(change_pct, 2)})
        except:
            continue
    results.sort(key=lambda x: x["change"], reverse=True)
    return results[:10]

@app.get("/predict/{symbol}")
def predict_stock_movement(symbol: str):
    df = yf.download(symbol, period="60d", interval="1d")

    df["Return"] = df["Close"].pct_change()
    df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
    df = df.dropna()

    X = df[["Return"]]
    y = df["Target"]

    model = LogisticRegression()
    model.fit(X, y)

    latest_return = df["Return"].iloc[-1]
    prediction = model.predict([[latest_return]])[0]
    proba = model.predict_proba([[latest_return]])[0][1]

    return {
        "symbol": symbol,
        "prediction": "up" if prediction == 1 else "down",
        "confidence": round(proba, 2)
    }

@app.get("/symbols")
def get_symbols():
    return {"symbols": TICKERS}