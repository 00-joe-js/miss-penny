import { Router, static as expressStatic } from "express";
import {join} from "path";

const gummyDuckSection = Router();
export default gummyDuckSection;

const actualDir = join(__dirname, "../../../src/gummyDuck");
gummyDuckSection.get("/", (req, res) => res.sendFile(join(actualDir, "index.html")));
