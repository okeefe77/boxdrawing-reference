import * as THREE from 'three';
import GUI from 'lil-gui';
import RotationOrder from './src/RotationOrder.js';
import outlineVertex from './src/shaders/outline.vertex.glsl?raw';
import outlineFragment from './src/shaders/outline.fragment.glsl?raw';

const rads = degrees => (degrees / 360) * (Math.PI * 2);

const displayElement = document.getElementById('display');
const controlsElement = document.getElementById('controls');
const initialSize = Math.floor(window.innerWidth * 0.75);


const sizes = {
  width: initialSize,
  height: initialSize
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x62b8f5);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 3;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const outlineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    thickness: {
      value: 1
    },
    lineValue: {
      value: 0.2
    },
    baseValue: {
      value: 0.6
    }
  },
  vertexShader: outlineVertex,
  fragmentShader: outlineFragment
});
const box = new THREE.Mesh(cubeGeometry, outlineMaterial);
scene.add(box);

const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 64);
const cylinder = new THREE.Mesh(cylinderGeometry, outlineMaterial);
// scene.add(cylinder);

const axes = new THREE.Group();

const xAxisGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3);
const xAxisMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 })
const xAxisCylinder = new THREE.Mesh(xAxisGeometry, xAxisMaterial);
xAxisCylinder.rotation.z = rads(90);
axes.add(xAxisCylinder);

const yAxisGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3);
const yAxisMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 })
const yAxisCylinder = new THREE.Mesh(yAxisGeometry, yAxisMaterial);
axes.add(yAxisCylinder);

const zAxisGeometry = new THREE.CylinderGeometry(0.025, 0.025, 3);
const zAxisMaterial = new THREE.MeshLambertMaterial({ color: 0x0000ff })
const zAxisCylinder = new THREE.Mesh(zAxisGeometry, zAxisMaterial);
zAxisCylinder.rotation.x = rads(90);
axes.add(zAxisCylinder);

const cube = new THREE.Group();
cube.add(box);
cube.add(axes);
scene.add(cube);

axes.visible = false;

const gui = new GUI({ container: controlsElement });
const cameraUI = gui.addFolder("Camera");
const cubeUI = gui.addFolder("Cube");

const guiProperties = {
  camera: {
    focalLength: camera.getFocalLength(),
    perspective: 0,
    lookAngle: 0,
    lookAt: () => {
      camera.lookAt(cube.position);
    },
    reset: () => {
      camera.position.z = 3;
      camera.position.y = 0;
      camera.fov = 75;
      camera.zoom = 1;
      guiProperties.camera.focalLength = camera.getFocalLength();
      camera.lookAt(0, 0, 0);
      guiProperties.camera.lookAngle = 0;
      guiProperties.camera.perspective = 0;
      camera.updateProjectionMatrix();
    }

  },
  cube: {
    scale: 1,
    rotation: {
      x: 0,
      y: 0,
      z: 0,
      reset: () => {
        guiProperties.cube.rotation.x = 0;
        guiProperties.cube.rotation.y = 0;
        guiProperties.cube.rotation.z = 0;
        cube.rotation.x = 0;
        cube.rotation.y = 0;
        cube.rotation.z = 0;
      }
    },
    size: {
      width: 1,
      height: 1,
      depth: 1,
      reset: () => {
        const cs = cube.scale;
        cs.x = 1;
        cs.y = 1;
        cs.z = 1;

        box.geometry.dispose();
        box.geometry = new THREE.BoxGeometry(1, 1, 1);

        const gcs = guiProperties.cube.size;
        gcs.x = 1;
        gcs.y = 1;
        gcs.z = 1;
      }
    }
  },
  axes: {
    height: {
      x: 2,
      y: 2,
      z: 2
    }
  }
}

// const camUILens = cameraUI.addFolder('Lens');
/*
camUILens.add(guiProperties.camera, 'focalLength')
  .min(0)
  .max(40)
  .step(0.1)
  .onChange(() => {
    camera.setFocalLength(guiProperties.camera.focalLength);
    camera.updateProjectionMatrix();
  }).listen();

camUILens.add(camera, 'fov')
  .min(10)
  .max(200)
  .step(5)
  .onChange(() => camera.updateProjectionMatrix())
  .listen();

camUILens.add(camera, 'zoom')
  .min(0)
  .max(15)
  .step(0.1)
  .onChange(() => camera.updateProjectionMatrix())
  .listen();
*/
// const camUIPosition = cameraUI.addFolder('Position')
cameraUI.add(camera.position, 'y')
  .name("Height")
  .min(-15)
  .max(15)
  .step(0.05)
  .listen();

cameraUI.add(guiProperties.camera, "lookAngle")
  .name("Look")
  .min(-60)
  .max(60)
  .step(0.5)
  .onChange(() => {
    camera.rotation.x = rads(guiProperties.camera.lookAngle);
  }).listen();

cameraUI.add(guiProperties.camera, "perspective")
  .name("Perspective Reduction")
  .min(0)
  .max(100)
  .step(1)
  .onChange(() => {
    const p = guiProperties.camera.perspective / 100;
    camera.zoom = 1 + (p * 8);
    camera.position.z = 3 + (p * 17);
    camera.updateProjectionMatrix();
  }).listen();



cameraUI.add(guiProperties.camera, "lookAt").name("Look at Cube");
/*
camUIPosition.add(camera.position, 'z')
  .min(0)
  .max(30)
  .step(0.05)
  .listen();
*/

cameraUI.add(guiProperties.camera, 'reset').name("Reset Camera");



// cube.visible = false;

// cubeUI.add(cube, 'visible').name("Show Cube");
cubeUI.add(axes, 'visible').name("Show Axes");


const order = new RotationOrder();

const cubeRotationUI = cubeUI.addFolder("Rotation");
cubeRotationUI.add(guiProperties.cube.rotation, 'x')
  .name("X Axis (Red)")
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("X");
    cube.rotation.reorder(order.get());
    cube.rotation.x = rads(guiProperties.cube.rotation.x);
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, 'y')
  .name("Y Axis (Green)")
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("Y");
    cube.rotation.reorder(order.get());
    cube.rotation.y = rads(guiProperties.cube.rotation.y);
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, 'z')
  .name("Z Axis (Blue)")
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("Z");
    cube.rotation.reorder(order.get());
    cube.rotation.z = rads(guiProperties.cube.rotation.z)
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, "reset").name("Reset Cube Rotation");

const cubeSizeUI = cubeUI.addFolder('Size');
cubeSizeUI.add(guiProperties.cube, "scale")
  .name("Scale")
  .min(0)
  .max(5)
  .step(0.025)
  .onChange(() => {
    const s = guiProperties.cube.scale;
    cube.scale.x = s;
    cube.scale.y = s;
    cube.scale.z = s;
  });

cubeSizeUI.add(guiProperties.cube.size, 'width')
  .name("Width (Red)")
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    box.geometry.dispose();
    box.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);

    xAxisCylinder.geometry.dispose();
    xAxisCylinder.geometry = new THREE.CylinderGeometry(0.025, 0.025, s.width + 2);
  });
cubeSizeUI.add(guiProperties.cube.size, 'height')
  .name("Height (Green)")
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    box.geometry.dispose();
    box.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);

    yAxisCylinder.geometry.dispose();
    yAxisCylinder.geometry = new THREE.CylinderGeometry(0.025, 0.025, s.height + 2);
  });
cubeSizeUI.add(guiProperties.cube.size, 'depth')
  .name("Depth (Blue)")
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    box.geometry.dispose();
    box.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);

    zAxisCylinder.geometry.dispose();
    zAxisCylinder.geometry = new THREE.CylinderGeometry(0.025, 0.025, s.depth + 2);
  });

cubeSizeUI.add(guiProperties.cube.size, "reset").name("Reset Cube Size");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
displayElement.appendChild(renderer.domElement);

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

const resize = () => {
  let newSize = Math.floor(window.innerWidth - controlsElement.offsetWidth);
  newSize = newSize < window.innerHeight ? newSize : window.innerHeight;
  const guiHeight = document.querySelector('.lil-gui.root').offsetHeight;
  sizes.width = newSize;
  sizes.height = newSize < guiHeight ? guiHeight : newSize;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', resize)

resize();
render();