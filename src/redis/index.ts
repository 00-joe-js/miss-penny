import { createNodeRedisClient } from "handy-redis";
const client = createNodeRedisClient();

export interface Prefs { whitelist: string[], blacklist: string[] };

export const updatePrefs = (originalPrefs: Prefs, characterId: string, prefState: { whitelist: boolean, blacklist: boolean }): Prefs => {
    const currentPrefs = { ...originalPrefs };
    if (prefState.whitelist === true && !currentPrefs.whitelist.includes(characterId)) {
        currentPrefs.whitelist = [...currentPrefs.whitelist, characterId];
    } else if (prefState.whitelist === false) {
        currentPrefs.whitelist = currentPrefs.whitelist.filter(v => v !== characterId);
    }
    if (prefState.blacklist === true && !currentPrefs.blacklist.includes(characterId)) {
        currentPrefs.blacklist = [...currentPrefs.blacklist, characterId];
    } else if (prefState.blacklist === false) {
        currentPrefs.blacklist = currentPrefs.blacklist.filter(v => v !== characterId);
    }
    return currentPrefs;
};

export const getUserPrefs = async (twitchName: string) => {
    const result = await client.get(twitchName);
    if (result === null) {
        return { whitelist: [], blacklist: [] };
    }
    return JSON.parse(result);
};

export const setUserPrefs = async (twitchName: string, prefs: Prefs) => {
    await client.set(twitchName, JSON.stringify(prefs));
};

export default client;