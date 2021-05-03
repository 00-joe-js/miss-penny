import {createContext} from "react";
// This file is .gitignored.
import allCharacters from "./characters.json";

export type SmashChar = typeof allCharacters[0];
export const smashCharacters: SmashChar[] = allCharacters;

const PreferencesContext = createContext<{
    whitelist: string[],
    blacklist: string[],
    affectCharWhitelist: (s: string) => void,
    affectCharBlacklist: (s: string) => void,
} | undefined>(undefined);

export default PreferencesContext;