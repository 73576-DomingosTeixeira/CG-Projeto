

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

document.addEventListener('DOMContentLoaded', animate);


const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(4.61, 2.74, 8)

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
})
renderer.shadowMap.enabled = true
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)


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
    this.gravity = -0.0001
  
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

const cube = new Box({
  width: 1,
  height: 1,
  depth: 1,
  velocity: {
    x: 0,
    y: -0.01,
    z: 0
  }
})
cube.castShadow = true
scene.add(cube)


const ground = new Box({
  width: 10000,
  height: 0.1,
  depth: 1000,
  color: '#D2B48C',
  position: {
    x: 0,
    y: -20,
    z: 0
  }
})

ground.receiveShadow = true
scene.add(ground)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.y = 3
light.position.z = 1
light.castShadow = true
scene.add(light)

scene.add(new THREE.AmbientLight(0xffffff, 0.5))

camera.position.z = 5
//console.log(ground.top)
//console.log(cube.bottom)


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
      cube.velocity.y = 0.08
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

const enemies = []
const estrelas = []
let frames = 0
let spawnRate = 10


// Definir posição inicial da câmera igual à posição do cubo
camera.position.set(0, 0, 5);


function animate() {
  const animationId = requestAnimationFrame(animate)
  
  //sdcube.position.x += 0.01;

  // Fazer a câmera seguir o cubo
  camera.position.x = cube.position.x;
  camera.position.y = cube.position.y + 1.5;
  camera.position.z = cube.position.z + 5;
  camera.lookAt(cube.position);


  renderer.render(scene, camera)

  const vel = 0.1
  // movement code
  cube.velocity.x = 0
  cube.velocity.z = -0.8*frames/1000
  if (keys.a.pressed) cube.velocity.x = -0.1
  else if (keys.d.pressed) cube.velocity.x = 0.1

  if (keys.s.pressed) cube.velocity.y = -0.1
  else if (keys.w.pressed) cube.velocity.y = 0.1

  cube.update(ground)
 
  if (frames % spawnRate === 0) {
    if (spawnRate > 40) spawnRate -= 0.1
    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 50,
        z: (Math.random() - 1) * 20000
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.205  //incrementa em funcao do tempo
      },
      color: 'red',
      zAcceleration: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.gravity = -0.1;
    //enemies.push(enemy)
  }

  
  frames++
  // cube.position.y += -0.01
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
}
//animate()

