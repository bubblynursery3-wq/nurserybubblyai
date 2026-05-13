import * as THREE from "three";

let scene, camera, renderer, sphere;
let lon = 0, lat = 0, phi = 0, theta = 0;
let onPointerDownPointerX, onPointerDownPointerY, onPointerDownLon, onPointerDownLat;
let audioCtx = null;
let gainNode = null;
let currentSource = null;
let isLoading = false;

const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(navigator.userAgent);

const voiceMap = {
    "1": "voices/1.mp3.mpga",
    "2": "voices/1.mp3.mpga",
    "3": "voices/1.mp3.mpga",
    "13": "voices/1.mp3.mpga",
    "12": "voices/Ducky room.mp3.mpga",
    "6": "voices/Panda Room.mp3.mpga",
    "7": "voices/Jirraf room.mp3.mpga",
    "8": "voices/Simba room.mp3.mpga",
    "11": "voices/Story time room.mp3.mpga",
    "14": "voices/Garden outside.mp3.mpga",
    "15": "voices/Garden outside.mp3.mpga",
    "16": "voices/1.mp3.mpga",
    "4": "voices/Ducky room.mp3.mpga",
    "5": "voices/Panda Room.mp3.mpga"
};

async function playVoice(id) {
    const voiceFile = voiceMap[id];
    if (!voiceFile) return;

    if (currentSource) {
        try { currentSource.stop(); } catch (e) { }
        currentSource = null;
    }

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioCtx.createGain();
            gainNode.gain.value = 1.8;
            gainNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') await audioCtx.resume();

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

// Reference dimensions of the map image (natural size used for hotspot placement)
const MAP_REF_W = 450;
const MAP_REF_H = 300;

function init() {
    const container = document.getElementById("viewer");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Optimized renderer for mobile
    renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Lighter sphere for mobile (fewer segments)
    const segments = isMobile ? 32 : 60;
    const rings = isMobile ? 24 : 40;
    const geometry = new THREE.SphereGeometry(500, segments, rings);
    geometry.scale(-1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Touch & pointer interaction
    container.addEventListener("pointerdown", onPointerDown, { passive: false });
    container.addEventListener("wheel", onDocumentMouseWheel, { passive: true });
    window.addEventListener("resize", onWindowResize);

    // Touch gesture support (pinch to zoom)
    let lastTouchDist = 0;
    container.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        }
    }, { passive: true });

    container.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const delta = lastTouchDist - dist;
            camera.fov += delta * 0.1;
            camera.fov = Math.max(30, Math.min(90, camera.fov));
            camera.updateProjectionMatrix();
            lastTouchDist = dist;
        }
    }, { passive: true });

    initMap();
    load360("1.jpg", "Outside");

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
    const mapImg = document.getElementById("map-img");

    mapToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        if (mapContainer.classList.contains("minimized")) {
            mapContainer.classList.remove("minimized");
            mapContainer.classList.add("maximized");
            mapToggle.querySelector(".icon").textContent = "⤓";
            mapToggle.querySelector(".text").textContent = "Minimize";
        } else {
            mapContainer.classList.add("minimized");
            mapContainer.classList.remove("maximized");
            mapToggle.querySelector(".icon").textContent = "⤢";
            mapToggle.querySelector(".text").textContent = "Map";
        }
        // Reposition hotspots after transition
        setTimeout(positionHotspots, 600);
    });

    // Build hotspot divs
    hotspotsData.forEach(data => {
        const div = document.createElement("div");
        div.className = "hotspot" + (data.draft ? " draft" : "");
        div.textContent = data.label;
        div.dataset.hx = data.x;
        div.dataset.hy = data.y;
        div.dataset.hw = data.w;
        div.dataset.hh = data.h;

        div.addEventListener("click", (e) => {
            e.stopPropagation();
            load360("img/" + data.img, data.label);
            playVoice(data.id);
            // Auto-minimize map on mobile after clicking
            if (isMobile && mapContainer.classList.contains("maximized")) {
                mapContainer.classList.add("minimized");
                mapContainer.classList.remove("maximized");
                mapToggle.querySelector(".icon").textContent = "⤢";
                mapToggle.querySelector(".text").textContent = "Map";
            }
        });

        hotspotsContainer.appendChild(div);
    });

    // Position hotspots after map image loads
    if (mapImg.complete) {
        positionHotspots();
    } else {
        mapImg.addEventListener("load", positionHotspots);
    }

    // Reposition on resize
    window.addEventListener("resize", positionHotspots);

    // Also reposition after CSS transition ends
    mapContainer.addEventListener("transitionend", positionHotspots);
}

function positionHotspots() {
    const mapImg = document.getElementById("map-img");
    const hotspotsContainer = document.getElementById("hotspots");
    const hotspotDivs = hotspotsContainer.querySelectorAll(".hotspot");

    if (!mapImg || !mapImg.naturalWidth) return;

    // Get actual rendered size and position of the map image
    const imgRect = mapImg.getBoundingClientRect();
    const containerRect = hotspotsContainer.getBoundingClientRect();

    // Offset of the image within the container
    const offsetX = imgRect.left - containerRect.left;
    const offsetY = imgRect.top - containerRect.top;

    // Scale factors
    const scaleX = imgRect.width / MAP_REF_W;
    const scaleY = imgRect.height / MAP_REF_H;

    hotspotDivs.forEach((div, i) => {
        const hx = parseFloat(div.dataset.hx);
        const hy = parseFloat(div.dataset.hy);
        const hw = parseFloat(div.dataset.hw);
        const hh = parseFloat(div.dataset.hh);

        div.style.left = (offsetX + hx * scaleX) + "px";
        div.style.top = (offsetY + hy * scaleY) + "px";
        div.style.width = (hw * scaleX) + "px";
        div.style.height = (hh * scaleY) + "px";
    });
}

function load360(imgName, label) {
    if (isLoading) return;
    isLoading = true;

    document.getElementById("location-name").textContent = label;

    // Show loading indicator
    const loader = document.getElementById("loader");
    if (loader) loader.classList.add("visible");

    // Show guiding arrows
    const guidingArrows = document.getElementById("guiding-arrows");
    if (guidingArrows) guidingArrows.classList.add("visible");

    new THREE.TextureLoader().load(imgName, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        // Dispose old texture
        if (sphere.material.map) sphere.material.map.dispose();
        sphere.material.map = texture;
        sphere.material.needsUpdate = true;
        isLoading = false;
        if (loader) loader.classList.remove("visible");
    }, undefined, (err) => {
        console.warn("Failed to load image:", imgName, err);
        isLoading = false;
        if (loader) loader.classList.remove("visible");
    });
}

function onPointerDown(event) {
    if (event.target.tagName !== "CANVAS") return;
    event.preventDefault();
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(event) {
    // Higher sensitivity for smoother mobile experience
    const sensitivity = isMobile ? 0.25 : 0.15;
    lon = (onPointerDownPointerX - event.clientX) * sensitivity + onPointerDownLon;
    lat = (event.clientY - onPointerDownPointerY) * sensitivity + onPointerDownLat;
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
