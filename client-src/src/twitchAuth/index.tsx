import React from "react";

const twitchFirstStopURL = `https://id.twitch.tv/oauth2/authorize\
?client_id=quwrspx68engp5hv7b8ush3vn00zej\
&redirect_uri=${window.location.origin}/biscuit\
&response_type=code`;

export const askForTwitchUserInfo = async () => {
    // TODO: centralize this URL knowledge
    const res = await fetch("/twitch-user");
    const data: { twitchUsername: string | null, whitelist: string[] | undefined, blacklist: string[] | undefined } = await res.json();
    return data;
};

const TwitchAuth = () => {
    return (
        <div id="twitch-auth-overlay">
            <h3>I gotta know who you are on Twitch for this to matter 😃</h3>
            <a href={twitchFirstStopURL}>Login with Twitch</a>
        </div>
    );
};

export default TwitchAuth;