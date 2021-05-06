import React, { useMemo, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import GlitchCanvas from "./glitch/index";
import SmashPreferencesInterface from "./smashPreferences";

import chance from "chance";
const c = chance.Chance();

if (window.location.pathname === "/glitch-overlay") {
  const GlitchOverlay = () => {
    const [artificialKey, set] = useState(Math.random());
    useEffect(() => {
      setInterval(() => {
        set(Math.random())
      }, 10000);
    }, []);
    return (<div key={artificialKey}>
      {"hi".repeat(7).split("").map(() => {
        return (
          <div style={{ position: "relative", height: "100px" }}>
            <GlitchCanvas />
          </div>
        );
      })}
    </div>);
  };
  ReactDOM.render(<GlitchOverlay />, document.getElementById('root'));
} else if (window.location.pathname === "/penny-overlay") {

  const PennyFloatsDownwards = ({ xPosition, src }: { xPosition: number, src: string }) => {
    const [y, setY] = useState(0);

    const xPx = useMemo(() => {
      return `${xPosition}px`;
    }, [xPosition]);

    useEffect(() => {
      const i = setInterval(() => {
        setY((y) => y + 2); // Eventually this will be rendered to canvas context.
      }, 50);
      return () => clearInterval(i);
    }, []);

    return (
      <div style={{ position: "fixed", top: `${y}px`, left: xPx }}>
        <img src={src} style={{ width: "75px" }} />
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
        // This will access entries from redis of
        // Penny drop positions.
        const res = await fetch("/penny-drops");
        // Percentages? yeah -- or 0-(1920-100)
        const dropPositions = await res.json();
        if (dropPositions.length === 0) return;
        const newDrops = dropPositions.map((xPosition: number) => {
          return { droppedAt: Date.now(), source: "pennydrop.jpg", xPosition };
        });
        setDrops(current => [...current, ...newDrops]);
      };
      const randomizeForNow = () => {
        const howMany = c.integer({ min: 0, max: 2 });
        if (howMany === 0) return;
        const newDrops = "~".repeat(howMany).split("").map(() => {
          return {
            id: c.integer({ min: 1, max: 100000 }).toString(),
            droppedAt: Date.now(),
            source: "pennydrop.jpg",
            xPosition: randomXPositionOnScreen()
          };
        });
        setDrops(current => [...current, ...newDrops]);
      };
      const i = setInterval(randomizeForNow, 500);
      return () => clearInterval(i);
    }, []);
    const randomXPositionOnScreen = () => c.integer({ min: 0, max: window.innerWidth - 50 });
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
  ReactDOM.render(<PennyOverlay />, document.getElementById('root'));
} else {
  const Root = () => {
    const [glitchKey, setGlitchKey] = useState(Math.random());
    return (
      <React.StrictMode>
        <GlitchCanvas key={glitchKey} />
        <nav>
          <a href="https://twitch.tv/joe_js" target="_blank" rel="noreferrer"><h1>ttv/joe_js</h1></a>
          <img alt="joe_js" src="prof.jpg" onClick={() => setGlitchKey(Math.random())} />
        </nav>
        <main>
          <SmashPreferencesInterface />
        </main>
      </React.StrictMode>
    );

  };
  ReactDOM.render(<Root />, document.getElementById('root'));
}
