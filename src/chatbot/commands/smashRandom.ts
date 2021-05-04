interface SmashRandomOptions {
    fighterPack1: string,
    fighterPack2: string,
    length: string,
    oos: string,
    favs: string,
    bans: string
}

interface SmashCharacter {
    name: string,
    id: string,
    fighterPack1: boolean,
    fighterPack2: boolean
}

import { getUserPrefs } from "../../redis";

import { amountOfCharacters, pickFromAll, pickAmongst, pickExcluding } from "../misc/random-smash-ultimate-char";

const toBool = (s: string): boolean => {
    return s === "false" ? false : true;
};

export default async (
    {
        fighterPack1 = "true", fighterPack2 = "true",
        favs = "false", bans = "false",
        length = "1", oos = "false"
    }: SmashRandomOptions,
    twitchUsername?: string | undefined,
) => {
    const filterToJustFavs = toBool(favs);
    const doNotIncludeBanned = toBool(bans);
    const allOs = toBool(oos);
    const includeFighterPack1 = toBool(fighterPack1);
    const includeFighterPack2 = toBool(fighterPack2);
    
    let lengthNumber = Math.min(parseInt(length, 10), 7);

    let userFavsIds: string[] = [];
    let userBansIds: string[] = [];
    if (doNotIncludeBanned || filterToJustFavs) {
        // Check for twitch username, consult redis assumed on same machine.
        if (twitchUsername) {
            const { whitelist, blacklist } = await getUserPrefs(twitchUsername);
            userFavsIds = whitelist;
            userBansIds = blacklist;
        }
    }

    // Reassign this so we don't infinite loop.
    if (filterToJustFavs) {
        lengthNumber = Math.min(userFavsIds.length, lengthNumber);
    } else if (doNotIncludeBanned) {
        lengthNumber = Math.min(amountOfCharacters - userBansIds.length, lengthNumber);
    }

    const getACharacter = (() => {
        if (filterToJustFavs) {
            return () => pickAmongst(userFavsIds);
        } else if (doNotIncludeBanned) {
            return () => pickExcluding(userBansIds);
        } else {
            return () => pickFromAll();
        }
    })();

    let defenseCounter = 0;
    const pickedFighters: SmashCharacter[] = [];
    while (pickedFighters.length < lengthNumber && defenseCounter < 10000) {
        const possibleFighter: SmashCharacter = getACharacter();
        if (!includeFighterPack1 && possibleFighter.fighterPack1) continue;
        if (!includeFighterPack2 && possibleFighter.fighterPack2) continue;
        if (pickedFighters.includes(possibleFighter)) continue;
        pickedFighters.push(possibleFighter);
    }

    let fighterNames = pickedFighters.map(f => f.name);
    if (allOs) {
        fighterNames = fighterNames.map(name => {
            return name.replace(/[AEIOU]/gi, "O");
        });
    }

    return `You should play: ${fighterNames.join(" || ")}!`;
}