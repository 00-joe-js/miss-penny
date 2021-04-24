interface SmashRandomOptions {
    fighterPack1: string,
    fighterPack2: string,
    length: string,
}

interface SmashCharacter {
    name: string,
    id: string,
    fighterPack1: boolean,
    fighterPack2: boolean
}

import { pickFromAll } from "../misc/random-smash-ultimate-char";

const toBool = (s: string): boolean => {
    return s === "false" ? false : true;
}

export default ({ fighterPack1 = "true", fighterPack2 = "true", length = "1" }: SmashRandomOptions) => {
    const includeFighterPack1 = toBool(fighterPack1);
    const includeFighterPack2 = toBool(fighterPack2);
    const lengthNumber = Math.min(parseInt(length, 10), 7);

    const pickedFighters: SmashCharacter[] = [];
    while (pickedFighters.length < lengthNumber) {
        const possibleFighter: SmashCharacter = pickFromAll();
        if (!includeFighterPack1 && possibleFighter.fighterPack1) continue;
        if (!includeFighterPack2 && possibleFighter.fighterPack2) continue;
        if (pickedFighters.includes(possibleFighter)) continue;
        pickedFighters.push(possibleFighter);
    }

    return `You should play: ${pickedFighters.map(f => f.name).join(" || ")}!`;
}