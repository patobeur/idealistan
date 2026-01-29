import * as THREE from 'three';
import { createTrees } from './trees.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(200, 200, 200);
scene.add(directionalLight);
scene.background = new THREE.Color(0x87ceeb); // Sky blue

// Planet
const sphereRadius = 200;
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 64, 64);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x90ee90,
    roughness: 0.8,
    metalness: 0.2
});
const planet = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(planet);

// Add Trees
createTrees(planet, sphereRadius, 200);

// Grid on planet
const wireframe = new THREE.WireframeGeometry(sphereGeometry);
const line = new THREE.LineSegments(wireframe);
line.material.color.setHex(0x000000);
line.material.transparent = true;
line.material.opacity = 0.2;
planet.add(line);

// Player
const playerHeight = 1.68;
const playerGeometry = new THREE.BoxGeometry(1, playerHeight, 1);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);

// Pivot at bottom
playerGeometry.translate(0, playerHeight / 2, 0);

// Edges
const edges = new THREE.EdgesGeometry(playerGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const playerEdges = new THREE.LineSegments(edges, lineMaterial);
player.add(playerEdges);

// Player hierarchy for sphere movement
const playerBase = new THREE.Group();
const playerRotator = new THREE.Group();
scene.add(playerBase);
playerBase.add(playerRotator);
playerRotator.add(player);

// Camera hierarchy for WoW-style control
const cameraPivot = new THREE.Group();
const cameraPitch = new THREE.Group();
playerBase.add(cameraPivot);
cameraPivot.add(cameraPitch);
cameraPitch.add(camera);

// Position player and camera
player.position.set(0, sphereRadius, 0);
cameraPivot.position.set(0, sphereRadius, 0);
cameraPitch.position.set(0, playerHeight * 1.2, 0); // Slightly above eye level
camera.position.set(0, 0, 15); // Distance from player

// Movement state
const keys = { z: false, s: false, q: false, d: false };
window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});
window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

// Mouse state
let isLeftMouseDown = false;
let isRightMouseDown = false;

window.addEventListener('mousedown', (e) => {
    if (e.button === 0) isLeftMouseDown = true;
    if (e.button === 2) isRightMouseDown = true;
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) isLeftMouseDown = false;
    if (e.button === 2) isRightMouseDown = false;
});

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('mousemove', (e) => {
    if (isLeftMouseDown || isRightMouseDown) {
        const deltaX = e.movementX;
        const deltaY = e.movementY;

        cameraPivot.rotation.y -= deltaX * 0.005;
        cameraPitch.rotation.x -= deltaY * 0.005;
        // Limit pitch to avoid flipping
        cameraPitch.rotation.x = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, cameraPitch.rotation.x));

        if (isRightMouseDown) {
            // Character turns with camera in WoW
            playerRotator.rotation.y = cameraPivot.rotation.y;
        }
    }
});

window.addEventListener('wheel', (e) => {
    camera.position.z += e.deltaY * 0.02;
    camera.position.z = Math.max(2, Math.min(100, camera.position.z));
}, { passive: false });

const moveSpeed = 0.5; // distance units per frame

function updateMovement() {
    const angularSpeed = moveSpeed / sphereRadius;

    if (keys.z || keys.s) {
        // Z is forward (away from camera), S is backward
        const direction = keys.z ? -1 : 1;
        // Forward/Backward: rotate around the player's local X axis
        const axis = new THREE.Vector3(1, 0, 0).applyQuaternion(playerRotator.quaternion);
        playerBase.rotateOnAxis(axis, direction * angularSpeed);
    }

    if (keys.q || keys.d) {
        // Q is left, D is right
        const direction = keys.q ? 1 : -1;
        // Strafing: rotate around the player's local Z axis
        const axis = new THREE.Vector3(0, 0, 1).applyQuaternion(playerRotator.quaternion);
        playerBase.rotateOnAxis(axis, direction * angularSpeed);
    }
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    updateMovement();
    renderer.render(scene, camera);
}
animate();
