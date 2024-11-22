import * as THREE from 'three';
import GUI from 'lil-gui';
import outlineVertex from './src/shaders/outline.vertex.glsl?raw'
import outlineFragment from './src/shaders/outline.fragment.glsl?raw'

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
const cube = new THREE.Mesh(cubeGeometry, outlineMaterial);
scene.add(cube);

const gui = new GUI();
const cameraUI = gui.addFolder("Camera");
const cubeUI = gui.addFolder("Cube");

const guiProperties = {
  camera: {
    focalLength: camera.getFocalLength()
  },
  cube: {
    rotation: {
      x: 0,
      y: 0,
      z: 0
    },
    size: {
      width: 1,
      height: 1,
      depth: 1
    }
  }
}

cameraUI.add(guiProperties.camera, 'focalLength')
  .min(0)
  .max(40)
  .step(0.1)
  .onChange(() => {
    camera.setFocalLength(guiProperties.camera.focalLength);
    camera.updateProjectionMatrix();
  })

const cubeRotationUI = cubeUI.addFolder("Rotation");
cubeRotationUI.add(guiProperties.cube.rotation, 'x')
  .min(0)
  .max(360)
  .step(5)
  .onChange(() => {
    cube.rotation.reorder('YZX');
    cube.rotation.x = rads(guiProperties.cube.rotation.x);
  })
cubeRotationUI.add(guiProperties.cube.rotation, 'y')
  .min(0)
  .max(360)
  .step(5)
  .onChange(() => {
    cube.rotation.reorder('ZXY');
    cube.rotation.y = rads(guiProperties.cube.rotation.y);
  });
cubeRotationUI.add(guiProperties.cube.rotation, 'z')
  .min(0)
  .max(360)
  .step(5)
  .onChange(() => {
    cube.rotation.reorder('XYZ');
    cube.rotation.z = rads(guiProperties.cube.rotation.z)
  });

const cubeSizeUI = cubeUI.addFolder('Size');
cubeSizeUI.add(guiProperties.cube.size, 'width')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);
  });
cubeSizeUI.add(guiProperties.cube.size, 'height')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);
  });
cubeSizeUI.add(guiProperties.cube.size, 'depth')
  .min(0.1)
  .max(5)
  .step(0.1)
  .onChange(() => {
    const s = guiProperties.cube.size;
    cube.geometry.dispose();
    cube.geometry = new THREE.BoxGeometry(s.width, s.height, s.depth);
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