import { useEffect, useState } from 'react';
import GlitchCanvas from "../glitch/index";

const GlitchOverlay = () => {
    const [artificialKey, set] = useState(Math.random());
    useEffect(() => {
        setInterval(() => {
            set(Math.random())
        }, 10000);
    }, []);
    return (
        <div key={artificialKey}>
            {"hi".repeat(7).split("").map(() => {
                return (
                    <div style={{ position: "relative", height: "100px" }}>
                        <GlitchCanvas />
                    </div>
                );
            })}
        </div>
    );
};

export default GlitchOverlay;