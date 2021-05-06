import { Router } from "express";
const randomizationRoutes = Router();
export default randomizationRoutes;

import { TOKEN_ISSUER_SECRET } from "../../sens/env.json";

import { createHash } from "crypto";
randomizationRoutes.get("/what-is-my-token", async (req, res, next) => {
    if (req.session.twitchUsername) {
        try {
            const hash = createHash("sha256");
            hash.update(`${req.session.twitchUsername || "joe_js"}::::${TOKEN_ISSUER_SECRET}`);
            res.contentType("text/plain").send(hash.digest("hex"));
        } catch (e) {
            next(e);
        }
    }
});