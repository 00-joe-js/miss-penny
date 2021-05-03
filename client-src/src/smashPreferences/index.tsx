import React, { useMemo, useEffect, useState } from "react";

import PreferencesContext, { smashCharacters as allCharacters } from "./context";
import TwitchAuth, { askForTwitchUserInfo } from "../twitchAuth";

import CharacterDisplay from "./CharacterDisplay";

interface UserSmashPrefs {
    whitelist: string[],
    blacklist: string[]
};

const sendPrefToServer = async (twitchUsername: string, charId: string, prefState: { whitelist: boolean, blacklist: boolean }) => {

    if (prefState.whitelist === true && prefState.blacklist === true) {
        throw new Error(`Both lists can't be true, but they can be false.`);
    }

    const serverRes = await fetch("/submit-character-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twitchUsername, charId, prefState }),
    });

    if (!serverRes.ok) {
        console.error(serverRes);
        throw new Error(serverRes.statusText);
    }

    const { whitelist, blacklist } = await serverRes.json();
    return [whitelist, blacklist];
};

const Explain = ({ twitchUsername }: { twitchUsername: string }) => {
    return (
        <div id="random-explain">
            <h2>Hi, <span>{twitchUsername}!</span></h2>
        </div>
    );
};

const SmashPreferences = () => {

    const [authLoad, setAuthLoad] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState<string | null>(null);
    const [canonicalUserPrefs, setPrefs] = useState<UserSmashPrefs | null>(null);

    const contextValue = useMemo(() => {
        if (!username || !canonicalUserPrefs) return null;
        const { whitelist, blacklist }: UserSmashPrefs = canonicalUserPrefs;

        const createAffectList = (isWhitelist: boolean = true) => {
            const primary = isWhitelist ? "whitelist" : "blacklist";
            const secondary = isWhitelist ? "blacklist" : "whitelist";

            return async (characterId: string) => {

                const prefsBeforeAction = { ...canonicalUserPrefs };
                const currentyListed = prefsBeforeAction[primary].includes(characterId);
                const newList = currentyListed
                    ? prefsBeforeAction[primary].filter(v => v !== characterId)
                    : [...prefsBeforeAction[primary], characterId];

                try {
                    const eagerLoadedPrefs = {
                        whitelist: isWhitelist ? newList : prefsBeforeAction.whitelist.filter(v => v !== characterId),
                        blacklist: !isWhitelist ? newList : prefsBeforeAction.blacklist.filter(v => v !== characterId),
                    };
                    setPrefs(eagerLoadedPrefs);
                    await sendPrefToServer(
                        username, characterId,
                        isWhitelist ? { whitelist: !currentyListed, blacklist: false } : { blacklist: !currentyListed, whitelist: false }
                    );
                } catch (e) {
                    console.error(e);
                    setPrefs(prefsBeforeAction);
                    // TODO user error feedback
                }
            };
        };

        return {
            whitelist, blacklist,
            affectCharWhitelist: createAffectList(true),
            affectCharBlacklist: createAffectList(false),
        };

    }, [username, canonicalUserPrefs]);

    useEffect(() => {
        // TODO: cache this, probably on the twitchAuth side.
        (async () => {
            try {
                const { twitchUsername, whitelist, blacklist } = await askForTwitchUserInfo();
                // userName will be used to fulfill all requests to add
                // and remove Smash characters. Will pKey in redis
                if (twitchUsername) {
                    setLoggedIn(true);
                    setUsername(twitchUsername);
                    if (whitelist && blacklist) {
                        setPrefs({ whitelist, blacklist });
                    }
                } else { // in case the useEffect has a real dependency on some sort of context value
                    setLoggedIn(false);
                }
                setAuthLoad(true);
            } catch (e) {
                console.error(`Auth reported error`, e);
                setLoggedIn(false);
                setAuthLoad(true);
            }
        })();
    }, []);

    if (!authLoad) return null; // TODO: loader?

    return (
        <PreferencesContext.Provider value={contextValue || undefined}>
            <section id="smash-prefs-interface">
                {!loggedIn ? <TwitchAuth /> : <Explain twitchUsername={username || ""} />}
                {loggedIn && <div className="character-list">
                    {allCharacters.map(char => {
                        return (
                            <CharacterDisplay
                                key={char.id}
                                character={char}
                            />
                        );
                    })}
                </div>}
            </section>
        </PreferencesContext.Provider>
    );

};

export default SmashPreferences;