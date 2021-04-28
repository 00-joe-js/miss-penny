import { SSL_URL, SSL_FILE_CONTENTS } from "../../sens/env.json";
import { join } from "path";
import { promises as fs } from "fs";

import type { Express } from "express";

export default (expressApp: Express) => {
    expressApp.get(SSL_URL, async (req, res, next) => {
        const tempFilePath = join(__dirname, `${Math.floor(Math.random() * 10000)}_${Date.now()}.txt`);
        await fs.writeFile(tempFilePath, SSL_FILE_CONTENTS, "utf-8");
        res.sendFile(tempFilePath);
        res.on("end", () => {
            fs.unlink(tempFilePath);
        });
    });
};