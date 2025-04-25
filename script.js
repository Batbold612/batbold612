let scene, camera, renderer, cube;

function parentWidth(elem) {
  return elem.parentElement.clientWidth;
}

function parentHeight(elem) {
  return elem.parentElement.clientHeight;
}

function init3D() {
  const container = document.getElementById("3Dcube");

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    75,
    parentWidth(container) / parentHeight(container),
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(parentWidth(container), parentHeight(container));
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(5, 1, 4);
  const cubeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x03045e }),
    new THREE.MeshBasicMaterial({ color: 0x023e8a }),
    new THREE.MeshBasicMaterial({ color: 0x0077b6 }),
    new THREE.MeshBasicMaterial({ color: 0x03045e }),
    new THREE.MeshBasicMaterial({ color: 0x023e8a }),
    new THREE.MeshBasicMaterial({ color: 0x0077b6 }),
  ];

  cube = new THREE.Mesh(geometry, cubeMaterials);
  scene.add(cube);

  camera.position.set(0, 0, 10);
  camera.lookAt(cube.position);

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("3Dcube");
  if (!camera || !renderer) return;

  camera.aspect = parentWidth(container) / parentHeight(container);
  camera.updateProjectionMatrix();
  renderer.setSize(parentWidth(container), parentHeight(container));
}

window.addEventListener("resize", onWindowResize, false);
init3D();

if (!!window.EventSource) {
  const source = new EventSource("/events");

  source.addEventListener("open", () => {
    console.log("Events Connected");
  });

  source.addEventListener("error", (e) => {
    if (e.target.readyState !== EventSource.OPEN) {
      console.log("Events Disconnected");
    }
  });

  source.addEventListener("gyro_readings", (e) => {
    const obj = JSON.parse(e.data);
    document.getElementById("gyroX").innerText = obj.gyroX;
    document.getElementById("gyroY").innerText = obj.gyroY;
    document.getElementById("gyroZ").innerText = obj.gyroZ;

    cube.rotation.x = obj.gyroY;
    cube.rotation.y = obj.gyroZ;
    cube.rotation.z = obj.gyroX;
  });

  source.addEventListener("temperature_reading", (e) => {
    document.getElementById("temp").innerText = e.data;
  });

  source.addEventListener("accelerometer_readings", (e) => {
    const obj = JSON.parse(e.data);
    document.getElementById("accX").innerText = obj.accX;
    document.getElementById("accY").innerText = obj.accY;
    document.getElementById("accZ").innerText = obj.accZ;
  });
}

function resetPosition(element) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "/" + element.id, true);
  xhr.send();
}