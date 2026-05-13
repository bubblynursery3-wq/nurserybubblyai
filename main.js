import * as THREE from "three";

let scene, camera, renderer, sphere;
let lon = 0, lat = 0, phi = 0, theta = 0;
let onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
let audioCtx = null;
let gainNode = null;
let currentSource = null;

const voiceMap = {
    "1": "voices/1.mp3.mpga",
    "2": "voices/1.mp3.mpga", // Near Outside
    "3": "voices/1.mp3.mpga", // Near Outside
    "13": "voices/1.mp3.mpga", // Near Outside
    "12": "voices/Ducky room.mp3.mpga",
    "6": "voices/Panda Room.mp3.mpga",
    "7": "voices/Jirraf room.mp3.mpga",
    "8": "voices/Simba room.mp3.mpga",
    "11": "voices/Story time room.mp3.mpga",
    "14": "voices/Garden outside.mp3.mpga",
    "15": "voices/Garden outside.mp3.mpga", // Near Garden
    "16": "voices/1.mp3.mpga", // Near Outside
    "4": "voices/Ducky room.mp3.mpga", // Near Reception/Class 1
    "5": "voices/Panda Room.mp3.mpga"  // Near Middle PG
};

async function playVoice(id) {
    const voiceFile = voiceMap[id];
    if (!voiceFile) return;

    if (currentSource) {
        currentSource.stop();
        currentSource = null;
    }

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioCtx.createGain();
            gainNode.gain.value = 1.8; // 1.8-fold volume increase
            gainNode.connect(audioCtx.destination);
        }

        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        const response = await fetch(voiceFile);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        currentSource = audioCtx.createBufferSource();
        currentSource.buffer = audioBuffer;
        currentSource.connect(gainNode);
        currentSource.start();
    } catch (e) {
        console.warn("Audio playback failed:", e);
    }
}

const hotspotsData = [
    { "id": "1", "label": "Outside", "img": "1.jpg", "x": 200, "y": 242, "w": 50, "h": 20 },
    { "id": "2", "label": "B Road", "img": "2.jpg", "x": 325, "y": 130, "w": 20, "h": 50 },
    { "id": "3", "label": "B2 Road", "img": "3.jpg", "x": 108, "y": 125, "w": 20, "h": 50 },
    { "id": "4", "label": "Reception", "img": "4.jpg", "x": 201, "y": 210, "w": 50, "h": 20 },
    { "id": "5", "label": "Middle PG", "img": "5.jpg", "x": 200, "y": 145, "w": 50, "h": 20 },
    { "id": "12", "label": "Class 1", "img": "12.jpg", "x": 266, "y": 203, "w": 50, "h": 20 },
    { "id": "6", "label": "Class 2", "img": "6.jpg", "x": 275, "y": 129, "w": 40, "h": 16 },
    { "id": "7", "label": "Class 3", "img": "7.jpg", "x": 271, "y": 84, "w": 50, "h": 20 },
    { "id": "8", "label": "Class 4", "img": "8.jpg", "x": 138, "y": 84, "w": 50, "h": 20 },
    { "id": "11", "label": "Class 5", "img": "11.jpg", "x": 132, "y": 206, "w": 50, "h": 20 },
    { "id": "13", "label": "Middle Outside", "img": "13.jpg", "x": 201, "y": 82, "w": 50, "h": 20 },
    { "id": "9", "label": "Boys T", "img": "9.jpg", "x": 140, "y": 128, "w": 40, "h": 16 },
    { "id": "10", "label": "Girl T", "img": "10.jpg", "x": 138, "y": 168, "w": 40, "h": 16 },
    { "id": "14", "label": "Outside PG", "img": "14.jpg", "x": 202, "y": 51, "w": 50, "h": 20 },
    { "id": "15", "label": "15", "img": "15.jpg", "x": 300, "y": 245, "w": 20, "h": 20 },
    { "id": "16", "label": "16", "img": "16.jpg", "x": 213, "y": 263, "w": 20, "h": 20 },
    { "id": "17", "label": "17", "img": "17.jpg", "x": 129, "y": 249, "w": 20, "h": 20 },
    { "id": "18", "label": "18", "img": "18.jpg", "x": 167, "y": 153, "w": 20, "h": 20 },
    { "id": "19", "label": "19", "img": "19.jpg", "x": 266, "y": 232, "w": 20, "h": 20 },
    { "id": "20", "label": "20", "img": "20.jpg", "x": 258, "y": 176, "w": 20, "h": 20 },
    { "id": "21", "label": "21", "img": "21.jpg", "x": 269, "y": 146, "w": 20, "h": 20 },
    { "id": "22", "label": "22", "img": "22.jpg", "x": 259, "y": 106, "w": 20, "h": 20 },
    { "id": "23", "label": "23", "img": "23.jpg", "x": 213, "y": 104, "w": 20, "h": 20 },
    { "id": "24", "label": "24", "img": "24.jpg", "x": 170, "y": 114, "w": 20, "h": 20 },
    { "id": "25", "label": "25", "img": "25.jpg", "x": 273, "y": 54, "w": 20, "h": 20 },
    { "id": "26", "label": "26", "img": "26.jpg", "x": 214, "y": 34, "w": 20, "h": 20 }
];

function init() {
    // 1. Viewer Setup
    const container = document.getElementById("viewer");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 2. Interaction
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("wheel", onDocumentMouseWheel);
    window.addEventListener("resize", onWindowResize);

    // 3. Map Setup
    initMap();

    // 4. Load initial scene
    load360("1.jpg", "Outside");
    // We don't call playVoice("1") here because autoplay is usually blocked.
    // It will start when the user interacts with the map.

    // Keyboard controls
    window.addEventListener("keydown", (e) => {
        const step = 5;
        if (e.key === "ArrowLeft") lon += step;
        if (e.key === "ArrowRight") lon -= step;
        if (e.key === "ArrowUp") lat += step;
        if (e.key === "ArrowDown") lat -= step;
        lat = Math.max(-85, Math.min(85, lat));
    });

    animate();
}

function initMap() {
    const mapToggle = document.getElementById("map-toggle");
    const mapContainer = document.getElementById("map-container");
    const hotspotsContainer = document.getElementById("hotspots");

    mapToggle.addEventListener("click", () => {
        if (mapContainer.classList.contains("minimized")) {
            mapContainer.classList.remove("minimized");
            mapContainer.classList.add("maximized");
            mapToggle.querySelector(".icon").textContent = "⤓";
            mapToggle.querySelector(".text").textContent = "Minimize Map";
        } else {
            mapContainer.classList.add("minimized");
            mapContainer.classList.remove("maximized");
            mapToggle.querySelector(".icon").textContent = "⤢";
            mapToggle.querySelector(".text").textContent = "Extend Map";
        }
    });

    hotspotsData.forEach(data => {
        const div = document.createElement("div");
        div.className = "hotspot" + (data.draft ? " draft" : "");
        div.textContent = data.label;

        // Use percentages for responsiveness (assuming reference size 450x300)
        const refW = 450;
        const refH = 300;
        div.style.left = (data.x / refW * 100) + "%";
        div.style.top = (data.y / refH * 100) + "%";
        div.style.width = (data.w / refW * 100) + "%";
        div.style.height = (data.h / refH * 100) + "%";

        // Navigation on click
        div.addEventListener("click", (e) => {
            if (div.dataset.dragging === "true") return;
            load360(data.img, data.label);
            playVoice(data.id);
        });

        // Drag and Drop Logic
        let isDragging = false;
        div.addEventListener("mousedown", (e) => {
            isDragging = true;
            div.dataset.dragging = "false";
            const startX = e.clientX - div.offsetLeft;
            const startY = e.clientY - div.offsetTop;

            const onMouseMove = (moveEvent) => {
                isDragging = true;
                div.dataset.dragging = "true";
                const newX = moveEvent.clientX - startX;
                const newY = moveEvent.clientY - startY;
                div.style.left = newX + "px";
                div.style.top = newY + "px";
                data.x = newX;
                data.y = newY;
            };

            const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);
                setTimeout(() => { div.dataset.dragging = "false"; isDragging = false; }, 100);
            };

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        });

        hotspotsContainer.appendChild(div);
    });

    // Press 'S' to save and log coordinates
    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "s") {
            console.log("--- UPDATED HOTSPOT COORDINATES ---");
            console.log(JSON.stringify(hotspotsData, null, 2));
            alert("Coordinates logged to console! (Press F12 to see them)");
        }
    });
}

function load360(imgName, label) {
    document.getElementById("location-name").textContent = label;

    // Show guiding arrows (persistent)
    const guidingArrows = document.getElementById("guiding-arrows");
    if (guidingArrows) {
        guidingArrows.classList.add("visible");
    }

    new THREE.TextureLoader().load(imgName, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;
    });
}

function onPointerDown(event) {
    if (event.target.tagName !== "CANVAS") return;
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(event) {
    lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
    lat = Math.max(-85, Math.min(85, lat));
}

function onPointerUp() {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
}

function onDocumentMouseWheel(event) {
    camera.fov += event.deltaY * 0.05;
    camera.fov = Math.max(30, Math.min(90, camera.fov));
    camera.updateProjectionMatrix();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    const target = new THREE.Vector3();
    target.setFromSphericalCoords(1, phi, theta);
    camera.lookAt(target);
    renderer.render(scene, camera);
}

init();
