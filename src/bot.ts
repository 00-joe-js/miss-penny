import type { ChatUserstate } from "tmi.js";

import { Client } from "tmi.js";
import { twitchToken, username, channels } from "../sens/creds.json";

import { pickFromAll } from "./misc/random-smash-ultimate-char";

const twitchChatBotClient = new Client({
    identity: {
        username,
        password: twitchToken
    },
    channels
});

twitchChatBotClient.on("connected", () => {
    twitchChatBotClient.on("message", handleMessage);
});

const commands: { [k: string]: () => string } = {
    "!smashRandom()": () => {
        return `You should play: ${pickFromAll().name}!`;
    }
};

const parseMessageToCommand = (messageText: string): Function | null => {
    if (messageText[0] !== "!") return null;
    const firstPart = messageText.split(" ")[0];
    if (!commands[firstPart]) {
        return null;
    } else {
        return commands[firstPart];
    }
};

const handleMessage = async (channel: string, userstate: ChatUserstate, message: string, self: boolean) => {
    if (self === true) return; // Do not handle messages sent from the bot.
    try {
        const command = parseMessageToCommand(message.trim());
        if (command !== null) {
            twitchChatBotClient.say("#joe_js", command());
        }
    } catch (e) {
        console.error(e);
    }
};

(async () => {
    try {
        console.log(await twitchChatBotClient.connect());
    } catch (e) {
        console.error(e);
    }
})();