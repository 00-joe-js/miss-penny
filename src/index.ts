import { NODE_ENV, PORT, SSL_DIR, SSL_BUNDLE, SSL_CERT, SSL_KEY, SERVER_HOSTNAME } from "../sens/env.json";
import express from "express";
import establishSSLVerificationRoutes from "./sslVerification/index";

import {readFileSync} from "fs";
import {join} from "path";

const app = express();

app.get("/", (_, res) => res.send("Brb, gettin biscuits"));

import https from "https";
if (NODE_ENV === "production") {

    if (!SSL_DIR) throw new Error("No SSL directory specified.");

    const getSSLPath = (path: string) => join(SSL_DIR, path);
    const sslOptions = {
        cert: readFileSync(getSSLPath(SSL_CERT)),
        ca: readFileSync(getSSLPath(SSL_BUNDLE)),
        key: readFileSync(getSSLPath(SSL_KEY))
    };

    const server = https.createServer(sslOptions);
    server.on("request", app);
    server.listen(PORT, SERVER_HOSTNAME, () => {
        console.log(`Listening on ${PORT}`);
    });

    establishSSLVerificationRoutes(app);
} else {
    app.listen(PORT, () => console.log(`Here for you on ${PORT}`));
}