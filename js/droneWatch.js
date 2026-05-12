import * as THREE from "three";

let camera, scene, renderer;

let drone, ballon, cube;

  let cameras = [];
  let cameraNames = [ "lateral", "frontal", "top", "ortogonal", "perspective", "mobile"];
  let cameraHelpers = [];
  let cameraIndex = 0;
  let helpersVisible = false;

function createCameras() {
    const orthoSize = 50;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const zDistance = 100;


  //1 - lateral
  const cameraLateral = new THREE.OrthographicCamera(
        -orthoSize * aspectRatio,
        orthoSize * aspectRatio,
        orthoSize,
        -orthoSize,
        0.1,
        1000
    );
    cameraLateral.position.set(zDistance, 0, 0);
    cameraLateral.lookAt(0, 0, 0);
    cameras.push(cameraLateral);

    //2 - frontal
    const cameraFrontal = new THREE.OrthographicCamera(
        -orthoSize * aspectRatio,
        orthoSize * aspectRatio,
        orthoSize,
        -orthoSize,
        0.1,
        1000
    );
    cameraFrontal.position.set(0, 0, zDistance);
    cameraFrontal.lookAt(0, 0, 0);
    cameras.push(cameraFrontal);

    //3 - top
    const cameraTop = new THREE.OrthographicCamera(
        -orthoSize * aspectRatio,
        orthoSize * aspectRatio,
        orthoSize,
        -orthoSize,
        0.1,
        1000
    );
    cameraTop.position.set(0, zDistance, 0);
    cameraTop.lookAt(0, 0, 0);
    cameras.push(cameraTop);

    //4 - ortogonal (Fixa)
    const cameraOrtho = new THREE.OrthographicCamera(
        -orthoSize * aspectRatio,
        orthoSize * aspectRatio,
        orthoSize,
        -orthoSize,
        0.1,
        1000
    );
    const diagonalDistance = zDistance / Math.sqrt(2);
    cameraOrtho.position.set(diagonalDistance, diagonalDistance, diagonalDistance);
    cameraOrtho.lookAt(scene.position);
    cameras.push(cameraOrtho);

    //5 - perspective (Fixa)
    const cameraFixedPerspective = new THREE.PerspectiveCamera(
        75,
        aspectRatio,
        0.1,
        1000
    );
    cameraFixedPerspective.position.set(diagonalDistance, diagonalDistance, diagonalDistance);
    cameraFixedPerspective.lookAt(scene.position);
    cameras.push(cameraFixedPerspective);

    //Falta camara móvel 6

    //Adicionar CameraHelpers para cada camara
    cameras.forEach((cam) => {
        const helper = new THREE.CameraHelper(cam);
        helper.visible = helpersVisible;
        scene.add(helper);
        cameraHelpers.push(helper);
    });

}

function handleKeyPress(event) {
  const key = event.key.toLowerCase();

  //Alternar câmaras
  if (key >= "1" && key <= "6") {
    const newIndex = parseInt(key) - 1;
    if (newIndex < cameras.length) {
      cameraIndex = newIndex;
    }
  }

  //'h' para mostrar/ocultar CameraHelpers
  if (key === "h") {
    helpersVisible = !helpersVisible;
    cameraHelpers.forEach((helper) => {
      helper.visible = helpersVisible;
    });
  }
}

function update() {
  //Atualizar a camara
  camera = cameras[cameraIndex];
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspectRatio = width / height;
  const orthoSize = 50;

  renderer.setSize(width, height);

  cameras.forEach((cam) => {
    if (cam instanceof THREE.PerspectiveCamera) {
      cam.aspect = aspectRatio;
      cam.updateProjectionMatrix();
    } 
    
    else if (cam instanceof THREE.OrthographicCamera) {
      cam.left = -orthoSize * aspectRatio;
      cam.right = orthoSize * aspectRatio;
      cam.top = orthoSize;
      cam.bottom = -orthoSize;
      cam.updateProjectionMatrix();
    }
  });
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x373737); //Fundo cinzento escuro

    renderer = new THREE.WebGLRenderer({
    antialias: true,});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createCameras();

    camera = cameras[cameraIndex];

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("resize", onResize);

    //teste
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    animate();

}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

init();