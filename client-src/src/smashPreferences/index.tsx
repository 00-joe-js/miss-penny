import React, { useContext, useEffect, useState } from "react";

import TwitchAuth, { askForTwitchUserInfo } from "../twitchAuth";

interface UserSmashPrefs {
    whitelist: string[],
    blacklist: string[]
}

const SmashPreferences = () => {

    const [authLoad, setAuthLoad] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const fakePreferenceState: UserSmashPrefs = {
        whitelist: ["01", "05"], // "I exclusively play characters from the Mario series."
        blacklist: ["61", "78"], // "Fuck Final Fantasy." F FF
    };

    useEffect(() => {
        // TODO: cache this, probably on the twitchAuth side.
        (async () => {
            const userName = await askForTwitchUserInfo();
            // userName will be used to fulfill all requests to add
            // and remove Smash characters. Will pKey in redis
            if (userName) {
                setLoggedIn(true);
            } else { // in case the useEffect has a real dependency on some sort of context value
                setLoggedIn(false);
            }
            setAuthLoad(true);
        })();

    }, []);

    if (!authLoad) return null; // TODO: loader?

    return (
        <section id="smash-prefs-interface">
            {loggedIn && <h1>Smash Prefs</h1>}
            {!loggedIn && <TwitchAuth />}
        </section>
    );

};

export default SmashPreferences;