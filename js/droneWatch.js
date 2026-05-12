import * as THREE from "three";

let camera, scene, renderer;

let drone, ballon, cube;

  let cameras = [];
  let cameraNames = [ "lateral", "frontal", "top", "ortogonal", "perspective", "mobile"];
  let cameraHelpers = [];
  let cameraIndex = 0;
  let helpersVisible = false;

  let axesHelpers = [];

class RotorArm {

    constructor(x, y, z, rotation) {

        this.group = new THREE.Group();

        const armGeometry = new THREE.BoxGeometry(1, 1, 4);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotorArm = new THREE.Mesh(armGeometry, armMaterial);
        this.group.add(rotorArm);
    
        const boxGeometry = new THREE.TorusGeometry(2.5, 0.5, 32, 64);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotorBox = new THREE.Mesh(boxGeometry, boxMaterial);
        rotorBox.rotation.x = Math.PI / 2;
        rotorBox.position.set(0, 0, 2);
        this.group.add(rotorBox);

        const rotorGeometry = new THREE.CylinderGeometry(0.5, 1, 0.5, 32);
        const rotorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(0, 0, 2);
        this.group.add(rotor);

        const bladeSupportGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 32);
        const bladeSupportMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const bladeSupport = new THREE.Mesh(bladeSupportGeometry, bladeSupportMaterial);
        bladeSupport.position.set(0, 0.625, 2);
        this.group.add(bladeSupport);

        const bladeGeometry = new THREE.BoxGeometry(0.5, 0.1, 3);
        const bladeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 0.625, 2);
        this.group.add(blade);

        this.group.position.set(x, y, z);
        this.group.rotation.y = rotation;

        //AxesHelper
        const axesHelper = new THREE.AxesHelper(3);
        this.group.add(axesHelper);
        axesHelpers.push(axesHelper);
    }

    getMesh() {
        return this.group;
    }

}

class DroneBody {

    constructor() {
        this.group = new THREE.Group();
        
        const bodyGeometry = new THREE.BoxGeometry(6, 2, 6);
        const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.set(0, 0.5, 0);
        this.group.add(body);

        const screenGeometry = new THREE.BoxGeometry(5, 2, 5);
        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff});
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 0.525, 0);
        this.group.add(screen);

        const rectangleGeometry = new THREE.BoxGeometry(3, 2, 0.5);
        const rectangleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const rectangle1 = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
        rectangle1.position.set(0, 0.5, 3.25);
        this.group.add(rectangle1);

        const rectangle2 = new THREE.Mesh(rectangleGeometry, rectangleMaterial);
        rectangle2.position.set(0, 0.5, -3.25);
        this.group.add(rectangle2);

        const buttonGeometry = new THREE.BoxGeometry(2.6, 2, 0.6);
        const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000});
        const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
        button.position.set(0, 0.525, 3);
        this.group.add(button);

        const cameraGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 32);
        const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
        camera.position.set(0, 0.525, -3);
        this.group.add(camera);

        const axesHelper = new THREE.AxesHelper(3);
        this.group.add(axesHelper);
        axesHelpers.push(axesHelper);
    }
}

class DroneWatch {
    
    constructor() {
        this.group = new THREE.Group();

        const rotorArm1 = new RotorArm(-4, 0.5, 4, -Math.PI / 4);
        this.group.add(rotorArm1.getMesh());
        const rotorArm2 = new RotorArm(4, 0.5, 4, Math.PI / 4);
        this.group.add(rotorArm2.getMesh());
        const rotorArm3 = new RotorArm(-4, 0.5, -4, -Math.PI * 3 / 4);
        this.group.add(rotorArm3.getMesh());
        const rotorArm4 = new RotorArm(4, 0.5, -4, Math.PI * 3 / 4);
        this.group.add(rotorArm4.getMesh());

        const droneBody = new DroneBody();
        this.group.add(droneBody.group);

        axesHelpers.forEach((helper) => {
            helper.visible = helpersVisible;
        });
    }
}

function createCameras() {
    const orthoSize = 20;
    const aspectRatio = window.innerWidth / window.innerHeight;
    const zDistance = 50;


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
    axesHelpers.forEach((helper) => {
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
    //const geometry = new THREE.BoxGeometry(10, 10, 10);
    //const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //cube = new THREE.Mesh(geometry, material);
    //scene.add(cube);

    const droneWatch = new DroneWatch();
    scene.add(droneWatch.group);
    
    animate();

}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

init();