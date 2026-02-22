const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const express = require("express");

const app = express();
app.use(express.json());

const apiId = parseInt(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;

let client;
let stringSession = new StringSession("");

app.get("/", (req, res) => {
  res.send("Login Mode Aktif");
});

app.post("/start-login", async (req, res) => {
  const { phone } = req.body;

  client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.connect();
  await client.sendCode(
    { apiId, apiHash },
    phone
  );

  res.json({ message: "Kode OTP dikirim ke Telegram" });
});

app.post("/verify-code", async (req, res) => {
  const { phone, code } = req.body;

  await client.signIn({
    phoneNumber: phone,
    phoneCode: code,
  });

  const sessionString = client.session.save();

  res.json({
    message: "Login berhasil",
    stringSession: sessionString,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server Login Mode Aktif");
});
