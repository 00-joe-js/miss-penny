const randomElement = arr => arr[Math.floor(Math.random() * arr.length)];

const myDebounce = (fn, after) => {

    let onGoing = null;
    return () => {

        if (onGoing) {
            clearTimeout(onGoing);
        }

        onGoing = setTimeout(() => {
            fn();
            onGoing = null;
        }, after);

    };

};

const getRandomGummyColor = (function () {
    const GUMMY_COLORS = [
        0xD1EE58,
        0xF6E49B,
        0xFDEF00,
        0xF6BD5F,
        0xF1C793,
        0xF3574F,
        0x896881,
        0x0E769B,
        0x34B988,
        0xF63865
    ];
    return function () {
        return randomElement(GUMMY_COLORS);
    };
})();

const screenResolutionNormal = () => {
    return new THREE.Vector2(window.innerWidth, window.innerHeight);
};

const setViewport = (renderer, composer, uniforms) => {
    const width = (window.innerWidth);
    const height = (window.innerHeight);
    renderer.setSize(width, height);
    composer.setSize(width, height);
    uniforms.forEach(u => u.u_Resolution.value = new THREE.Vector2(width, height));
};

const randomRotationVector = () => {
    return [randomBetween(0, 360), randomBetween(0, 360), randomBetween(0, 360)]
};

const randomBetween = (min, max) => {
    return Math.floor(min + ((Math.random() * max) - min));
};

const randomColor = () => {
    return randomBetween(0, 0xff0000) + randomBetween(0, 0x00ff00) + randomBetween(0, 0x0000ff);
};

const loadShaders = async () => {
    const [vRes, fRes] = await Promise.all(
        [fetch("/glslVertex.glsl").then(res => res.text()), fetch("/glslFrag.glsl").then(res => res.text())]
    );
    return [vRes, fRes];
}

const loadDuckyModel = () => {
    const loadingPromise = new Promise((res, rej) => {
        const loader = new THREE.GLTFLoader();
        loader.load("/Duck.glb", res, null, rej);
    });
    return loadingPromise;
};

const loadTexture = (url) => {
    const loadingPromise = new Promise((res, rej) => {
        const loader = new THREE.TextureLoader();
        loader.load(url, res, null, rej);
    });
    return loadingPromise;
};

const loadVid = (selector) => {
    const video = document.querySelector(selector);
    return new THREE.VideoTexture(video);
};

const createShaderMaterial = (vertexShader, fragmentShader) => {
    const uniforms = {
        u_Rand: { value: 0.0, type: "float" },
        u_Resolution: { value: new THREE.Vector2() }
    };
    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true
    });
    uniforms.u_Resolution.value = screenResolutionNormal();
    return [material, uniforms];
};

const sel = document.querySelector.bind(document);

const gamePortfElement = sel("#game-portfolio-section");
const webSection = sel("#web-section");
const roomSection = sel("#room-section");

(async () => {

    const main = sel("main");

    const configureStart = () => {
        window.onbeforeunload = () => {
            window.scrollTo(0, 0);
        };
        document.addEventListener("click", () => {
            document.querySelector("video").play();
        });
        manageFontSizes();
    };

    const playOpening = () => {
        const logo = sel("#lol-logo");
        const details = sel("#opening-details");
        const k = "saidawaygoestroubledownthedrain";
        const beenHereBefore = localStorage.getItem(k);
        if (!beenHereBefore) {
            localStorage.setItem(k, " ");
            setTimeout(() => {
                logo.style.opacity = 0.8;
            }, 1000);

            setTimeout(() => {
                logo.style.color = "rgb(255, 255, 130)";
                main.style.background = "rgba(0, 0, 0, 0.95)";
                details.style.opacity = 1;
            }, 5000);
        } else {
            logo.style.opacity = 0.8;
            logo.style.color = "rgb(255, 255, 130)";
            main.style.background = "rgba(0, 0, 0, 0.95)";
            details.style.opacity = 1;
        }
    };

    const manageFontSizes = () => {
        const htmlE = document.querySelector("html");
        const setSizeWithWindow = () => {
            let computedFontSize = (((window.innerHeight / window.devicePixelRatio) / 1080) * 12) + 8;
            computedFontSize += ((window.innerWidth / window.devicePixelRatio) / 1920) * 4;
            htmlE.style.fontSize = (THREE.MathUtils.clamp(computedFontSize, 12, 28)) + "px";
        };
        setSizeWithWindow();
        window.addEventListener("resize", () => {
            setSizeWithWindow();
        });
    };

    document.addEventListener("DOMContentLoaded", () => {

        const mainHeight = main.clientHeight;

        configureStart();

        window.addEventListener("scroll", () => {
            if (window.GROW_PANE) {
                window.GROW_PANE(Math.min(1, window.scrollY / mainHeight));
            }
            if (window.SHOW_THIRD) {
                window.SHOW_THIRD(window.scrollY);
            }
            if (window.SHOW_FOURTH) {
                window.SHOW_FOURTH(window.scrollY);
            }
        });

        playOpening();

    });

})();

(async () => {

    const scene = new THREE.Scene();

    const screenMousePos = new THREE.Vector2(0, 0);
    document.addEventListener("mousemove", (e) => {
        screenMousePos.x = e.clientX;
        screenMousePos.y = e.clientY;
    });

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xFCE77D);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);

    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, -2.5, 0.65);
    bloomPass.enabled = false;
    bloomPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(bloomPass);

    document.querySelector("#page-container").appendChild(renderer.domElement);

    const world = new OIMO.World({
        timestep: 1 / 60,
        iterations: 8,
        broadphase: 2,
        wordscale: 1,
        info: true
    });

    const amountOfInitialDucks = 250;

    const [vertexShader, fragmentShader] = await loadShaders();

    const gltf = await loadDuckyModel();
    const vastGif = loadVid("video");

    const originalDuck = gltf.scene.children[0].children[1];

    const ducks = [];
    for (let i = 0; i < amountOfInitialDucks; i++) {

        setTimeout(() => {
            const duckMesh = originalDuck.clone();
            duckMesh.scale.x = 0.02;
            duckMesh.scale.y = 0.02;
            duckMesh.scale.z = 0.02;
            const [testMaterial, shaderUniforms] = createShaderMaterial(vertexShader, fragmentShader);
            duckMesh.material = testMaterial;
            scene.add(duckMesh);

            shaderUniforms.u_Rand.value = Math.random();

            const hm = world.add({
                type: "cylinder",
                pos: [randomBetween(30, 50), randomBetween(1000, 1500), randomBetween(-20, 5)],
                rot: randomRotationVector(),
                size: [2, 2, 2],
                move: true,
                density: 10
            });
            hm.connectMesh(duckMesh);
            ducks.push({ mesh: duckMesh, physicsRep: hm, uniforms: shaderUniforms });
        }, randomBetween(0, 2000));

    }

    const groundGeometry = new THREE.BoxGeometry(2, 1);
    const grMaterial = new THREE.MeshPhongMaterial({ color: 0xF96167 });
    const groundMesh = new THREE.Mesh(groundGeometry, grMaterial);

    const distantPlaneMesh = new THREE.Mesh(new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial({ color: 0xFCE77D }));
    distantPlaneMesh.scale.x = 1000;
    distantPlaneMesh.scale.y = 1000;
    distantPlaneMesh.position.z = -1000;
    scene.add(distantPlaneMesh);

    groundMesh.scale.x = 1000;
    groundMesh.scale.z = 1000;
    scene.add(groundMesh);

    const ground = world.add({ size: [1000, 1, 1000], pos: [0, -7, -10], rot: [2, 0, 10], density: 1, move: false, friction: .2 });
    const groundDivider = new THREE.BoxGeometry();
    const dividerMat = new THREE.MeshBasicMaterial({ color: 0x54D6D0 });
    const dividerMesh = new THREE.Mesh(groundDivider, dividerMat);
    dividerMesh.scale.x = 1000;
    dividerMesh.scale.y = 1;
    dividerMesh.position.y = 4;
    dividerMesh.position.z = -200;
    dividerMesh.rotation.z = Math.PI / 18;
    scene.add(dividerMesh);

    const blackPlaneG = new THREE.PlaneGeometry(1, 1);
    const blackPlane = new THREE.Mesh(blackPlaneG, new THREE.MeshBasicMaterial({ color: 0x00000 }));
    blackPlane.position.z = 20;
    scene.add(blackPlane);

    let firstSceneActive = true;
    let secondSceneActive = false;
    let thirdSceneActive = false;
    let fourthSceneActive = false;

    window.GROW_PANE = (portionOfScale) => {
        if (firstSceneActive || secondSceneActive) {
            const SCALE = 18 * portionOfScale;

            if (portionOfScale < 1) {
                world.play();
                firstSceneActive = true;
                tearDownSecondSection();
                secondSceneActive = false;
            } else {
                if (secondSceneActive) return;
                firstSceneActive = false;
                ducks.forEach((aDuck) => {
                    const z = aDuck.physicsRep.position.z;
                    if (z > 18) {
                        scene.remove(aDuck.mesh);
                    }
                });
                world.stop();
                firstSceneActive = false;
                triggerSecondSection();
                secondSceneActive = true;
            }

            if (portionOfScale < 0.5) {
                blackPlane.scale.set(SCALE / 20, SCALE * 2, 0);
            } else {
                blackPlane.scale.set(SCALE / (40 - (39 * portionOfScale)), SCALE, 0);
            }
        }
    };


    window.SHOW_THIRD = (scrollY) => {
        if (secondSceneActive || thirdSceneActive) {
            const webSectionOffset = webSection.offsetTop;
            if (scrollY >= webSectionOffset) {
                if (thirdSceneActive === true) return;
                tearDownSecondSection();
                secondSceneActive = false;
                triggerThirdSection();
                thirdSceneActive = true;
            } else {
                if (secondSceneActive === true) return;
                tearDownThirdSection();
                thirdSceneActive = false;
                triggerFourthSection();
                secondSceneActive = true;
            }
        }
    };

    window.SHOW_FOURTH = (scrollY) => {
        if (thirdSceneActive || fourthSceneActive) {
            const roomSectionOffset = webSection.offsetTop;
            if (scrollY >= webSectionOffset) {
                if (fourthSceneActive === true) return;
                tearDownThirdSection();
                thirdSceneActive = false;
                triggerThirdSection();
                thirdSceneActive = true;
            }
        }
    };

    let secondSceneDestroyFn = null;
    const triggerSecondSection = () => {

        const fullGroup = new THREE.Group();
        const platGroup = new THREE.Group();

        const cubey = new THREE.Mesh(new THREE.BoxGeometry(7, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        const redCubey = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));

        platGroup.add(cubey);
        platGroup.add(redCubey);
        fullGroup.position.set(0, -1, 22);
        fullGroup.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 9);

        fullGroup.scale.set(0.5, 0.5, 0.5);

        const pointLight = new THREE.PointLight(0xFCE77D, 0.3);

        fullGroup.add(pointLight);

        redCubey.position.x = 2;
        redCubey.position.y = 1;
        redCubey.position.z = -0.4;

        const screen = new THREE.Mesh(new THREE.BoxGeometry(16 / 4, 9 / 4, 0.05), new THREE.MeshPhongMaterial({
            map: vastGif, shininess: 200
        }));
        fullGroup.add(screen);
        screen.position.y = 3;
        screen.position.x = -1.5;
        screen.position.z = -0.4;
        pointLight.position.z = 50;

        const secondSceneInterval = setInterval(() => {
            screen.rotation.y = Math.sin(Date.now() / 4000) * (Math.PI / 20);
            pointLight.position.x = Math.sin(Date.now() / 1000) * 10 - 20;
            pointLight.position.y = Math.cos(Date.now() / 5000) * 20;
            platGroup.rotation.z = Math.cos(Date.now() / 1000) / 30;
            platGroup.rotation.y = Math.sin(Date.now() / 500) / 50;
        }, 10);

        fullGroup.add(platGroup);
        scene.add(fullGroup);

        secondSceneDestroyFn = () => {
            clearInterval(secondSceneInterval);
            scene.remove(fullGroup);
        };
    };

    const tearDownSecondSection = () => {
        secondSceneDestroyFn && secondSceneDestroyFn();
    };

    let thirdSceneDestroyFn = null;
    const triggerThirdSection = () => {

        const group = new THREE.Group();
        const ducky = originalDuck.clone();

        bloomPass.enabled = true;

        ducky.scale.x = 0.012;
        ducky.scale.y = 0.012;
        ducky.scale.z = 0.012;

        ducky.position.x = -0.2;
        ducky.position.y = -1;

        const duckUniforms = {
            u_mouse_x: { value: Math.abs(screenMousePos.x - (window.innerWidth / 2)) },
            u_time: { value: 0.0 },
            u_tex: { value: new THREE.TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/2666677/explosion.png") }
        };
        ducky.material = new THREE.ShaderMaterial({
            uniforms: duckUniforms,
            wireframe: true,
            vertexShader: `
                #include <noise>
                
                varying float v_noise;
                
                uniform float u_mouse_x;
                uniform float u_time;
                
                void main() {	
                    v_noise = 15.0 * -0.1 * turbulence(0.5 * normal + (u_time / 10000.0) * 1.4);
                    float b = ((u_mouse_x) / 30.0) * pnoise(0.05 * position, vec3(100.0));
                    float displacement = b - 10.0 * v_noise;
                    vec3 pos = position + normal * displacement;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
                }
            `,
            fragmentShader: `
                #define PI 3.141592653589
                #define PI2 6.28318530718
                                
                varying float v_noise;
                
                uniform float u_mouse_x;
                uniform sampler2D u_tex;
                
                float random( vec3 pt, float seed ){
                    vec3 scale = vec3( 12.9898, 78.233, 151.7182 );
                    return fract( sin( dot( pt + seed, scale ) ) * 43758.5453 + seed ) ;
                }
                
                void main (void)
                {
                    float r = .01 * random(gl_FragCoord.xyz, 0.0);
                    vec2 uv = vec2(0, 1.3 * v_noise + r);
                    vec4 texelColor = texture2D(u_tex, uv);
                    vec3 color = vec3(texelColor.r, 1.0, (1.0-texelColor.r));
                    gl_FragColor = vec4(color, 1.0);
                }
            `
        });

        group.add(ducky);
        scene.add(group);

        group.position.z = 23;

        const yAxis = new THREE.Vector3(0, 1, 0);
        const rotating = setInterval(() => {
            duckUniforms.u_time.value += 12.0;
            ducky.rotateOnAxis(yAxis, Math.PI / 1024);
            duckUniforms.u_mouse_x.value = Math.abs(screenMousePos.x - (window.innerWidth / 2));
            // bloomPass.strength = screenMousePos
        }, 10);

        thirdSceneDestroyFn = () => {
            bloomPass.enabled = false;
            scene.remove(group);
            clearInterval(rotating);
        };
    };

    const tearDownThirdSection = () => {
        thirdSceneDestroyFn && thirdSceneDestroyFn();
    };

    ground.connectMesh(groundMesh);

    world.play();

    const loop = function (dt) {
        composer.render();
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);

    setViewport(renderer, composer, ducks.map(d => d.uniforms));
    window.addEventListener("resize", myDebounce(() => setViewport(renderer, composer, ducks.map(d => d.uniforms)), 70));

    window.GROW_PANE(0);

    setInterval(() => {

        // Cleanup.
        ducks.forEach((aDuck) => {
            const x = aDuck.physicsRep.position.x;
            if (x < -70 || x > 70) {
                // scene.remove(aDuck.mesh);
                aDuck.physicsRep.resetPosition(randomBetween(30, 50), randomBetween(1000, 1500), randomBetween(-20, 5));
            }
        });

    }, 1000);

})();



