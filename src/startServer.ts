import { NODE_ENV, PORT, SSL_DIR, SSL_BUNDLE, SSL_CERT, SSL_KEY, SERVER_HOSTNAME } from "../sens/env.json";
import establishSSLVerificationRoutes from "./sslVerification/index";
import { readFileSync } from "fs";
import { join } from "path";
import http from "http";
import https from "https";

import type { Express } from "express";

const setUpHTTPRedirectionServer = () => {
    const server = http.createServer((req, res) => {
        res.writeHead(308, {
            Location: `https://joejs.live${req.url}`
        });
        res.end();
    });
    server.listen(80, () => console.log("Redirection server on 80."));
};

export default (app: Express) => {
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

        setUpHTTPRedirectionServer();
        establishSSLVerificationRoutes(app);

    } else {
        // Let Express set up the normal HTTP server.
        establishSSLVerificationRoutes(app);
        app.listen(80, () => console.log(`Here for you on 80`));
    }

};
