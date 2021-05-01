import React, { useEffect, useRef } from "react";
import chance from "chance";
const c = chance.Chance();

const colorThemes = [
    ["#000", "#fff"],
    ["red", "green", "blue"],
    ["#777", "blue"],
    ["#e619b2", "#0cf3b5", "#ff2e00", "#8ded12", "#0a0e7d", "#aaaba8", "#ff1d00"],
    ["#e52165", "#0d1137"],
    ["#e2d810", "#d9138a", "#12a4d9", "#322e2f"],
    ["#f3ca20", "#000"]
];

const glitchAway = (canvasElement: HTMLCanvasElement) => {

    let drawFrames = true;
    let lastDrawTimestamp = Date.now();

    const turnOff = () => {
        drawFrames = false;
    };

    const width = canvasElement.clientWidth;
    const height = canvasElement.clientHeight;

    canvasElement.width = width;
    canvasElement.height = height;
    const ctx = canvasElement.getContext("2d");
    if (!ctx) throw new Error("No context?");


    const maxFrameRate = 1000 / c.integer({ min: 5, max: 30 });
    const squaresPerLine = c.integer({ min: 100, max: 300 });
    const whiteLines = c.bool();
    const lineRate = c.floating({ min: 0.1, max: 0.9 });
    const squareWidth = width / squaresPerLine;
    const squareHeight = squareWidth * c.floating({ min: 0.5, max: 1.5 });

    const useAColorTheme = c.bool();

    let randomColors: string[] = [];
    if (useAColorTheme) {
        randomColors = c.pickone(colorThemes);
    } else {
        randomColors = [c.color(), c.color(), c.color(), c.color()];
    }

    const drawRandomGlitchySquares = () => {
        const now = Date.now();
        const timeSince = now - lastDrawTimestamp;

        if (timeSince < maxFrameRate) {
            window.requestAnimationFrame(drawRandomGlitchySquares);
            return;
        }
        if (drawFrames === false) return;

        lastDrawTimestamp = now;


        for (let yOffset = 0; yOffset < height; yOffset += squareHeight) {
            if (Math.random() > lineRate) {
                if (whiteLines) {
                    ctx.fillStyle = "white";
                    ctx.fillRect(0, yOffset, width, height);
                }
                continue;
            };
            for (let xOffset = 0; xOffset < width; xOffset += squareWidth) {
                ctx.fillStyle = c.pickone(randomColors);
                ctx.fillRect(xOffset, yOffset, squareWidth, squareHeight);
            }
        }
        window.requestAnimationFrame(drawRandomGlitchySquares);
    };
    drawRandomGlitchySquares();
    return turnOff;
};

const GlitchBanner = () => {

    const canvasElementRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (canvasElementRef.current === null) return;
        const actuallyStop = glitchAway(canvasElementRef.current);
        return () => actuallyStop();
    }, []);


    return (
        <canvas id="glitch-canvas" ref={canvasElementRef}></canvas>
    );

};

export default GlitchBanner;