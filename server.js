const { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const express = require("express");
const cors = require("cors");

const app = express();

const apiId = parseInt(process.env.TG_API_ID);
const apiHash = process.env.TG_API_HASH;
const stringSession = new StringSession(process.env.STRING_SESSION);

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Server Telegram Aktif 🚀");
});

app.get("/api/contacts", async (req, res) => {
    try {
        if (!client.connected) {
            await client.connect();
        }

        const result = await client.invoke(
            new Api.contacts.GetContacts({ hash: 0 })
        );

        const contacts = result.users.map(user => ({
            id: user.id.toString(),
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            username: user.username || null,
            phone: user.phone || ""
        }));

        res.json({ success: true, data: contacts });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

const port = process.env.PORT || 3000;

app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await client.connect();
});
