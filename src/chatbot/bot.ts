import { ChatUserstate, client } from "tmi.js";

import { Client } from "tmi.js";
import { twitchToken, username, channels } from "../../sens/creds.json";

import joesWorkingOn from "./commands/joesWorkingOn";
import smashRandom from "./commands/smashRandom";
import shareArena from "./commands/shareArena";

const pennySay = (msg: string) => {
    twitchChatBotClient.say(channels[0], `joejsBbpenny ${msg}`);
};

const commands: { [k: string]: (opts: any, userState: ChatUserstate) => void } = {
    "!smashRandom": async (opts, userState) => {
        const selection = await smashRandom(opts, userState.username);
        pennySay(`${userState.username} ${selection}`);
    },
    "!sr5": async (opts, userState) => {
        const selection = await smashRandom({
            length: "5",
            fighterPack2: "true",
            fighterPack1: "true",
            oos: "true",
            bans: "false",
            favs: "false"
        });
        pennySay(`${userState.username} ${selection}`);
    },
    "!arena": (opts, userState) => {
        const message = shareArena();
        if (userState.username) {
            // TODO: get bot account verified with twitch in order to whisper
            pennySay(message);
        }
    },
    "!joesWorkingOn": (opts, userState) => {
        const message = joesWorkingOn();
        pennySay(message);
    },
    "!links": (opts, userState) => {
        pennySay(`Hi~ :::: https://github.com/00-joe-js/how-to-file-upload :::: https://joejs.live`);
    },
};

const spaces = /\s/gi;
const parseParameters = (messageText: string) => {
    messageText = messageText.replace(spaces, "");
    const openParenPos = messageText.indexOf("(");
    if (openParenPos === -1) return {};
    const closeParenPos = messageText.indexOf(")");
    const parametersString = messageText.slice(openParenPos + 1, closeParenPos);
    return parametersString.split(",").reduce((o: { [key: string]: string }, s) => {
        const [key, value] = s.split("=");
        if (key && value) {
            o[key.trim()] = value.trim();
        }
        return o;
    }, {});
};
const parseMessageToCommandRunner = (messageText: string, userState: ChatUserstate): Function | null => {
    if (messageText[0] !== "!") return null;
    const firstPart = messageText.split("(")[0];
    if (!commands[firstPart]) {
        return null;
    } else {
        const parameters = parseParameters(messageText);
        return commands[firstPart].bind(null, parameters, userState);
    }
};

const handleMessage = async (channel: string, userState: ChatUserstate, message: string, self: boolean) => {
    if (channel !== channels[0]) return; // Defense
    if (self === true) return; // Do not handle messages sent from the bot.
    try {
        const command = parseMessageToCommandRunner(message.trim(), userState);
        if (command !== null) {
            command();
        }
    } catch (e) {
        console.error(e);
    }
};

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

(async () => {
    try {
        console.log(await twitchChatBotClient.connect());
    } catch (e) {
        console.error(e);
    }
})();