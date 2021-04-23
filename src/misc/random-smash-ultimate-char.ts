import characters from "../../sens/smashUltimateChars.json";

import chance from "chance";
const c = chance.Chance();

export const pickFromAll = () => c.pickone(characters);