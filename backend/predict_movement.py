import yfinance as yf
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

# download past 60 days of AAPL data
ticker = "AAPL"
df = yf.download(ticker, period="60d", interval="1d")

print(df.tail())

# create daily return
df["Return"] = df["Close"].pct_change()

# create label: 1 if price went up day, else 0
df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)

# drop NA rows created by shift/pct_change
df = df.dropna()

# split the data
x = df[["Return"]]
y = df["Target"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# train the model
model = LogisticRegression()
model.fit(X_train, y_train)

# evaluate the model
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))