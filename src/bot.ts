import type { ChatUserstate } from "tmi.js";

import { Client } from "tmi.js";
import { twitchToken, username, channels } from "../sens/creds.json";

import smashRandom from "./commands/smashRandom";

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

const commands: { [k: string]: (opts: any) => string } = {
    "!smashRandom": smashRandom
};

const spaces = /\s/gi;
const parseParameters = (messageText: string) => {
    messageText = messageText.replace(spaces, "");
    const openParenPos = messageText.indexOf("(");
    const closeParenPos = messageText.indexOf(")");
    const parametersString = messageText.slice(openParenPos + 1, closeParenPos);
    return parametersString.split(",").reduce((o: { [key: string]: string }, s) => {
        const [key, value] = s.split("=");
        o[key] = value;
        return o;
    }, {});
};

const parseMessageToCommand = (messageText: string): Function | null => {
    if (messageText[0] !== "!") return null;
    const firstPart = messageText.split("(")[0];
    if (!commands[firstPart]) {
        return null;
    } else {
        const parameters = parseParameters(messageText);
        return commands[firstPart].bind(null, parameters);
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