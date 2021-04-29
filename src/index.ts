import express from "express";
const app = express();
app.get("/", (_, res) => res.send("Brb, gettin biscuits"));

import startServer from "./startServer";
startServer(app);