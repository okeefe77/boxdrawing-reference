import * as THREE from 'three';
import GUI from 'lil-gui';
import RotationOrder from './src/RotationOrder.js';
import outlineVertex from './src/shaders/outline.vertex.glsl?raw';
import outlineFragment from './src/shaders/outline.fragment.glsl?raw';

const rads = degrees => (degrees / 360) * (Math.PI * 2);


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x404040);

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

const gui = new GUI();
const cameraUI = gui.addFolder("Camera");
const cubeUI = gui.addFolder("Cube");

const guiProperties = {
  camera: {
    focalLength: camera.getFocalLength(),
    reset: () => {
      camera.position.z = 3;
      camera.position.y = 0;
      camera.fov = 75;
      camera.zoom = 1;
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();
    }

  },
  cube: {
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
      depth: 1
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

const camUILens = cameraUI.addFolder('Lens');
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
  .min(1)
  .max(50)
  .step(1)
  .onChange(() => camera.updateProjectionMatrix())
  .listen();

cameraUI.add(guiProperties.camera, 'reset')

const camUIPosition = cameraUI.addFolder('Position')
camUIPosition.add(camera.position, 'y')
  .min(-15)
  .max(15)
  .step(0.05);
camUIPosition.add(camera.position, 'z')
  .min(0)
  .max(30)
  .step(0.05);


cubeUI.add(axes, 'visible').name("Show Axes");


const order = new RotationOrder();

const cubeRotationUI = cubeUI.addFolder("Rotation");
cubeRotationUI.add(guiProperties.cube.rotation, 'x')
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("X");
    cube.rotation.reorder(order.get());
    cube.rotation.x = rads(guiProperties.cube.rotation.x);
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, 'y')
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("Y");
    cube.rotation.reorder(order.get());
    cube.rotation.y = rads(guiProperties.cube.rotation.y);
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, 'z')
  .min(-180)
  .max(180)
  .step(5)
  .onChange(() => {
    order.push("Z");
    cube.rotation.reorder(order.get());
    cube.rotation.z = rads(guiProperties.cube.rotation.z)
  }).listen();

cubeRotationUI.add(guiProperties.cube.rotation, "reset");

const cubeSizeUI = cubeUI.addFolder('Size');
cubeSizeUI.add(guiProperties.cube.size, 'width')
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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
document.body.appendChild(renderer.domElement);

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

render();