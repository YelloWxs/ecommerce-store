const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 5000;
const app = express();
require("./db");

const productRoute = require("./routes/product");
const authRoute = require("./routes/auth");

// === SÉCURITÉ : Gérer erreurs globales
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// === MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === CORS (autorise le frontend à accéder au backend)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // à restreindre en prod
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// === ROUTE DE TEST
app.get("/", (req, res) => {
  res.send("Backend is running as it should !");
});

// === ROUTES API
app.use("/api/v1/", productRoute);
app.use("/api/v1/user", authRoute);

// === PRODUCTION (serve frontend depuis le backend si nécessaire)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
  });
}

// === LANCEMENT DU SERVEUR
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
