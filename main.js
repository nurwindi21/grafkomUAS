import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const loader = new FBXLoader();

var animationEnded = false;
var viewMode = 0;
var orbitDegree = 0;
var orbitY = 0;
var orbitDistance = 20;
var camZRotate = Math.PI;
var tiltRange = 0.5;
var isTiltHold = false;

const subtitles = [
    "Loading Assets...", // for delay
    "Exploring the galaxy.",
    "Visiting the planet guardian.",
    "Gazing at the abandoned station.",
    "The alien is coming.",
    "Enemies preparing to attack.",
    "Heading back towards familiar grounds."
];

// Cinematic & Orbit rotate
const keyframes = [
    { start: { x: 26, y: 25, z: 90 }, end: { x: 26, y: 25, z: 90 } },
    { start: { x: 26, y: 25, z: 90 }, end: { x: -23.5, y: 20, z: 25 } },
    { start: { x: -26, y: -10, z: -55 }, end: { x:-61.74139125491783, y:27.48716654940944, z:-37.62617375472411 } },
    { start: { x: 30, y: 10, z: 30 }, end: { x: 10, y: -10, z: 10 } },
    { start: { x: 9.518915683759523, y:17.510309563910702, z:6.780186261082116 }, end: { x:-15.143501849589855, y:22.505676737454227, z:30.569490245351247 } },
    { start: { x:-33.56063568470547, y:32.039604687479425, z:27.64590099692078}, end: { x: -58, y:34, z: 89.5}},
    { start: { x: -48, y: 50, z: -80}, end: { x:-28.77959196410647, y:26.57375146063005, z:-41.59230589277697}},
];
const cameraLookFrames = [
    {x: 0, y:0, z:0},
    {x: 0, y: 0, z: 0},
    {x:-37.323332801881094, y:26.876186575924855, z:-23.928434611352174},
    {x: 45, y:20, z:-25},
    {x:-28.32652948145896, y:48.25502006630897, z:77.09989693649176},
    {x: -39, y:36, z:77},
    {x: -23.742425141527058, y: 21.922663308445653, z: -34.31258547217597},
]
const duration = 25000;
const tweens = [];

for (let i = 0; i < keyframes.length; i++) {
    const { start, end } = keyframes[i];

    let curDuration = duration / keyframes.length
    if(i == 0) curDuration = 150

    const tween = new TWEEN.Tween(start)
        .to(end, curDuration) 
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.position.set(start.x, start.y, start.z);
            camera.lookAt(cameraLookFrames[i].x, cameraLookFrames[i].y, cameraLookFrames[i].z);
            
            document.getElementById('subtitle').textContent = subtitles[i];
        });

    tweens.push(tween);
}
for (let i = 0; i < tweens.length - 1; i++) {
    tweens[i].chain(tweens[i + 1]);
}

tweens[0].start();
tweens[tweens.length - 1].onComplete(() => {
    camera.position.set(-28.77959196410647, 26.57375146063005, -41.59230589277697);
    animationEnded = true;
    document.getElementById('subtitle').textContent = '';
});


// Data
let cameraTarget = new THREE.Vector3(0, 0, 0);


// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);
scene.backgroundIntensity = 0.1;
scene.backgroundBlurriness = 0.4;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg')
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
camera.position.set(-28.77959196410647, 26.57375146063005, -41.59230589277697);
camera.lookAt(cameraTarget);

var camBB = new THREE.Sphere(camera.position, 1);

// Constants
const SCALE_FACTOR = 1; // Scale factor for distances
const AU = 10; // Astronomical unit for the scale, 1 AU is 10 units in our scene

// Orbital Speeds (arbitrary values to simulate motion)
const orbitalSpeeds = {
    mercury: 2,
    venus: 1.5,
    earth: 1,
    mars: 0.8,
    jupiter: 0.5,
    saturn: 0.3,
    uranus: 0.2,
    neptune: 0.1
};

// Positions in AU (Astronomical Units)
const distances = {
    mercury: 1.5 * AU,
    venus: 2.5 * AU,
    earth: 4 * AU,
    mars: 6 * AU,
    jupiter: 8 * AU,
    saturn: 12 * AU,
    uranus: 17 * AU,
    neptune: 21* AU
};

// Sun
var sunTexture = new THREE.TextureLoader().load('assets/sun/sunBase.png');
var sun = new THREE.Mesh(
    new THREE.SphereGeometry(8, 64, 64),
    new THREE.MeshPhongMaterial({ emissive: 0xff4523, emissiveIntensity: 1, map: sunTexture })
);
sun.position.set(0, 0, 0);
scene.add(sun);

var sunBB = new THREE.Sphere(sun.position, 8);

// Earth
var earthTexture = new THREE.TextureLoader().load('assets/earth/earthBase.jpg');
var earth = new THREE.Mesh(
    new THREE.SphereGeometry(3.2, 32, 32),
    new THREE.MeshPhongMaterial({ map: earthTexture })
);
earth.position.set(distances.earth, 0, 0);  // Set initial position
earth.castShadow = true;
earth.receiveShadow = true;
scene.add(earth);

var earthBB = new THREE.Sphere(earth.position, 3.5+0.2);

// Earth Ozone
var ozone = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 64, 64),
    new THREE.MeshPhongMaterial({ color: 0xffffff })
);
ozone.material.transparent = true;
ozone.material.opacity = 0.4;
earth.add(ozone);

// Moon
var moonTexture = new THREE.TextureLoader().load('assets/moon/moonBase.jpg');
var moonNormal = new THREE.TextureLoader().load('assets/moon/moonNormal.jpg');
var moon = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshPhongMaterial({ map: moonTexture, normalMap: moonNormal })
);
moon.position.set(-7, 0, 0);
moon.castShadow = true;
moon.receiveShadow = true;
earth.add(moon);

var moonBB = new THREE.Sphere(moon.position, 1+0.2);

// Mars
var marsTexture = new THREE.TextureLoader().load('assets/mars/marsBase.jpg');
var mars = new THREE.Mesh(
    new THREE.SphereGeometry(3.5, 64, 64),
    new THREE.MeshPhongMaterial({ map: marsTexture })
);
mars.position.set(distances.mars, 0, 0);  // Set initial position
mars.castShadow = true;
mars.receiveShadow = true;
scene.add(mars);

var marsBB = new THREE.Sphere(mars.position, 3.5+0.2);

// Jupiter
var jupiterTexture = new THREE.TextureLoader().load('assets/jupiter/jupiterBase.jpg');
var jupiter = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshPhongMaterial({ map: jupiterTexture })
);
jupiter.position.set(distances.jupiter, 0, 0);  // Set initial position
jupiter.castShadow = true;
jupiter.receiveShadow = true;
scene.add(jupiter);

var jupiterBB = new THREE.Sphere(jupiter.position, 5+0.2);




// Mercury
var mercuryTexture = new THREE.TextureLoader().load('assets/mercury/2k_mercury.jpg');
var mercury = new THREE.Mesh(
    new THREE.SphereGeometry(0.38 * 3.2, 32, 32), // Mercury's size relative to Earth
    new THREE.MeshPhongMaterial({ map: mercuryTexture })
);
mercury.position.set(distances.mercury, 0, 0); // Distance from the Sun
mercury.castShadow = true;
mercury.receiveShadow = true;
sun.add(mercury);

var mercuryBB = new THREE.Sphere(mercury.position, 0.38 * 3.2+0.2);

// Venus
var venusTexture = new THREE.TextureLoader().load('assets/venus/2k_venus_surface.jpg');
var venus = new THREE.Mesh(
    new THREE.SphereGeometry(0.95 * 3.2, 32, 32),
    new THREE.MeshPhongMaterial({ map: venusTexture })
);
venus.position.set(distances.venus, 0, 0);
venus.castShadow = true;
venus.receiveShadow = true;
sun.add(venus);

var venusBB = new THREE.Sphere(venus.position, 0.95 * 3.2+0.2);

//uranus
var uranusTexture = new THREE.TextureLoader().load('assets/uranus/2k_uranus.jpg');
var uranus = new THREE.Mesh(
    new THREE.SphereGeometry(4 * 3.2, 64, 64),
    new THREE.MeshPhongMaterial({ map: uranusTexture })
);
uranus.position.set(distances.uranus, 0, 0);  // Set initial position
uranus.castShadow = true;
uranus.receiveShadow = true;

var uranusGroup = new THREE.Group();
uranusGroup.add(uranus);
scene.add(uranusGroup);

var uranusBB = new THREE.Sphere(uranus.position, 4 * 3.2+0.2);

// Neptune
var neptuneTexture = new THREE.TextureLoader().load('assets/neptune/2k_neptune.jpg');
var neptune = new THREE.Mesh(
    new THREE.SphereGeometry(3.88 * 3.2, 64, 64),
    new THREE.MeshPhongMaterial({ map: neptuneTexture })
);
neptune.position.set(distances.neptune, 0, 0);  // Set initial position
neptune.castShadow = true;
neptune.receiveShadow = true;

var neptuneGroup = new THREE.Group();
neptuneGroup.add(neptune);
scene.add(neptuneGroup);

var neptuneBB = new THREE.Sphere(neptune.position, 3.88 * 3.2+0.2);

// Spaceship

var spaceship;
var spaceshipBB;
loader.load('assets/space-fighter/source/SpaceFighter/SpaceFighter.fbx', function (object) {
    spaceship = object;
    scene.add(spaceship);
    spaceship.scale.set(0.002, 0.002, 0.002);
    spaceship.position.set(-23.742425141527058,  21.922663308445653, -34.31258547217597);
    spaceship.rotation.y = 0.6052997642113855;
    
    const spaceshipLight = new THREE.PointLight(0xed7014, 100);
    spaceshipLight.position.set(0, 2, 0); // Set initial position of the light
    spaceship.add(spaceshipLight); // Attach the light to the spaceship

    const helpp = new THREE.PointLightHelper(spaceshipLight, 3);
    scene.add(helpp);

    spaceshipBB = new THREE.Sphere(spaceship.position, 3.8);
});

var saturnBB;
var saturn;
loader.load('assets/saturn/source/Saturn.fbx', function (object) {
    var saturnTexture = new THREE.TextureLoader().load('assets/saturn/textures/8k_saturn.jpg');
    saturn = object;
    scene.add(saturn);
    saturn.scale.set(0.15, 0.15, 0.15);
    saturn.position.set(distances.saturn, 0, 0);
    

    saturnBB = new THREE.Sphere(saturn.position, 9.45 * 3.2+0.2);
    var saturnGroup = new THREE.Group();
    saturnGroup.add(saturn);
    scene.add(saturnGroup);
});



// Stars
function addStar(){
    let size = Math.random() * 0.3;
    let star = new THREE.Mesh(
        new THREE.SphereGeometry(size, 16, 16),
        new THREE.MeshPhongMaterial({emissive:0x7e2e11, emissiveIntensity:0.8, }),
    );

    let xpos = Math.random() * 500 - 250;
    let ypos = Math.random() * 300 - 150;
    let zpos = Math.random() * 500 - 250;

    star.position.set(xpos, ypos, zpos);
    scene.add(star);
}
for(let i = 0;i < 1000; i++) addStar();


// Cloud
loader.load('assets/cloud/fbx/Cloud_Long.fbx', function (object) {
    
    object.scale.setScalar(0.005);
    object.position.set(3.5, 2, 0);

        object.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
    earth.add(object);
});

loader.load('assets/cloud/fbx/Cloud_Large.fbx', function (object) {
    
    object.scale.setScalar(0.005);
    object.position.set(3, -2, 1);
    object.rotation.y = THREE.MathUtils.degToRad(-40)

        object.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
    earth.add(object);
});

loader.load('assets/cloud/fbx/Cloud_Medium.fbx', function (object) {
    
    object.scale.setScalar(0.005);
    object.position.set(-3, -2, -1);
    object.rotation.y = THREE.MathUtils.degToRad(-30)

        object.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
    earth.add(object);
});

loader.load('assets/cloud/fbx/Cloud_Medium2.fbx', function (object) {
    
    object.scale.setScalar(0.005);
    object.position.set(-3, 2, 1);
    object.rotation.y = THREE.MathUtils.degToRad(30)

        object.traverse((child) => {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0.6;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
    earth.add(object);
});







// ASSET BARU







const loader2 = new GLTFLoader();
var station3BB = new THREE.Sphere(new THREE.Vector3(50, 25, -10), 15);
//stationSBB = new THREE.Sphere(stationS.position, 10);
loader2.load('assets/space_station_3/scene.gltf',  (gltf)=> {
    // onLoad function as an anonymous function
    gltf.scene.scale.set(3,3,3);
    gltf.scene.position.set(50, 25, -10);
    
    scene.add(gltf.scene);
});

var cobaBox = new THREE.Mesh(
    new THREE.BoxGeometry(38,10, 38),
    new THREE.MeshPhongMaterial({color:0xffffff})
)
cobaBox.position.set(45, 20, -25);
cobaBox.material.transparent = true;
cobaBox.material.opacity = 0.5;
// scene.add(cobaBox);

var futuristicBB = new THREE.Box3();
futuristicBB.setFromObject(cobaBox);

//x=-28.953959528413414, y=29.272787426691796, z=75.19577631816777

loader2.load('assets/futuristic_open-concept_space_station/scene.gltf',  (gltf)=> {
    // onLoad function as an anonymous function
    gltf.scene.scale.set(0.1,0.1,0.1);
    gltf.scene.position.set(45, 20, -25);
    
    scene.add(gltf.scene);
    // futuristicBB = new THREE.Sphere(45,20,-25,18);
});



var ship1BB = new THREE.Sphere(new THREE.Vector3(-33.02393014710975, 26.654477597206355 + 2, 67.17128089787136 + 7), 8.8);
loader2.load('newAssets/simple_spaceship/scene.gltf',  (gltf)=> {
    // onLoad function as an anonymous function
    gltf.scene.scale.set(1,1,1);
    gltf.scene.position.set(-33.02393014710975, 26.654477597206355, 67.17128089787136);
    gltf.scene.rotation.y= THREE.MathUtils.degToRad(180);
   
    scene.add(gltf.scene);
    var objectLight = new THREE.PointLight(0xffcaac, 5000, 1000);
    objectLight.position.set(0, 5, 0);
    gltf.scene.add(objectLight);
    
});

var ship2BB = new THREE.Sphere(new THREE.Vector3(-23.02393014710975, 22.654477597206355 + 2, 67.17128089787136 + 7), 8.8);
loader2.load('newAssets/simple_spaceship/scene.gltf',  (gltf)=> {
    // onLoad function as an anonymous function
    gltf.scene.scale.set(1,1,1);
    gltf.scene.position.set(-23.02393014710975, 22.654477597206355, 67.17128089787136);
    gltf.scene.rotation.y= THREE.MathUtils.degToRad(180);
    scene.add(gltf.scene);
});

var ship3BB = new THREE.Sphere(new THREE.Vector3(-43.02393014710975, 22.654477597206355 + 2, 67.17128089787136 + 7), 8.8);
loader2.load('newAssets/simple_spaceship/scene.gltf',  (gltf)=> {
    // onLoad function as an anonymous function
    gltf.scene.scale.set(1,1,1);
    gltf.scene.position.set(-43.02393014710975, 22.654477597206355, 67.17128089787136);
    gltf.scene.rotation.y= THREE.MathUtils.degToRad(180);
    scene.add(gltf.scene);
});

var mothership;
var mothershipBB = new THREE.Box3();

var cobaBoxMothership = new THREE.Mesh(
    new THREE.BoxGeometry(55,12,68),
    new THREE.MeshPhongMaterial({color:0xffffff})
)
cobaBoxMothership.position.set(-80.40036033590732 + 52, 15.52944240791382 + 40, 80.73433967767522 - 7);
cobaBoxMothership.material.transparent = true;
cobaBoxMothership.material.opacity = 0.5;
// scene.add(cobaBoxMothership);

mothershipBB.setFromObject(cobaBoxMothership);

loader.load('newAssets/hull-spaceship/source/source/source.fbx', function (object) {
    mothership = object;
    scene.add(mothership);
    mothership.scale.set(0.04, 0.04, 0.04);
    mothership.position.set(-80.40036033590732, 15.52944240791382, 80.73433967767522);

    var light = new THREE.PointLight(0xffffff, 100, 100);
    light.position.y += 70;
    light.position.x -= 50;
    mothership.add(light); 
});



var stationS;
var stationSBB;

loader.load('assets/space-station/source/p_887_spaceStation.fbx', function (object) {
    stationS = object;
    scene.add(stationS);
    stationS.scale.set(0.02, 0.02, 0.02);
    stationS.position.set(-27, 20, -20);

    const stationSLight = new THREE.PointLight(0xed7014, 100);
    stationSLight.position.set(0, 2, 0); // Set initial position of the light
    stationS.add(stationSLight); // Attach the light to the stationS

    const helpp = new THREE.PointLightHelper(stationSLight, 3);
    scene.add(helpp);

    stationSBB = new THREE.Sphere(stationS.position, 10);
});

var coba = new THREE.Mesh(
    new THREE.SphereGeometry(6, 64, 64),
    new THREE.MeshPhongMaterial({color:0xffffff})
)
coba.position.set(-49.6146465138581, 29.318121212241703, -25.957266302136013);
coba.material.transparent = true;
coba.material.opacity = 0.5;
// scene.add(coba);

var ship4, ship5, ship6;
var ship4BB, ship5BB, ship6BB;

ship4BB = new THREE.Sphere(new THREE.Vector3(-44.6146465138581, 24.318121212241703 + 2, -25.957266302136013), 6)
loader.load('newAssets/light-fighter-spaceship-free/source/spaceship_3.fbx', function (object) {
    ship4 = object;
    scene.add(ship4);
    ship4.scale.set(0.01, 0.01, 0.01);
    ship4.position.set(-44.6146465138581, 24.318121212241703, -25.957266302136013);
});
ship5BB = new THREE.Sphere(new THREE.Vector3(-49.6146465138581, 29.318121212241703, -25.957266302136013), 6)
loader.load('newAssets/light-fighter-spaceship-free/source/spaceship_3.fbx', function (object) {
    ship5 = object;
    scene.add(ship5);
    ship5.scale.set(0.01, 0.01, 0.01);
    ship5.position.set(-49.6146465138581, 29.318121212241703, -25.957266302136013);

    const ship5Light = new THREE.PointLight(0xed7014, 100);
    ship5.add(ship5Light);
});
ship6BB = new THREE.Sphere(new THREE.Vector3(-57.6146465138581, 24.318121212241703 + 2, -25.957266302136013), 6)
loader.load('newAssets/light-fighter-spaceship-free/source/spaceship_3.fbx', function (object) {
    ship6 = object;
    scene.add(ship6);
    ship6.scale.set(0.01, 0.01, 0.01);
    ship6.position.set(-57.6146465138581, 24.318121212241703, -25.957266302136013);
});

//x=-36.40036033590732, y=52.52944240791382, z=80.73433967767522
var satellite;
var satelliteBB;
// Satellite
function loadSatellite() {
    return new Promise((resolve, reject) => {
        new MTLLoader()
            .setPath('assets/satellite/')
            .load('Satelite.mtl', function (materials) {
                materials.preload();
                new OBJLoader()
                    .setMaterials(materials)
                    .setPath('assets/satellite/')
                    .load('Satelite.obj', function (object) {
                        satellite = object;
                        earth.add(object);
                        object.scale.set(0.2, 0.2, 0.2);
                        object.position.set(-13, 3, 5);

                        // Create bounding sphere
                        satelliteBB = new THREE.Sphere(object.position, 0.5);

                        resolve();
                    }, undefined, reject);
            }, undefined, reject);
    });
}

// Load the satellite and then continue with the rest of your code
loadSatellite().then(() => {
    animate()
}).catch((error) => {
});



// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2); 
scene.add(ambientLight);
const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.2 );
sun.add( light );

// Sun Light
const sunLight = new THREE.PointLight(0xccaa88, 5000, 8000, 2);
sunLight.castShadow = true;
sun.add(sunLight);

// Movement
let prevX = 0, prevY = 0;
// zoom, rotate
let dx = 0, dy = 0, dz = 0;
let isHold = false;

function crossProduct(vec1, vec2) {
    const result = new THREE.Vector3();
    result.crossVectors(vec1, vec2);
    return result;
}
function calculateAngleBetweenVectors(v1, v2) {
    // Normalize the vectors
    const vec1 = v1.clone().normalize();
    const vec2 = v2.clone().normalize();

    // Calculate the dot product
    const dotProduct = vec1.dot(vec2);

    // Clamp the dot product to avoid floating point errors
    const clampedDot = Math.min(Math.max(dotProduct, -1), 1);

    // Calculate the angle in radians
    const angleInRadians = Math.acos(clampedDot);

    // Convert the angle to degrees
    const angleInDegrees = THREE.MathUtils.radToDeg(angleInRadians);

    // Calculate the cross product to determine the direction of the angle
    const crossProduct = new THREE.Vector3().crossVectors(vec1, vec2);

    // If the z-component of the cross product is negative, the angle is greater than 180 degrees
    if (crossProduct.z < 0) {
        return 360 - angleInDegrees;
    }

    return angleInDegrees;
}
function keyDown(e){
    let vec = {};
    vec.x = cameraTarget.x - camera.position.x;
    vec.y = cameraTarget.y - camera.position.y;
    vec.z = cameraTarget.z - camera.position.z;

    let v1 = new THREE.Vector3(vec.x, vec.y, vec.z);
    let v2 = new THREE.Vector3(0, 1, 0);
    let cross = crossProduct(v1, v2);

    const mul = 0.008;

    if(e.key == 'w'){
        camera.position.x += vec.x * mul;
        camera.position.y += vec.y * mul;
        camera.position.z += vec.z * mul;
        cameraTarget.x += vec.x * mul;
        cameraTarget.y += vec.y * mul;
        cameraTarget.z += vec.z * mul;

        if(isCameraCollide()){
            camera.position.x -= vec.x * mul;
            camera.position.y -= vec.y * mul;
            camera.position.z -= vec.z * mul;
            cameraTarget.x -= vec.x * mul;
            cameraTarget.y -= vec.y * mul;
            cameraTarget.z -= vec.z * mul;
        }
        console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
    }
    if(e.key == 'd'){
        camZRotate += 0.01;
        if(camZRotate > tiltRange + Math.PI) camZRotate = tiltRange + Math.PI;
        isTiltHold = true;

        camera.position.x += cross.x * mul;
        camera.position.y += cross.y * mul;
        camera.position.z += cross.z * mul;
        cameraTarget.x += cross.x * mul;
        cameraTarget.y += cross.y * mul;
        cameraTarget.z += cross.z * mul;

        if(isCameraCollide()){
            camera.position.x -= cross.x * mul;
            camera.position.y -= cross.y * mul;
            camera.position.z -= cross.z * mul;
            cameraTarget.x -= cross.x * mul;
            cameraTarget.y -= cross.y * mul;
            cameraTarget.z -= cross.z * mul;
        }
        console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
    }
    if(e.key == 's'){
        camera.position.x -= vec.x * mul;
        camera.position.y -= vec.y * mul;
        camera.position.z -= vec.z * mul;
        cameraTarget.x -= vec.x * mul;
        cameraTarget.y -= vec.y * mul;
        cameraTarget.z -= vec.z * mul;

        if(isCameraCollide()){
            camera.position.x += vec.x * mul;
            camera.position.y += vec.y * mul;
            camera.position.z += vec.z * mul;
            cameraTarget.x += vec.x * mul;
            cameraTarget.y += vec.y * mul;
            cameraTarget.z += vec.z * mul;
        }
        console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
    }
    if(e.key == 'a'){
        camZRotate -= 0.01;
        if(camZRotate < -tiltRange + Math.PI) camZRotate = -tiltRange + Math.PI;
        isTiltHold = true;

        camera.position.x -= cross.x * mul;
        camera.position.y -= cross.y * mul;
        camera.position.z -= cross.z * mul;
        cameraTarget.x -= cross.x * mul;
        cameraTarget.y -= cross.y * mul;
        cameraTarget.z -= cross.z * mul;

        if(isCameraCollide()){
            camera.position.x += cross.x * mul;
            camera.position.y += cross.y * mul;
            camera.position.z += cross.z * mul;
            cameraTarget.x += cross.x * mul;
            cameraTarget.y += cross.y * mul;
            cameraTarget.z += cross.z * mul;
        }
        console.log(`Camera Position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
    }

    if(e.key == ' '){
        viewMode = (viewMode + 1) % 3;
        var ele = document.getElementById("mode");
        if(viewMode == 0){
            ele.innerHTML = "Spaceship Mode";
        }
        else if(viewMode == 1){
            ele.innerHTML = "Free Mode";
        }
        else{
            ele.innerHTML = "Orbit Mode";
        }
    }

    if(e.key == 'ArrowLeft' && viewMode == 2){
        orbitDegree-=3;
    }
    else if(e.key == 'ArrowRight' && viewMode == 2){
        orbitDegree+=3;
    }
    else if(e.key == 'ArrowUp' && viewMode == 2){
        orbitY += 0.3;
        if(orbitY >= orbitDistance) orbitY = orbitDistance - 0.3;
    }
    else if(e.key == 'ArrowDown' && viewMode == 2){
        orbitY -= 0.3;
        if(orbitY <= -orbitDistance) orbitY = -orbitDistance + 0.3;
    }

}
// rotate
function mouseDown(e) {
    isHold = true;
}
function mouseUp(e) {
    isHold = false;
}
function mouseMove(e) {
    if(isHold){
        dx += (e.clientX - prevX) * 0.05;
        dy += (e.clientY - prevY) * 0.05;

        // mentok
        dy = Math.max(-30, Math.min(30, dy));
    }
    prevX = e.clientX;
    prevY = e.clientY;
}
// zoom
function onWheel(event) {
    let amount = event.deltaY;
    dz += amount;
    dz = Math.max(-800, Math.min(800, dz));

    if(viewMode == 2){
        if(amount < 0) orbitDistance += 0.2;
        if(amount > 0) orbitDistance -= 0.2;

        if(orbitDistance < 5) orbitDistance += 0.2;
        if(orbitDistance > 50) orbitDistance -= 0.2;
    }
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', (e)=>{
    if(e.key == 'a' || e.key == 'd'){
        isTiltHold = false;
    }
})
window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);
window.addEventListener('mousemove', mouseMove);
// zoom
window.addEventListener('wheel', onWheel);

// collision
function isCameraCollide(){
    let ans = false;

    if(viewMode == 0){
        spaceshipBB.center = new THREE.Vector3(spaceship.position.x, spaceship.position.y, spaceship.position.z);
        if(spaceshipBB.intersectsSphere(sunBB) || spaceshipBB.intersectsSphere(earthBB) || spaceshipBB.intersectsSphere(moonBB) || 
           spaceshipBB.intersectsSphere(marsBB)||  spaceshipBB.intersectsSphere(jupiterBB) || spaceshipBB.intersectsSphere(venusBB) || 
           spaceshipBB.intersectsSphere(saturnBB) || spaceshipBB.intersectsSphere(uranusBB) || spaceshipBB.intersectsSphere(neptuneBB) ||
           spaceshipBB.intersectsSphere(satelliteBB) || spaceshipBB.intersectsSphere(stationSBB)|| spaceshipBB.intersectsSphere(mercuryBB) 
           || spaceshipBB.intersectsSphere(station3BB)
           || spaceshipBB.intersectsBox(futuristicBB)
           || spaceshipBB.intersectsSphere(ship1BB)
           || spaceshipBB.intersectsSphere(ship2BB)
           || spaceshipBB.intersectsSphere(ship3BB)
           || spaceshipBB.intersectsSphere(ship4BB)
           || spaceshipBB.intersectsSphere(ship5BB)
           || spaceshipBB.intersectsSphere(ship6BB)
           || spaceshipBB.intersectsBox(mothershipBB)
          ){
            ans = true;
        }
    }
    else{
        spaceshipBB.center = new THREE.Vector3(spaceship.position.x, spaceship.position.y, spaceship.position.z);
        camBB.center = new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z);
        if(camBB.intersectsSphere(sunBB) || camBB.intersectsSphere(earthBB) || camBB.intersectsSphere(moonBB) || 
           camBB.intersectsSphere(marsBB) || camBB.intersectsSphere(jupiterBB) || camBB.intersectsSphere(venusBB) || 
           camBB.intersectsSphere(saturnBB) || camBB.intersectsSphere(uranusBB) || camBB.intersectsSphere(neptuneBB) ||
           camBB.intersectsSphere(spaceshipBB) || camBB.intersectsSphere(satelliteBB) || camBB.intersectsSphere(stationSBB)|| 
           camBB.intersectsSphere(mercuryBB) 
            || camBB.intersectsSphere(station3BB)
            || camBB.intersectsBox(futuristicBB)
            || camBB.intersectsSphere(ship1BB)
            || camBB.intersectsSphere(ship2BB)
            || camBB.intersectsSphere(ship3BB)
            || camBB.intersectsSphere(ship4BB)
            || camBB.intersectsSphere(ship5BB)
            || camBB.intersectsSphere(ship6BB)
            || camBB.intersectsBox(mothershipBB)

           ){
            ans = true;
        }
    }
    return ans;
}
// || camBB.intersectsSphere(station3BB)|| camBB.intersectsSphere(futuristicBB)

function checkCollision(){
    if(viewMode == 0){
        if(spaceshipBB.intersectsSphere(sunBB) || camBB.intersectsSphere(sunBB)){
            let x = camBB.center.x - sunBB.center.x;
            let z = camBB.center.z - sunBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(earthBB) || camBB.intersectsSphere(earthBB)){
            let x = camBB.center.x - earthBB.center.x;
            let z = camBB.center.z - earthBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(moonBB) || camBB.intersectsSphere(moonBB)){
            let x = camBB.center.x - moonBB.center.x;
            let z = camBB.center.z - moonBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(marsBB) || camBB.intersectsSphere(marsBB)){
            let x = camBB.center.x - marsBB.center.x;
            let z = camBB.center.z - marsBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(jupiterBB) || camBB.intersectsSphere(jupiterBB)){
            let x = camBB.center.x - jupiterBB.center.x;
            let z = camBB.center.z - jupiterBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(venusBB) || camBB.intersectsSphere(venusBB)){
            let x = camBB.center.x - venusBB.center.x;
            let z = camBB.center.z - venusBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(saturnBB) || camBB.intersectsSphere(saturnBB)){
            let x = camBB.center.x - saturnBB.center.x;
            let z = camBB.center.z - saturnBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(uranusBB) || camBB.intersectsSphere(uranusBB)){
            let x = camBB.center.x - uranusBB.center.x;
            let z = camBB.center.z - uranusBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(neptuneBB) || camBB.intersectsSphere(neptuneBB)){
            let x = camBB.center.x - neptuneBB.center.x;
            let z = camBB.center.z - neptuneBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(satelliteBB) || camBB.intersectsSphere(satelliteBB)){
            let x = camBB.center.x - satelliteBB.center.x;
            let z = camBB.center.z - satelliteBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(stationSBB) || camBB.intersectsSphere(stationSBB)){
            let x = camBB.center.x - stationSBB.center.x;
            let z = camBB.center.z - stationSBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(mercuryBB) || camBB.intersectsSphere(mercuryBB)){
            let x = camBB.center.x - mercuryBB.center.x;
            let z = camBB.center.z - mercuryBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(station3BB) || camBB.intersectsSphere(station3BB)){
            let x = camBB.center.x - station3BB.center.x;
            let z = camBB.center.z - station3BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsBox(futuristicBB) || camBB.intersectsBox(futuristicBB)){
            let x = camBB.center.x - (futuristicBB.max.x + futuristicBB.min.x) / 2; 
            let z = camBB.center.z - (futuristicBB.max.z + futuristicBB.min.x) / 2;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship1BB) || camBB.intersectsSphere(ship1BB)){
            let x = camBB.center.x - ship1BB.center.x;
            let z = camBB.center.z - ship1BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship2BB) || camBB.intersectsSphere(ship2BB)){
            let x = camBB.center.x - ship2BB.center.x;
            let z = camBB.center.z - ship2BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship3BB) || camBB.intersectsSphere(ship3BB)){
            let x = camBB.center.x - ship3BB.center.x;
            let z = camBB.center.z - ship3BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsBox(mothershipBB) || camBB.intersectsBox(mothershipBB)){
            let x = camBB.center.x - (mothershipBB.max.x + mothershipBB.min.x) / 2; 
            let z = camBB.center.z - (mothershipBB.max.z + mothershipBB.min.x) / 2;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship4BB) || camBB.intersectsSphere(ship4BB)){
            let x = camBB.center.x - ship4BB.center.x;
            let z = camBB.center.z - ship4BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship5BB) || camBB.intersectsSphere(ship5BB)){
            let x = camBB.center.x - ship5BB.center.x;
            let z = camBB.center.z - ship5BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship6BB) || camBB.intersectsSphere(ship6BB)){
            let x = camBB.center.x - ship6BB.center.x;
            let z = camBB.center.z - ship6BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
    }
    else{
        if(camBB.intersectsSphere(sunBB)){
            let x = camBB.center.x - sunBB.center.x;
            let z = camBB.center.z - sunBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(earthBB)){
            let x = camBB.center.x - earthBB.center.x;
            let z = camBB.center.z - earthBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(moonBB)){
            let x = camBB.center.x - moonBB.center.x;
            let z = camBB.center.z - moonBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(marsBB)){
            let x = camBB.center.x - marsBB.center.x;
            let z = camBB.center.z - marsBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(jupiterBB)){
            let x = camBB.center.x - jupiterBB.center.x;
            let z = camBB.center.z - jupiterBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(venusBB)){
            let x = camBB.center.x - venusBB.center.x;
            let z = camBB.center.z - venusBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(saturnBB)){
            let x = camBB.center.x - saturnBB.center.x;
            let z = camBB.center.z - saturnBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(uranusBB)){
            let x = camBB.center.x - uranusBB.center.x;
            let z = camBB.center.z - uranusBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(neptuneBB)){
            let x = camBB.center.x - neptuneBB.center.x;
            let z = camBB.center.z - neptuneBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(satelliteBB)){
            let x = camBB.center.x - satelliteBB.center.x;
            let z = camBB.center.z - satelliteBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(stationSBB)){
            let x = camBB.center.x - stationSBB.center.x;
            let z = camBB.center.z - stationSBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(mercuryBB)){
            let x = camBB.center.x - mercuryBB.center.x;
            let z = camBB.center.z - mercuryBB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(station3BB)){
            let x = camBB.center.x - station3BB.center.x;
            let z = camBB.center.z - station3BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsBox(futuristicBB)){
            let x = camBB.center.x - (futuristicBB.max.x + futuristicBB.min.x) / 2; 
            let z = camBB.center.z - (futuristicBB.max.z + futuristicBB.min.x) / 2;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship1BB)){
            let x = camBB.center.x - ship1BB.center.x;
            let z = camBB.center.z - ship1BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship2BB)){
            let x = camBB.center.x - ship2BB.center.x;
            let z = camBB.center.z - ship2BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship3BB)){
            let x = camBB.center.x - ship3BB.center.x;
            let z = camBB.center.z - ship3BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsBox(mothershipBB)){
            let x = camBB.center.x - (mothershipBB.max.x + mothershipBB.min.x) / 2; 
            let z = camBB.center.z - (mothershipBB.max.z + mothershipBB.min.x) / 2;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship4BB)){
            let x = camBB.center.x - ship4BB.center.x;
            let z = camBB.center.z - ship4BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship5BB)){
            let x = camBB.center.x - ship5BB.center.x;
            let z = camBB.center.z - ship5BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }
        if(camBB.intersectsSphere(ship6BB)){
            let x = camBB.center.x - ship6BB.center.x;
            let z = camBB.center.z - ship6BB.center.z;

            camera.position.x += x * 0.05;
            camera.position.z += z * 0.05;
        }





        if(spaceshipBB.intersectsSphere(sunBB)){
            let x = camBB.center.x - sunBB.center.x;
            let z = camBB.center.z - sunBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(earthBB)){
            let x = camBB.center.x - earthBB.center.x;
            let z = camBB.center.z - earthBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(moonBB)){
            let x = camBB.center.x - moonBB.center.x;
            let z = camBB.center.z - moonBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(marsBB)){
            let x = camBB.center.x - marsBB.center.x;
            let z = camBB.center.z - marsBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(jupiterBB)){
            let x = camBB.center.x - jupiterBB.center.x;
            let z = camBB.center.z - jupiterBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(venusBB)){
            let x = camBB.center.x - venusBB.center.x;
            let z = camBB.center.z - venusBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(saturnBB)){
            let x = camBB.center.x - saturnBB.center.x;
            let z = camBB.center.z - saturnBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(uranusBB)){
            let x = camBB.center.x - uranusBB.center.x;
            let z = camBB.center.z - uranusBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(neptuneBB)){
            let x = camBB.center.x - neptuneBB.center.x;
            let z = camBB.center.z - neptuneBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(satelliteBB)){
            let x = camBB.center.x - satelliteBB.center.x;
            let z = camBB.center.z - satelliteBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(mercuryBB)){
            let x = camBB.center.x - mercuryBB.center.x;
            let z = camBB.center.z - mercuryBB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(station3BB)){
            let x = camBB.center.x - station3BB.center.x;
            let z = camBB.center.z - station3BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsBox(futuristicBB)){
            let x = camBB.center.x - (futuristicBB.max.x + futuristicBB.min.x) / 2; 
            let z = camBB.center.z - (futuristicBB.max.z + futuristicBB.min.x) / 2;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship1BB)){
            let x = camBB.center.x - ship1BB.center.x;
            let z = camBB.center.z - ship1BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }if(spaceshipBB.intersectsSphere(ship2BB)){
            let x = camBB.center.x - ship2BB.center.x;
            let z = camBB.center.z - ship2BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }if(spaceshipBB.intersectsSphere(ship3BB)){
            let x = camBB.center.x - ship3BB.center.x;
            let z = camBB.center.z - ship3BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsBox(mothershipBB)){
            let x = camBB.center.x - (mothershipBB.max.x + mothershipBB.min.x) / 2; 
            let z = camBB.center.z - (mothershipBB.max.z + mothershipBB.min.x) / 2;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship4BB)){
            let x = camBB.center.x - ship4BB.center.x;
            let z = camBB.center.z - ship4BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship5BB)){
            let x = camBB.center.x - ship5BB.center.x;
            let z = camBB.center.z - ship5BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
        if(spaceshipBB.intersectsSphere(ship6BB)){
            let x = camBB.center.x - ship6BB.center.x;
            let z = camBB.center.z - ship6BB.center.z;

            spaceship.position.x += x * 0.05;
            spaceship.position.z += z * 0.05;
        }
    }
}

let clock = new THREE.Clock();
const tl = gsap.timeline;
const zFinal=3;
const xFinal =3;
const yFinal = 3;
let isAnimating = false;

// window.addEventListener('keydown', function() {
//     if (isAnimating) return; // Prevent starting a new animation if one is already running
//     isAnimating = true;

//     gsap.timeline({
//         onComplete: function() {
//             isAnimating = false; // Reset the flag when the animation is complete
//         }
//     })
//     .to(camera.position, {
//         z: zFinal,
//         duration: 0.25,
//         onUpdate: function() {
//             camera.lookAt(sunBB.center);
//         }
//     })
//     .to(camera.position, {
//         y: yFinal,
//         duration: 0.25,
//         onUpdate: function() {
//             camera.lookAt(sunBB.center);
//         }
//     })
//     .to(camera.position, {
//         x: xFinal,
//         y: 10,
//         z: 10,
//         duration: 0.25,
//         onUpdate: function() {
//             camera.lookAt(sunBB.center);
//         }
//     })
//     .to(camera.position, {
//         x: 0,
//         y: 0,
//         z: 0,
//         duration: 0.25,
//         onUpdate: function() {
//             camera.lookAt(sunBB.center);
//         }
//     });
// });

// Loop Animate
function animate(){
    var time = Date.now() * 0.0001;

    mercury.position.set(
        distances.mercury * Math.cos(time * orbitalSpeeds.mercury),
        0,
        distances.mercury * Math.sin(time * orbitalSpeeds.mercury)
    );

    venus.position.set(
        distances.venus * Math.cos(time * orbitalSpeeds.venus),
        0,
        distances.venus * Math.sin(time * orbitalSpeeds.venus)
    );

    earth.position.set(
        distances.earth * Math.cos(time * orbitalSpeeds.earth),
        0,
        distances.earth * Math.sin(time * orbitalSpeeds.earth)
    );

    mars.position.set(
        distances.mars * Math.cos(time * orbitalSpeeds.mars),
        0,
        distances.mars * Math.sin(time * orbitalSpeeds.mars)
    );

    jupiter.position.set(
        distances.jupiter * Math.cos(time * orbitalSpeeds.jupiter),
        0,
        distances.jupiter * Math.sin(time * orbitalSpeeds.jupiter)
    );

    saturn.position.set(
        distances.saturn * Math.cos(time * orbitalSpeeds.saturn),
        0,
        distances.saturn * Math.sin(time * orbitalSpeeds.saturn)
    );

    uranus.position.set(
        distances.uranus * Math.cos(time * orbitalSpeeds.uranus),
        0,
        distances.uranus * Math.sin(time * orbitalSpeeds.uranus)
    );

    neptune.position.set(
        distances.neptune * Math.cos(time * orbitalSpeeds.neptune),
        0,
        distances.neptune * Math.sin(time * orbitalSpeeds.neptune)
    );

    

    if(!isTiltHold){
        if(camZRotate > Math.PI) camZRotate -= 0.01;
        else if(camZRotate < Math.PI) camZRotate += 0.01;
    }

    // Planet rotation
    sun.rotation.y += 0.001;
    earth.rotation.y += 0.01;
    moon.rotation.y += 0.01;
    mars.rotation.y += 0.008;
    jupiter.rotation.y += 0.002;
    saturn.rotation.y += 0.002;
    uranus.rotation.y += 0.002;
    neptune.rotation.y += 0.002;

    if(animationEnded){
        
    }
    // Update cameraTarget
    // rotate
    let dif = new THREE.Vector3(cameraTarget.x - camera.position.x, cameraTarget.y- camera.position.y, cameraTarget.z - camera.position.z);
    let up = new THREE.Vector3(0,1, 0);
    let prod = crossProduct(dif, up);
    const initLength = dif.length();
    const spaceCameraLength = 10;

    let updCameraTarget = new THREE.Vector3(0, 0, 0);

    updCameraTarget.x = cameraTarget.x + prod.x * 0.03 * dx;
    updCameraTarget.y = cameraTarget.y + prod.y * 0.03 * dx;
    updCameraTarget.z = cameraTarget.z + prod.z * 0.03 * dx;
    dx = 0;

    let prod2 = crossProduct(dif, prod);

    updCameraTarget.x = updCameraTarget.x + prod2.x * 0.0006 * dy;
    updCameraTarget.y = updCameraTarget.y + prod2.y * 0.0006 * dy;
    updCameraTarget.z = updCameraTarget.z + prod2.z * 0.0006 * dy;
    dy = 0;

    let lastDif = new THREE.Vector3(updCameraTarget.x - camera.position.x, updCameraTarget.y - camera.position.y, updCameraTarget.z - camera.position.z)
    const nowLength = lastDif.length();
    let mult = initLength / nowLength;

    updCameraTarget.x = camera.position.x + mult * lastDif.x;
    updCameraTarget.y = camera.position.y + mult * lastDif.y;
    updCameraTarget.z = camera.position.z + mult * lastDif.z;

    // zoom
    let diff = new THREE.Vector3(updCameraTarget.x - camera.position.x, updCameraTarget.y - camera.position.y, updCameraTarget.z - camera.position.z);
    let diffLength = diff.length();
    let mult2 = 0.0005 * dz;

    camera.position.x += diff.x * mult2;
    camera.position.y += diff.y * mult2;
    camera.position.z += diff.z * mult2;
    dz = 0;

    if(viewMode == 1 && isCameraCollide()){
        camera.position.x -= diff.x * mult2;
        camera.position.y -= diff.y * mult2;
        camera.position.z -= diff.z * mult2;
    }
    
    camera.lookAt(updCameraTarget);
    cameraTarget = updCameraTarget;

    if(animationEnded && viewMode == 0){
        spaceship.position.x = camera.position.x + spaceCameraLength / diffLength * diff.x;
        spaceship.position.y = camera.position.y + spaceCameraLength / diffLength * diff.y;
        spaceship.position.z = camera.position.z + spaceCameraLength / diffLength * diff.z;

        if(isCameraCollide()){
            camera.position.x -= diff.x * mult2;
            camera.position.y -= diff.y * mult2;
            camera.position.z -= diff.z * mult2;
            spaceship.position.x = camera.position.x + spaceCameraLength / diffLength * diff.x;
            spaceship.position.y = camera.position.y + spaceCameraLength / diffLength * diff.y;
            spaceship.position.z = camera.position.z + spaceCameraLength / diffLength * diff.z;
        }

        let difPlane = new THREE.Vector3(updCameraTarget.x - camera.position.x, 0, updCameraTarget.z - camera.position.z);
        let front = new THREE.Vector3(0, 0, 1);
        let degree = calculateAngleBetweenVectors(difPlane, front);
        if(difPlane.x < 0) degree = 360 - degree;
        spaceship.rotation.y = degree * 0.0174533;
    }

    // Updating BB
    const sunPosition = new THREE.Vector3();
    sun.getWorldPosition(sunPosition);
    const earthPosition = new THREE.Vector3();
    earth.getWorldPosition(earthPosition);
    const moonPosition = new THREE.Vector3();
    moon.getWorldPosition(moonPosition);
    const marsPosition = new THREE.Vector3();
    mars.getWorldPosition(marsPosition);
    const jupiterPosition = new THREE.Vector3();
    jupiter.getWorldPosition(jupiterPosition);
    const venusPosition = new THREE.Vector3();
    venus.getWorldPosition(venusPosition);
    const saturnPosition = new THREE.Vector3();
    saturn.getWorldPosition(saturnPosition);
    const uranusPosition = new THREE.Vector3();
    uranus.getWorldPosition(uranusPosition);
    const neptunePosition = new THREE.Vector3();
    neptune.getWorldPosition(neptunePosition);
    const spaceshipPosition = new THREE.Vector3();
    spaceship.getWorldPosition(spaceshipPosition);
    const satellitePosition = new THREE.Vector3();
    satellite.getWorldPosition(satellitePosition);
    const mercuryPosition = new THREE.Vector3();
    mercury.getWorldPosition(mercuryPosition);


    sunBB.center = sunPosition;
    earthBB.center = earthPosition;
    moonBB.center = moonPosition;
    marsBB.center = marsPosition;
    jupiterBB.center = jupiterPosition;
    venusBB.center = venusPosition;
    saturnBB.center = saturnPosition;
    uranusBB.center = uranusPosition;
    neptuneBB.center = neptunePosition;
    spaceshipBB.center = spaceshipPosition;
    camBB.center = camera.position;
    satelliteBB.center = satellitePosition;
    mercuryBB.center = mercuryPosition;

    if(viewMode == 2){
        let curDistance = Math.sqrt(Math.pow(orbitDistance, 2) - Math.pow(orbitY, 2));

        let posX = spaceship.position.x + Math.sin(THREE.MathUtils.degToRad(orbitDegree)) * curDistance;
        let posY = orbitY;
        let posZ = spaceship.position.z + Math.cos(THREE.MathUtils.degToRad(orbitDegree)) * curDistance;

        camera.position.set(posX, posY, posZ);
        camera.lookAt(spaceship.position);
    }   

    if(viewMode == 0){
        camera.rotation.z += camZRotate - Math.PI;
    }
    
    // Check for collision
    if(animationEnded){
        checkCollision();
    }
    TWEEN.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}