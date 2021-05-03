import express from "express";
import session from "express-session";
const app = express();

import { NODE_ENV } from "../sens/env.json";
if (NODE_ENV === "development") {
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));
} else {
    // TODO: set up prod session strategy -- DO NOT USE INMEMORY (redis)
}

import { clientSecret, clientId, redirectUri } from "../sens/creds.json";
import fetch from "node-fetch";

declare module 'express-session' {
    interface SessionData {
        twitchUsername: string;
    }
}

import { resolve } from "path";
app.use(express.static(resolve("./client-build")));
app.use("/assets/characterIcons/", express.static(resolve("./sens/icons")));

app.get("/", (req, res) => {
    res.sendFile(resolve("./client-build/index.html"));
});

const prefs = { whitelist: ["01", "02", "43"], blacklist: ["64", "34"] };
const updatePrefs = (currentPrefs: typeof prefs, characterId: string, prefState: { whitelist: boolean, blacklist: boolean }) => {
    if (prefState.whitelist === true && !currentPrefs.whitelist.includes(characterId)) {
        currentPrefs.whitelist.push(characterId);
    } else if (prefState.whitelist === false) {
        currentPrefs.whitelist = currentPrefs.whitelist.filter(v => v !== characterId);
    }
    if (prefState.blacklist === true && !currentPrefs.blacklist.includes(characterId)) {
        currentPrefs.blacklist.push(characterId);
    } else if (prefState.blacklist === false) {
        currentPrefs.blacklist = currentPrefs.blacklist.filter(v => v !== characterId);
    }
    return currentPrefs;
};
app.get("/twitch-user", (req, res) => {
    if (req.session.twitchUsername) {
        // TODO: think about other important auth info?
        res.json({ twitchUsername: req.session.twitchUsername, ...prefs });
    } else {
        res.json({ twitchUsername: null });
    }
});

app.get("/pop", (_, res) => res.json([3]));

app.get("/biscuit", async (req, res, next) => {

    // TODO: Check session info for existing valid Twitch user info
    // TODO: Implement refresh token here..ish

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

    // TODO: env this front-end URL!!!
    res.redirect("http://localhost:3000/"); // This client will ask for Twitch user info

});

app.use(express.json());
app.post("/submit-character-preference", (req, res) => {
    if (req.body.twitchUsername === "joe_js") {
        const updatedPreferences = updatePrefs(prefs, req.body.charId, req.body.prefState);
        res.send(updatedPreferences);
    } else {
        res.send("no");
    }
});

import startServer from "./startServer";
startServer(app);