import * as THREE from 'three';

export function createTrees(planet, sphereRadius, count = 100) {
    const trees = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 4, 8);
    trunkGeometry.translate(0, 2, 0); // Pivot at bottom
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });

    // Foliage
    const foliageGeometry = new THREE.ConeGeometry(3, 8, 8);
    foliageGeometry.translate(0, 8, 0); // Above trunk
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

    for (let i = 0; i < count; i++) {
        const tree = new THREE.Group();

        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);

        tree.add(trunk);
        tree.add(foliage);

        // Random position on sphere
        const phi = Math.acos(2 * Math.random() - 1);
        const theta = 2 * Math.PI * Math.random();

        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);

        const pos = new THREE.Vector3(x, y, z);
        tree.position.copy(pos).multiplyScalar(sphereRadius);

        // Orient tree to stand upright on surface
        tree.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos);

        // Random scale variation
        const scale = 0.5 + Math.random() * 1.5;
        tree.scale.set(scale, scale, scale);

        trees.add(tree);
    }

    planet.add(trees);
}
