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

const setViewport = (renderer, uniforms) => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.forEach(u => u.u_Resolution.value = new THREE.Vector2(window.innerWidth, window.innerHeight));
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


(async () => {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 26;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.x = 0;
    directionalLight.position.y = 10;
    directionalLight.position.z = 10;
    // scene.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xFCE77D);
    renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    document.querySelector("#page-container").appendChild(renderer.domElement);

    const world = new OIMO.World({
        timestep: 1 / 60,
        iterations: 8,
        broadphase: 2,
        wordscale: 1,
        info: true
    });

    const amountOfDucks = 200;

    const [vertexShader, fragmentShader] = await loadShaders();

    const gltf = await loadDuckyModel();
    const originalDuck = gltf.scene.children[0].children[1];

    const ducks = [];
    for (let i = 0; i < amountOfDucks; i++) {

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

    world.play();

    renderer.render(scene, camera);

    ground.connectMesh(groundMesh);

    world.postLoop = function () {
        renderer.render(scene, camera);
    };

    setViewport(renderer, ducks.map(d => d.uniforms));
    window.addEventListener("resize", myDebounce(() => setViewport(renderer, ducks.map(d => d.uniforms)), 70));

    setInterval(() => {
        console.group("Render report");
        console.log("Scene polycount:", renderer.info.render.triangles)
        console.log("Active Drawcalls:", renderer.info.render.calls)
        console.log("Textures in Memory", renderer.info.memory.textures)
        console.log("Geometries in Memory", renderer.info.memory.geometries)
        console.log("Full Info", renderer.info)
        console.groupEnd();

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



