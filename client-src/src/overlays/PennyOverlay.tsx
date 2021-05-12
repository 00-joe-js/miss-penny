import { useEffect, useMemo, useState } from 'react';

import chance from "chance";
const c = chance.Chance();

const PennyFloatsDownwards = ({ xPosition, src }: { xPosition: number, src: string }) => {
    const [y, setY] = useState(c.integer({ min: 0, max: 100 }));

    const xPx = useMemo(() => {
        return `${xPosition}%`;
    }, [xPosition]);

    useEffect(() => {
        const i = setInterval(() => {
            setY((y) => y + 2); // Eventually this will be rendered to canvas context.
        }, 50);
        return () => clearInterval(i);
    }, []);

    return (
        <div style={{ position: "fixed", top: `${y}px`, left: xPx }}>
            <img alt="penny-drop-img" src={src} style={{ width: "125px" }} />
        </div>
    )
};

// Can these be nested? - Yes
interface PennyDropEntry {
    id: string, // Randomized short hash for React component keying
    droppedAt: number, // Date.now(), will be used to clear out after some delay (checked in uE)
    xPosition: number,
    source: string, // url of image
};

const PennyOverlay = () => {

    const [drops, setDrops] = useState<PennyDropEntry[]>([]);

    useEffect(() => {
        const askServer = async () => {

            const res = await fetch(`/penny-drops${window.location.search}`);

            const dropPositions = await res.json();
            if (dropPositions.length === 0) return;

            const newDrops = dropPositions.map(({ xPosition, source }: { xPosition: number, source: string }) => {
                return {
                    id: c.integer({ min: 1, max: 100000 }).toString(),
                    droppedAt: Date.now(),
                    source,
                    xPosition
                };
            });

            setDrops(current => [...current, ...newDrops]);
        };

        const i = setInterval(askServer, 2000);
        return () => clearInterval(i);

    }, []);

    useEffect(() => {
        const CLEAN_UP_AFTER = 30 * 1000;
        const cleanup = () => {
            setDrops(currentDrops => {
                const now = Date.now();
                if (currentDrops.length === 0) return currentDrops;
                const stillDropping = currentDrops.filter(drop => now - drop.droppedAt < CLEAN_UP_AFTER);
                return stillDropping;
            });
        };
        const i = setInterval(cleanup, 3000);
        return () => clearInterval(i);
    }, []);

    return (
        <div>
            {drops.map(drop => {
                return (
                    <PennyFloatsDownwards key={drop.id} src={drop.source} xPosition={drop.xPosition} />
                );
            })}
        </div>
    );

};

export default PennyOverlay;