import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import numpy as np

# get historical stock data
df = yf.download("AAPL", period="60d")

# create features
df["Return"] = df["Close"].pct_change()
df["Volatility"] = df["Return"].rolling(window=5).std()
df["Target"] = (df["Close"].shift(-1) > df["Close"]).astype(int)

df = df.dropna()
X = df[["Return", "Volatility"]]
y = df["Target"]

# normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# split and train
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=0)

model = LogisticRegression()
model.fit(X_train, y_train)

# create mesh grid for plotting
x_min, x_max = X_scaled[:, 0].min() - 1, X_scaled[:, 0].max() + 1
y_min, y_max = X_scaled[:, 1].min() - 1, X_scaled[:, 1].max() + 1
xx, yy = np.meshgrid(np.linspace(x_min, x_max, 300), np.linspace(y_min, y_max, 300))

# predict on each point in grid
Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)

# plotting
plt.figure(figsize=(8, 6))
plt.contourf(xx, yy, Z, alpha=0.3, cmap=plt.cm.coolwarm)
plt.scatter(X_scaled[:, 0], X_scaled[:, 1], c=y, cmap=plt.cm.coolwarm, edgecolors='k')
plt.xlabel("Return (scaled)")
plt.ylabel("Volatility (scaled)")
plt.title("Decision Boundary: AAPL Up/Down Classifier")
plt.show()
