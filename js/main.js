import * as THREE from 'three';

import {
    OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
    GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

let width = window.innerWidth;
let height = window.innerHeight;
const canvas = document.getElementById('canvas')

window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

window.addEventListener('dblclick', () => {
    if (document.fullscreenElement) {
        document.exitFullscreen();

    } else {
        canvas.requestFullscreen();
    }
});

// init
const camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 100);
camera.position.z = 9;

const scene = new THREE.Scene({}); {
    const color = 0x111111;
    const near = 8;
    const far = 30;
    const backColor = 0xf0f0f7
    scene.fog = new THREE.Fog(backColor, near, far);
    scene.background = new THREE.Color(backColor);
}

const geometry = new THREE.BoxGeometry(1, 1, 1);

const group = new THREE.Group();
let i = 0;
for (let x = -3; x <= 3; x += 3) {
    for (let y = -3; y <= 3; y += 3) {

        const loader = new THREE.TextureLoader();
        const texture = loader.load(`images/photo-${i+1}.webp`);
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.MeshBasicMaterial({
            fog: true,
            map: texture,
        });

        const mash = new THREE.Mesh(geometry, material);
        mash.position.set(x, y, 0);
        mash.index = i;
        mash.basePosition = new THREE.Vector3(x, y, 0);
        mash.link = "https://pavstyuk.ru/"
        group.add(mash);
        i++;
    }
}


scene.add(group);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});

renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.listenToKeyEvents(window); // optional
controls.keyPanSpeed = 30;
controls.enableZoom = false;

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

const loader = new GLTFLoader();

// animation

let activeIndex = -1;

const clock = new THREE.Clock();

const animation = () => {

    stats.begin();

    let delta = clock.getDelta();

    if (activeIndex !== -1) {
        //  group.children[activeIndex].rotation.z += -0.01;
    }
    // group.rotation.z += 0.01;
    group.children.forEach((n, i) => {

        // let j = i % 2 === 0 ? -1 : 1;
        // n.rotation.z += 0.1 * delta * j;
        if (n.index !== activeIndex) {
            let j = i % 2 === 0 ? -1 : 1;
            n.rotation.z += 0.1 * delta * j;
        } else {
            // n.rotation.z = 0;
        }
    })


    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);

    stats.end();
    renderer.setAnimationLoop(animation);

}

animation();

// Clicking

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();


const clicking = (e) => {

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    let intersections = raycaster.intersectObjects(group.children);

    if (intersections[0]) {
        if (activeIndex !== -1) {
            resetActive();
        }

        let object = intersections[0].object;
        activeIndex = object.index;

        new TWEEN.Tween(object.rotation).to({
                z: 0,
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.position).to({
                x: 0,
                y: 0,
                z: 4
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

        new TWEEN.Tween(object.scale).to({
                x: 3,
                y: 3,
                z: 3,
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

    } else {
        resetActive();
    }

}

window.addEventListener('click', clicking);


const resetActive = () => {
    if (activeIndex !== -1) {
        new TWEEN.Tween(group.children[activeIndex].position).to({
                x: group.children[activeIndex].basePosition.x,
                y: group.children[activeIndex].basePosition.y,
                z: group.children[activeIndex].basePosition.z,
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        new TWEEN.Tween(group.children[activeIndex].scale).to({
                x: 1,
                y: 1,
                z: 1,
            }, 1000)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
    }
    activeIndex = -1;
}