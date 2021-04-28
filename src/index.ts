import { PORT } from "../sens/env.json";
import express from "express";
import establishSSLVerificationRoutes from "./sslVerification/index";

const app = express();
establishSSLVerificationRoutes(app);

app.get("/", (_, res) => res.send("Brb, gettin biscuits"));

app.listen(PORT, () => console.log(`goodness me you have a server on ${PORT}`));