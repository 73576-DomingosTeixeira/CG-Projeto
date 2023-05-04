
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

const controls = new OrbitControls(camera, renderer.domElement)




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
    this.gravity = -0.002
  
    //this.zAcceleration = zAcceleration
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
      const friction = 0.5
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
  width: 1000,
  height: 0.1,
  depth: 1000,
  color: '#000000',
  position: {
    x: 0,
    y: -2,
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
console.log(ground.top)
console.log(cube.bottom)




      

      // Criando as estrelas
      const starGeometry = new THREE.SphereGeometry(0.015, 10, 10);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

      for (let i = 0; i < 1000; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);

        // Definindo posição aleatória das estrelas
        star.position.x = Math.random() * 30 - 15;
        star.position.y = Math.random() * 10 - 5;
        star.position.z = Math.random() * 100 - 5;

        scene.add(star);

      }





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

let frames = 0
let spawnRate = 200


// Definir posição inicial da câmera igual à posição do cubo
camera.position.set(0, 0, 5);

// Fazer a câmera olhar para o centro do cubo
camera.lookAt(cube.position);




function animate() {
  const animationId = requestAnimationFrame(animate)


  //sdcube.position.x += 0.01;

  // Fazer a câmera seguir o cubo
  camera.position.x = cube.position.x;
  camera.lookAt(cube.position);


  renderer.render(scene, camera)

  // movement code
  cube.velocity.x = 0
  cube.velocity.z = 0
  if (keys.a.pressed) cube.velocity.x = -0.05
  else if (keys.d.pressed) cube.velocity.x = 0.05

  if (keys.s.pressed) cube.velocity.y = -0.05
  else if (keys.w.pressed) cube.velocity.y = 0.05

  cube.update(ground)
 
  
  enemies.forEach((enemy) => {
    enemy.update(ground)
    if (
      boxCollision({
        box1: cube,
        box2: enemy
      })
    ) {
      cancelAnimationFrame(animationId)
    }
  })

  

 
  if (frames % spawnRate === 0) {
    if (spawnRate > 5) spawnRate -= 4

    const enemy = new Box({
      width: 1,
      height: 1,
      depth: 1,
      position: {
        x: (Math.random() - 0.5) * 70,
        y: (Math.random() - 0.5) * 70,
        z: -70
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0.105  //incrementa em funcao do tempo
      },
      color: 'red',
      //zAcceleration: true
    })
    enemy.castShadow = true
    scene.add(enemy)
    enemies.push(enemy)
  }
  

  frames++
  // cube.position.y += -0.01
  // cube.rotation.x += 0.01
  // cube.rotation.y += 0.01
}
//animate()
