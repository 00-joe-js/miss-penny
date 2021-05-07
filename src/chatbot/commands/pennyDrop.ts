import client from "../../redis";
import { Chance } from "chance";
const c = Chance();

import path from "path";
import fs from "fs";
const choices = fs.readdirSync(path.resolve("./sens/penny-drop-pics"));

export default async () => {
    // Add a random Penny image and xPosition to drop directly into the Redis key.
    const perc = c.integer({ min: 0, max: 90 });
    await client.set(
        `pennyDrop${Date.now()}${perc}`,
        JSON.stringify({ xPosition: perc, source: `/penny-drop/${c.pickone(choices)}` })
    );
};