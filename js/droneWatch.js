import * as THREE from "three";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@v0.176.0/examples/jsm/loaders/OBJLoader.js";

let camera, scene, renderer;

let drone, ballon, cube;

  let cameras = [];
  let cameraHelpers = [];
  let cameraIndex = 0;
  let helpersVisible = false;
  let ballonPositions = [[0, 0, -20], [-20, 0, -20], [-10, 20, -10], [5, -20, 5]];

  let axesHelpers = [];

  let wireframeMode = false;

  let extended = false;
  let rotationSpeed = 0.2; 
  let extensionSpeed = 0.02;
  let rotorArms = []
  let progress = 0; // Progresso da extensão (0 a 1)

  let moveSpeed = 0.2;
  let droneWatchGroup; 
  let movementKeys = ["a", "d", "w", "s", "u", "j", "i", "k", "o", "l"];

  let keysPressed = {};

  const pitchDegrees = {
    min: -Math.PI / 6,
    max: Math.PI / 6
  };

  let boomAnimation = false;
  let activeBallons = [];
  let destroyedBallons = [];   
  const ANIMATION_DURATION = 60; 

class RotorArm {

    constructor(x, y, z, rotation, hX, hY, hZ) {

        this.group = new THREE.Group();

        const armGeometry = new THREE.BoxGeometry(1, 1, 3.8);
        const armMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotorArm = new THREE.Mesh(armGeometry, armMaterial);
        this.group.add(rotorArm);
    
        const boxGeometry = new THREE.TorusGeometry(2.5, 0.5, 8, 16);
        const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotorBox = new THREE.Mesh(boxGeometry, boxMaterial);
        rotorBox.rotation.x = Math.PI / 2;
        rotorBox.position.set(0, 0, 2);
        this.group.add(rotorBox);

        const rotorGeometry = new THREE.CylinderGeometry(0.5, 1, 0.5, 8);
        const rotorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(0, 0, 2);
        this.group.add(rotor);

        const bladeSupportGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.2, 8);
        const bladeSupportMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
        const bladeSupport = new THREE.Mesh(bladeSupportGeometry, bladeSupportMaterial);
        bladeSupport.position.set(0, 0.625, 2);
        this.group.add(bladeSupport);

        const bladeGeometry = new THREE.BoxGeometry(0.5, 0.1, 3);
        const bladeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.set(0, 0.625, 2);
        this.group.add(blade);

        this.collisionGeometry = new THREE.SphereGeometry(3, 8, 8);
        this.collisionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
        this.collisionSphere = new THREE.Mesh(this.collisionGeometry, this.collisionMaterial);
        this.collisionSphere.position.set(0, 0, 2); //Com o toro
        this.group.add(this.collisionSphere);

        //começamos com a posição ao hidden
        this.group.position.set(x, y, z);
        this.group.rotation.y = rotation;

        this.extendedPosition = { x: hX, y: hY, z: hZ };
        this.hiddenPosition = { x: x, y: y, z: z };

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
        
        const bodyGeometry = new THREE.BoxGeometry(6.5, 2, 6.5);
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

        const cameraGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2, 8);
        const cameraMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const camera = new THREE.Mesh(cameraGeometry, cameraMaterial);
        camera.position.set(0, 0.525, -3);
        this.group.add(camera);

        const axesHelper = new THREE.AxesHelper(3);
        this.group.add(axesHelper);
        axesHelpers.push(axesHelper);

        this.loadStrap();
    }

    loadStrap() {
        const objLoader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();

        objLoader.load(
            './leather_strap_bracelet_v2_L3.123c2ab513b6-f2fc-4b48-8894-33ce6a389bc5/13096_leather_strap_bracelet_v2_L3.obj',
            (object) => {
                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshBasicMaterial({ color: 0xffff00});
                    }
                });

                //Posicionar e adicionar
                object.scale.set(0.4, 0.4, 0.4);
                object.position.set(-0.9, -3, 0);
                object.rotation.y = Math.PI / 2;
                //this.group.add(object);
                scene.add(object);
            },
            undefined,
            (error) => console.error('Error loading bracelet:', error)
        );
    }
}

class DroneWatch {
    
    constructor() {
        this.group = new THREE.Group();

        //const rotorArm1 = new RotorArm(-4, 0.5, 4, -Math.PI / 4);
        const rotorArm1 = new RotorArm(1.5, 0, -1.5, -Math.PI / 4, -4, 0.5, 4); //coordenadas para o braço estar "escondido"
        this.group.add(rotorArm1.getMesh());
        rotorArms.push(rotorArm1);
        //const rotorArm2 = new RotorArm(4, 0.5, 4, Math.PI / 4);
        const rotorArm2 = new RotorArm(-1.5, 0, -1.5, Math.PI / 4, 4, 0.5, 4); 
        this.group.add(rotorArm2.getMesh());
        rotorArms.push(rotorArm2);
        //const rotorArm3 = new RotorArm(-4, 0.5, -4, -Math.PI * 3 / 4);
        const rotorArm3 = new RotorArm(1.5, 0, 1.5, -Math.PI * 3 / 4, -4, 0.5, -4);
        this.group.add(rotorArm3.getMesh());
        rotorArms.push(rotorArm3);
        //const rotorArm4 = new RotorArm(4, 0.5, -4, Math.PI * 3 / 4);
        const rotorArm4 = new RotorArm(-1.5, 0, 1.5, Math.PI * 3 / 4, 4, 0.5, -4);
        this.group.add(rotorArm4.getMesh());
        rotorArms.push(rotorArm4);

        const droneBody = new DroneBody();
        this.group.add(droneBody.group);

    }
}

class Ballon {
    constructor() {
        this.group = new THREE.Group();

        const ballonGeometry = new THREE.SphereGeometry(2.5, 16, 8);
        const ballonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 , transparent: true, opacity: 1});
        const ballon = new THREE.Mesh(ballonGeometry, ballonMaterial);
        ballon.position.y = 7;
        this.group.add(ballon);

        const knotGeometry = new THREE.CylinderGeometry(0.0, 0.5, 1, 8);
        const knotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 , transparent: true, opacity: 1});
        const knot = new THREE.Mesh(knotGeometry, knotMaterial);
        knot.scale.set(0.5, 0.5, 0.5);
        knot.position.y = 4.25;
        this.group.add(knot);

        const stringGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 , transparent: true, opacity: 1});
        const string = new THREE.Mesh(stringGeometry, stringMaterial);
        string.position.y = 2;
        this.group.add(string);

        this.collisionGeometry = new THREE.SphereGeometry(2.5, 8, 8);
        this.collisionMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0});
        this.collisionSphere = new THREE.Mesh(this.collisionGeometry, this.collisionMaterial);
        this.collisionSphere.position.y = 7;
        this.group.add(this.collisionSphere);

        this.frame = 0; //Frame atual da animação de destruição

        const axesHelper = new THREE.AxesHelper(3);
        this.group.add(axesHelper);
        axesHelpers.push(axesHelper);
    }

    getMesh() {
        return this.group;
    }
}

function toggleWireframe() {
    wireframeMode = !wireframeMode;
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.material.wireframe = wireframeMode;
        }
    });
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
        -orthoSize * aspectRatio *2,
        orthoSize * aspectRatio *2, //*2 para entrarem os objetos todos
        orthoSize *2,
        -orthoSize *2,
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
  if (boomAnimation) return; //Ignorar input durante a animação de explosão

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

  if (key === "7") {
    toggleWireframe();
  }

  if (key === "q") {
    extended = !extended;
  }

  if (movementKeys.includes(key)) {
    keysPressed[key] = true;
  }

}

function detectCollisions() {
  for (let i = activeBallons.length - 1; i >= 0; i--) {
    const ballon = activeBallons[i];
    
    for (const rotorArm of rotorArms) {
      const rotorPos = new THREE.Vector3();
      rotorArm.collisionSphere.getWorldPosition(rotorPos);
      
      const ballonPos = new THREE.Vector3();
      ballon.collisionSphere.getWorldPosition(ballonPos);
      
      const distance = rotorPos.distanceTo(ballonPos);
      const collisionDistance = 5.5; // 3 (rotor) + 2.5 (balloon)
      
      if (distance < collisionDistance) {
        boomAnimation = true;
        activeBallons.splice(i, 1);
        destroyedBallons.push(ballon);
        break;
      }
    }
  }
}

function ballonDestroyAnimation(ballon) {
    ballon.frame++;
    const animationProgress = ballon.frame / ANIMATION_DURATION;

    if (ballon.frame <= ANIMATION_DURATION) {
        ballon.group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.opacity = 1 - animationProgress;
        }
       });
    }
    else {
        scene.remove(ballon.group);
        const index = destroyedBallons.indexOf(ballon);
        if (index > -1) {
            destroyedBallons.splice(index, 1);
        }
        boomAnimation = false;
    }
        
}

function update() {

  //Atualizar a camara
  camera = cameras[cameraIndex];

  detectCollisions();

  for (let i = destroyedBallons.length - 1; i >= 0; i--) {
    ballonDestroyAnimation(destroyedBallons[i]);
  }

  if (progress > 0.99 && !boomAnimation) {
    const movementVector = new THREE.Vector3(0, 0, 0);
    const jointRotation = {x: 0, y: 0};

    if (keysPressed['a']) movementVector.x -= moveSpeed;
    if (keysPressed['d']) movementVector.x += moveSpeed;
    if (keysPressed['w']) movementVector.y += moveSpeed;
    if (keysPressed['s']) movementVector.y -= moveSpeed;
    if (keysPressed['j']) movementVector.z += moveSpeed;
    if (keysPressed['u']) movementVector.z -= moveSpeed;

    if (keysPressed['i']) jointRotation.y = rotationSpeed - 0.15;
    if (keysPressed['k']) jointRotation.y = -(rotationSpeed - 0.15);

    if (keysPressed['o']) jointRotation.x = rotationSpeed - 0.17;
    if (keysPressed['l']) jointRotation.x = -(rotationSpeed - 0.17);

    droneWatchGroup.position.add(movementVector);

    droneWatchGroup.rotation.y += jointRotation.y;

    //Limitar o pitch
    const currentPitch = droneWatchGroup.rotation.x;
    if (currentPitch + jointRotation.x > pitchDegrees.max) {
      droneWatchGroup.rotation.x = pitchDegrees.max;
    } else if (currentPitch + jointRotation.x < pitchDegrees.min) {
      droneWatchGroup.rotation.x = pitchDegrees.min;
    } else {
      droneWatchGroup.rotation.x += jointRotation.x;
    }

  }

  //EXTENSAO DOS BRACOS
  //Atualizar progresso (0 a 1)
  if (extended && progress < 1) {
    progress += extensionSpeed;
    progress = Math.min(1, progress); //Nao passar do cap de 1
  } else if (!extended && progress > 0) {
    progress -= extensionSpeed;
    progress = Math.max(0, progress); //Nao passar do cap de 0
  }

  rotorArms.forEach((arm) => {
    const newPos = new THREE.Vector3();
    newPos.lerpVectors(arm.hiddenPosition, arm.extendedPosition, progress);
    arm.group.position.copy(newPos);

    //Rotar hélices quando totalmente estendido
    if (progress > 0.99) {
      arm.group.children.forEach((child) => {
        if (child.material && child.material.color.getHex() === 0x000000) { 
          child.rotation.y += rotationSpeed;
        }
      });
    }
  });

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

    window.addEventListener("keyup", (event) => { 
        if (movementKeys.includes(event.key.toLowerCase())) { 
            keysPressed[event.key.toLowerCase()] = false;
        } 
    });

    window.addEventListener("resize", onResize);

    const droneWatch = new DroneWatch();
    droneWatchGroup = droneWatch.group;
    
    const ballon = new Ballon();  

    scene.add(droneWatch.group);

    for (let i = 0; i < 4; i++) {
        const [x, y, z] = ballonPositions[i];
        const newBallon = new Ballon();
        newBallon.group.position.set(x, y, z);
        activeBallons.push(newBallon);
        scene.add(newBallon.group);
    }

    axesHelpers.forEach((helper) => {
        helper.visible = helpersVisible;
    });
    
    animate();

}

function animate() {
  requestAnimationFrame(animate);
  update();
  renderer.render(scene, camera);
}

init();