import express from "express";
import session from "express-session";
const app = express();

import client, { getUserPrefs, setUserPrefs, updatePrefs, resetUserPrefs } from "./redis";

import { NODE_ENV, SESSION_SECRET, FRONT_END_URL } from "../sens/env.json";

import { clientSecret, clientId, redirectUri } from "../sens/creds.json";
import fetch from "node-fetch";

declare module 'express-session' {
    interface SessionData {
        twitchUsername: string;
    }
}

import { resolve } from "path";
app.get("/favicon.png", (_, res) => res.sendFile(resolve('./favicon.png')));
app.use(express.static(resolve("./client-build")));
app.use("/assets/characterIcons/", express.static(resolve("./sens/icons")));
app.get("/", (_, res) => res.sendFile(resolve("./client-build/index.html")));

import make from "connect-redis";
const RedisStore = make(session);
if (NODE_ENV === "development") {
    app.use(session({
        store: new RedisStore({ client: client.nodeRedis }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));
} else {
    app.use(session({
        store: new RedisStore({ client: client.nodeRedis }),
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }));
}

app.get("/twitch-user", async (req, res, next) => {
    try {
        if (req.session.twitchUsername) {
            const alreadyKnownUserPrefs = await getUserPrefs(req.session.twitchUsername);
            res.json({ twitchUsername: req.session.twitchUsername, ...alreadyKnownUserPrefs });
        } else {
            res.json({ twitchUsername: null });
        }
    } catch (e) {
        next(e);
    }
});
app.get("/twitch-user-logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect(FRONT_END_URL);
    });
});

app.get("/biscuit", async (req, res, next) => {

    if (!req.query.code) return next(new Error("Missing code from Twitch redirect"));

    const followUpUrl = `https://id.twitch.tv/oauth2/token
        ?client_id=${clientId}
        &client_secret=${clientSecret}
        &code=${req.query.code}
        &grant_type=authorization_code
        &redirect_uri=${redirectUri}
    `.replace(/\s/gi, "");

    const resFromTwitch = await fetch(followUpUrl, { method: "POST" });
    const data = await resFromTwitch.json();

    const token = data.access_token;

    const userDataRequest = await fetch(`https://api.twitch.tv/helix/users`, {
        headers: {
            "Client-Id": clientId,
            "Authorization": `Bearer ${token}`
        }
    });

    const userData = await userDataRequest.json();

    const twitchUsername = userData.data[0].login;
    req.session.twitchUsername = twitchUsername;

    res.redirect(FRONT_END_URL); // This client will ask for Twitch user info

});

app.get("/reset-my-preferences-please-thank-you-joe", async (req, res, next) => {
    try {
        if (req.session.twitchUsername) {
            await resetUserPrefs(req.session.twitchUsername);
            res.sendStatus(200);
        } else {
            res.sendStatus(401);
        }
    } catch (e) {
        next(e);
    }
});

app.use(express.json());
app.post("/submit-character-preference", async (req, res, next) => {
    try {
        const alreadyKnownUserPrefs = await getUserPrefs(req.body.twitchUsername);
        const updatedPreferences = updatePrefs(alreadyKnownUserPrefs, req.body.charId, req.body.prefState);
        await setUserPrefs(req.body.twitchUsername, updatedPreferences);
        res.send(updatedPreferences);
    } catch (e) { next(e) };
});

import startServer from "./startServer";
startServer(app);