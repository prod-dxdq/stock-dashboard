from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yfinance as yf
import pandas as pd
from sklearn.linear_model import LogisticRegression
from fastapi.responses import StreamingResponse
from fastapi import Query
import io


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
        try:
            ticker = yf.Ticker(stock.symbol)
            history = ticker.history(period="1d")
            price = history["Close"].iloc[-1] if not history.empty else 0
            prices[stock.symbol] = price
        except Exception as e:
            prices[stock.symbol] = 0  # Default to 0 if there's an error
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

    # Create features
    df["Return"] = df["Close"].pct_change()
    df["Volatility"] = df["Return"].rolling(window=5).std()
    df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
    df = df.dropna()

    if len(df) < 20:
        return {"error": "Not enough data for symbol"}

    # Features and target
    X = df[["Return", "Volatility"]]
    y = df["Target"]

    # Train the model
    model = LogisticRegression()
    model.fit(X, y)

    # Predict for the latest data point
    latest_features = X.iloc[-1].values.reshape(1, -1)
    prediction = model.predict(latest_features)[0]
    confidence = model.predict_proba(latest_features)[0][prediction]

    return {
        "symbol": symbol,
        "prediction": "up" if prediction == 1 else "down",
        "confidence": round(confidence * 100, 2)
    }

@app.get("/symbols")
def get_symbols():
    return {"symbols": TICKERS}

@app.get("/plot/decision-boundary/{symbol}")
def get_decision_boundary(symbol: str):
    import yfinance as yf
    import pandas as pd
    import numpy as np
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler
    import matplotlib.pyplot as plt
    import io

    df = yf.download(symbol, period="60d", interval="1d")

    df["Return"] = df["Close"].pct_change()
    df["Volatility"] = df["Return"].rolling(window=5).std()
    df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
    df = df.dropna()

    if len(df) < 20:
        return {"error": "Not enough data for symbol"}

    X = df[["Return", "Volatility"]]
    y = df["Target"]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = LogisticRegression()
    model.fit(X_scaled, y)

    # Grid for boundary
    x_min, x_max = X_scaled[:, 0].min() - 1, X_scaled[:, 0].max() + 1
    y_min, y_max = X_scaled[:, 1].min() - 1, X_scaled[:, 1].max() + 1
    xx, yy = np.meshgrid(np.linspace(x_min, x_max, 300), np.linspace(y_min, y_max, 300))

    Z = model.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)

    # Plot
    fig, ax = plt.subplots()
    ax.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
    ax.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y, edgecolors='k', cmap=plt.cm.coolwarm)
    ax.set_xlabel("Return (scaled)")
    ax.set_ylabel("Volatility (scaled)")
    ax.set_title(f"Decision Boundary: {symbol}")

    # Add legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='blue', edgecolor='k', label='Price Down'),
        Patch(facecolor='red', edgecolor='k', label='Price Up')
    ]
    ax.legend(handles=legend_elements, loc='upper right')

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@app.get("/suggestions")
def get_buy_suggestions():
    suggestions = []

    for symbol in TICKERS:
        try:
            df = yf.download(symbol, period="60d", interval="1d")
            df["Return"] = df["Close"].pct_change()
            df["Volatility"] = df["Return"].rolling(window=5).std()
            df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)
            df = df.dropna()

            if len(df) < 20:
                continue

            X = df[["Return", "Volatility"]]
            y = df["Target"]

            model = LogisticRegression()
            model.fit(X, y)

            latest = X.iloc[-1].values.reshape(1, -1)
            proba = model.predict_proba(latest)[0][1]  # probability of 'up'

            suggestions.append({
                "symbol": symbol,
                "confidence": round(proba * 100, 2)
            })

        except:
            continue

    suggestions.sort(key=lambda x: x["confidence"], reverse=True)
    return suggestions[:5]  # top 5 suggestions

@app.get("/screener/filter")
def screen_stocks(
    price_min: float = Query(0),
    price_max: float = Query(1_000_000),
    change_min: float = Query(-100),
    change_max: float = Query(100)
):
    results = []

    for symbol in TICKERS:
        try:
            ticker = yf.Ticker(symbol)
            df = ticker.history(period="2d")

            if len(df) < 2:
                continue

            latest = df.iloc[-1]
            prev = df.iloc[-2]

            price = latest["Close"]
            change_pct = ((latest["Close"] - prev["Close"]) / prev["Close"]) * 100

            if price_min <= price <= price_max and change_min <= change_pct <= change_max:
                results.append({
                    "symbol": symbol,
                    "price": round(price, 2),
                    "changePct": round(change_pct, 2)
                })

        except Exception as e:
            print(f"Error with {symbol}: {e}")
            continue

    return {"results": results}
