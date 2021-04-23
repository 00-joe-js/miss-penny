import { Client } from "tmi.js";
import { twitchToken, username, channels } from "../sens/creds.json";

const twitchChatBotClient = new Client({
    identity: {
        username,
        password: twitchToken
    },
    channels
});

twitchChatBotClient.on("connected", () => {
    twitchChatBotClient.on("message", (...args) => {
        console.log("I see a message");
        console.log(args);
    });
    setTimeout(() => {
        twitchChatBotClient.say("joe_js", `heddo testing? ${Date.now()}`);
    }, 2000);
});

(async () => {
    try {
        console.log(await twitchChatBotClient.connect());
    } catch (e) {
        console.error(e);
    }
})();


setInterval(() => { });