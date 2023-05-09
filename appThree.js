//Import's
import * as THREE from 'three';

//import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

document.addEventListener('DOMContentLoaded', animate);

const scene = new THREE.Scene()

//Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

//Class box
class Box extends THREE.Mesh {
  constructor({
    width,
    height,
    depth,
    color = '#00ff00',
    velocity = {
      x: 0,
      y: 0,
      z: 0
    },
    position = {
      x: 0,
      y: 0,
      z: 0
    },
    zAcceleration = false
  }) {
    super(
      new THREE.BoxGeometry(width, height, depth),
      new THREE.MeshStandardMaterial({ color })
    )

    this.width = width
    this.height = height
    this.depth = depth

    this.position.set(position.x, position.y, position.z)

    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2

    this.velocity = velocity
    this.gravity = 0;//-0.0001

    this.zAcceleration = zAcceleration
  }

  updateSides() {
    this.right = this.position.x + this.width / 2
    this.left = this.position.x - this.width / 2

    this.bottom = this.position.y - this.height / 2
    this.top = this.position.y + this.height / 2

    this.front = this.position.z + this.depth / 2
    this.back = this.position.z - this.depth / 2
  }

  update(ground) {
    this.updateSides()

    if (this.zAcceleration) this.velocity.z += 0.0003

    this.position.x += this.velocity.x
    this.position.z += this.velocity.z

    this.position.z += this.velocity.z


    this.applyGravity(ground)
  }

  applyGravity(ground) {
    this.velocity.y += this.gravity

    // this is where we hit the ground
    if (
      boxCollision({
        box1: this,
        box2: ground
      })
    ) {
      const friction = 100
      this.velocity.y *= friction
      this.velocity.y = -this.velocity.y
    } else this.position.y += this.velocity.y
  }
}


function boxCollision({ box1, box2 }) {
  const xCollision = box1.right >= box2.left && box1.left <= box2.right
  const yCollision =
    box1.bottom + box1.velocity.y <= box2.top && box1.top >= box2.bottom
  const zCollision = box1.front >= box2.back && box1.back <= box2.front

  return xCollision && yCollision && zCollision
}


const Nave = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.001,
    z: 0
  }
})

Nave.castShadow = true
scene.add(Nave)


// Criar uma nova instância de TextureLoader
const textureLoader = new THREE.TextureLoader();

// Carregar a imagem da textura
const texture = textureLoader.load('./Texture/textura1.jpg');

// Criar um novo material usando a textura
const material = new THREE.MeshPhongMaterial({
  map: texture
});

const ground = new Box({
  width: 1900,
  height: 0.1,
  depth: 200000,
  color: '#D2B48C',
  position: {
    x: 0,
    y: -30,
    z: 0
  },
  zAcceleration: false
})

// Aplicar o material ao objeto "ground"
ground.material = material;

ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5


//Codigo Teclas

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  s: {
    pressed: false
  },
  w: {
    pressed: false
  }
}

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = true
      break
    case 'KeyD':
      keys.d.pressed = true
      break
    case 'KeyS':
      keys.s.pressed = true
      break
    case 'KeyW':
      keys.w.pressed = true
      break
    case 'Space':
      Nave.velocity.x = 0
      Nave.velocity.y = 0

      break
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      keys.a.pressed = false
      break
    case 'KeyD':
      keys.d.pressed = false
      break
    case 'KeyS':
      keys.s.pressed = false
      break
    case 'KeyW':
      keys.w.pressed = false
      break

  }
})


let frames = 1500
let spawnRate = 10

function animate() {
  requestAnimationFrame(animate)
  Nave.rotateZ(0)

  renderer.render(scene, camera)

  // Codigo de movimento
  Nave.velocity.x = 0
  Nave.velocity.y = 0

  Nave.velocity.z = -0.9 * frames / 1000
  //Nave.velocity.z = 0


  if (keys.a.pressed)
    Nave.velocity.x = -0.1 * frames / 10000,
      Nave.rotateZ(-Math.PI / 6380 * 1)
  else if (keys.d.pressed)
    Nave.velocity.x = 0.1 * frames / 10000,
      Nave.rotateZ(Math.PI / 6380 * 1)
  if (keys.s.pressed)
    Nave.velocity.y = -0.1 * frames / 10000
  else if (keys.w.pressed)
    Nave.velocity.y = 0.1 * frames / 10000


  //limitar ecra
  if (Nave.position.x > 6) {
    Nave.velocity.x = -0.01
  }
  if (Nave.position.x < -6) {
    Nave.velocity.x = 0.01
  }

  if (Nave.position.y > 3) {
    Nave.velocity.y = -0.01
  }
  if (Nave.position.y < -3) {
    Nave.velocity.y = 0.01
  }

  Nave.update(ground)

  if (frames % spawnRate === 0) {
    if (spawnRate > 40) spawnRate -= 0.1
    const Meteor = new Box({
      width: 2,
      height: 2,
      depth: 2,
      position: {
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 50,
        z: (Math.random() - 1) * 200000
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.205  //incrementa em funcao do tempo
      },
      color: 'red',
      zAcceleration: true
    })
    Meteor.castShadow = true
    scene.add(Meteor)
    Meteor.gravity = -0.1;

  }

  //posicao camera

  camera.position.set(0, 0, 25);
  // Fazer a câmera seguir o cubo
  //camera.position.x = Nave.position.x;
  //camera.position.y = Nave.position.y + 0.1;
  camera.position.z = Nave.position.z + 5;
  //camera.lookAt(Nave.position);

  frames++
  if (frames >= 2000) {
    frames++ * 3;
  } else {
    frames++
  }
  //animate();
}

