import characters from "../../../sens/smashUltimateChars.json";

import chance from "chance";
const c = chance.Chance();

// TODO: think about echo fighters. :sweat-smile:
export const amountOfCharacters = characters.length;

export const pickFromAll = () => c.pickone(characters);

export const pickExcluding = (ids: string[]) => {
    const moreSpecific = characters.filter(char => !ids.includes(char.id));
    return c.pickone(moreSpecific);
};

export const pickAmongst = (ids: string[]) => {
    const moreSpecific = characters.filter(char => ids.includes(char.id));
    return c.pickone(moreSpecific);
};