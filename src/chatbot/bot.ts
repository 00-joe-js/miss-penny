import { ChatUserstate } from "tmi.js";

import { Client } from "tmi.js";
import { twitchToken, username, channels } from "../../sens/creds.json";

import joesWorkingOn from "./commands/joesWorkingOn";
import smashRandom, { SmashRandomOptions } from "./commands/smashRandom";
import shareArena from "./commands/shareArena";
import pennyDrop, {quarterDrop} from "./commands/pennyDrop";

const pennySay = (msg: string) => {
    twitchChatBotClient.say(channels[0], `joejsBbpenny ${msg}`);
};

const defaultOptions: SmashRandomOptions = {
    length: "1",
    fighterPack2: "true",
    fighterPack1: "true",
    oos: "false",
    bans: "false",
    favs: "false"
};

const createRandomizerAlias = (uniqueOpts: Partial<SmashRandomOptions>) => {
    return async (_: SmashRandomOptions, userState: ChatUserstate) => {
        const selection = await smashRandom({ ...defaultOptions, ...uniqueOpts }, userState.username);
        pennySay(`${userState.username} ${selection}`);
    };
};

const commands: { [k: string]: (opts: SmashRandomOptions, userState: ChatUserstate) => void } = {
    "!smashRandom": async (opts, userState) => {
        const selection = await smashRandom(opts, userState.username);
        pennySay(`${userState.username} ${selection}`);
    },
    "!arena": () => {
        pennySay(shareArena());
    },
    "!joesWorkingOn": () => {
        pennySay(joesWorkingOn());
    },
    "!links": () => {
        pennySay(`Hi~ :::: https://joejs.live :::: https://gist.github.com/00-joe-js/0089b1450b64710776610134cb0fd685`);
    },
    "!pennyDrop": () => {
        pennyDrop();
    },
    "!quarterDrop": () => {
        quarterDrop();
    }
};

commands["!r5"] = createRandomizerAlias({ length: "5" });

commands["!fav"] = createRandomizerAlias({ favs: "true" });
commands["!favs2"] = createRandomizerAlias({ length: "2", favs: "true" });
commands["!favs3"] = createRandomizerAlias({ length: "3", favs: "true" });
commands["!favs4"] = createRandomizerAlias({ length: "4", favs: "true" });
commands["!favs5"] = createRandomizerAlias({ length: "5", favs: "true" });

commands["!bansOn"] = createRandomizerAlias({ bans: "true", length: "1" });

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
        return commands[firstPart].bind(null, { ...defaultOptions, ...parameters }, userState);
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