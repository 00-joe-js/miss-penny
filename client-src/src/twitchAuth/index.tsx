import React from "react";

const getOrigin = () => {
    if (window.location.origin === "http://localhost:3000") {
        return "http://localhost:7777";
    } else {
        return window.location.origin;
    }
};

const twitchFirstStopURL = `https://id.twitch.tv/oauth2/authorize\
?client_id=quwrspx68engp5hv7b8ush3vn00zej\
&redirect_uri=${getOrigin()}/biscuit\
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
            <h2 style={{ margin: "1.5rem 0 1rem 0" }}>😃 Hello there.</h2>
            <h3 style={{ fontWeight: "lighter", margin: "0.5rem 0" }}>
                If you login with Twitch, you can set your Smash Ultimate character preferences for the{"  "}
                <strong>its_miss_penny <img src="/favicon.png" style={{ position: "relative", top: "7px", left: "-5px" }} /></strong> chat bot!
            </h3>
            <a style={{ fontSize: "1.75rem" }} href={twitchFirstStopURL}>Login with Twitch</a>
        </div>
    );
};

export default TwitchAuth;