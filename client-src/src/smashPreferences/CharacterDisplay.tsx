import React, {useContext} from "react";
import PreferencesContext from "./context";

import type {SmashChar} from "./context";
import type { MouseEventHandler } from "react";

const getCharIconUrl = (char: SmashChar) => {
    return `/assets/characterIcons/resized/70-70-${char.icon}.png`;
};

const Star = ({ filled, onClick }: { filled: boolean, onClick: MouseEventHandler }) => {
    return (
        <svg onClick={onClick} height="25" width="23" className="star rating" data-rating="1">
            <polygon points="9.9, 1.1, 3.3, 21.78, 19.8, 8.58, 0, 8.58, 16.5, 21.78" style={
                { "fillRule": "nonzero", "fill": filled ? "yellow" : "black" }
            } />
        </svg>
    );
};
const X = ({ filled, onClick }: { filled: boolean, onClick: MouseEventHandler }) => {
    return (
        <svg onClick={onClick} viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'>
            <path stroke={filled ? 'rgba(255, 0, 0, 1)' : 'rgba(0,0,0, 1)'} strokeWidth='2' strokeLinecap='round' strokeMiterlimit='10' d='M8 8 L24 24 M8 24 L24 8' />
        </svg>);
};

const CharacterDisplay = (
    {
        character,
    }: {
        character: SmashChar,
    }
) => {
    const context = useContext(PreferencesContext);
    if (!context) return null;

    const { whitelist, blacklist, affectCharWhitelist, affectCharBlacklist } = context;
    const whitelisted = whitelist.includes(character.id);
    const blacklisted = blacklist.includes(character.id);
    const styleObj: React.CSSProperties = {};
    if (whitelisted) {
        styleObj.background = "rgb(134, 134, 243)";
    }
    if (blacklisted) {
        styleObj.background = "rgb(100, 100, 100)";
        styleObj.opacity = 0.8;
    }
    return (
        <div className="smash-character-display" style={styleObj}>
            <div>
                <img src={getCharIconUrl(character)} />
                <h1 style={{ textDecoration: blacklisted ? "line-through" : "none" }}>{character.name}</h1>
            </div>
            <div className="list-selections">
                <Star filled={whitelisted} onClick={() => affectCharWhitelist(character.id)} />
                <X filled={blacklisted} onClick={() => affectCharBlacklist(character.id)} />
            </div>
        </div>
    );
};

export default CharacterDisplay;