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
    // Prod.
}

app.get("/", (req, res) => {
    if (req.session.twitchUsername) {
        res.send(`Hi ${req.session.twitchUsername}`);
    } else {
        res.redirect("/testing-oauth-flow");
    }
});

import { resolve } from "path";
app.get("/testing-oauth-flow", (_, res) => {
    res.sendFile(resolve("./src/oauth-test/index.html"));
});

import { clientSecret, clientId, redirectUri } from "../sens/creds.json";
import fetch from "node-fetch";

declare module 'express-session' {
    interface SessionData {
      twitchUsername: string;
    }
  }

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

    res.redirect("/");

});

import startServer from "./startServer";
import { POINT_CONVERSION_COMPRESSED } from "node:constants";
startServer(app);