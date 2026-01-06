import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0xcccccc)

const keys = { 
  w: false,
  a: false,
  s: false,
  d: false
}
const speed = 0.05
let orb_random_color_intensity = 2

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true
})

window.addEventListener('keyup', (e) => {
  if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false
})


const camera = new THREE.PerspectiveCamera(
  75, // fov
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.set(0, 1.6, 5)



// crosshair
const raycaster = new THREE.Raycaster() // used for raycasting from crosshair
const crosshair_material = new THREE.LineBasicMaterial({ color: 0xffffff })
const size = 0.001

const crosshair_geometry = new THREE.BufferGeometry()
crosshair_geometry.setFromPoints([
  new THREE.Vector3(-size, 0, -0.1),
  new THREE.Vector3(size, 0, -0.1),
  new THREE.Vector3(0, -size, -0.1),
  new THREE.Vector3(0, size, -0.1),
])

const crosshair = new THREE.LineSegments(crosshair_geometry, crosshair_material)
camera.add(crosshair) // attach to camera
scene.add(camera)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.domElement.addEventListener('click', onClick)
/* Cube
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x3C0061 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(0, 1, 0)
scene.add(cube)
*/
// Cube Stars
const star_width = 100;
const star_length = 100;
const star_material = new THREE.MeshBasicMaterial({ color: 0xffffff })
let star_array = new Array()
for (let i=0; i<1000; i++) {
  const star = new THREE.Mesh(new THREE.SphereGeometry(0.1 * Math.random() + 0.2, 32, 10), star_material)
  star.position.set(
    Math.random() * star_width - 50,
    Math.random() * 30 + 10,
    Math.random() * star_length- 50
  )
  /* const color = new THREE.Color(
    Math.random() * orb_random_color_intensity + 1,
    Math.random() * orb_random_color_intensity + 1,
    Math.random() * orb_random_color_intensity + 1
  ) 
  */
  const color = new THREE.Color(
    255 - 235,
    209 - 207,
    220 - 210
  )

  star.material.color.copy(color)

  star_array.push(star)
  scene.add(star)}
// maybe i can convert all these stars into a single object and shift them so the center is 0
      
const controls = new PointerLockControls(camera, document.body)
document.addEventListener('click', () => controls.lock())

// Floor plane
const floorGeometry = new THREE.PlaneGeometry(100, 100)
const floorMaterial = new THREE.MeshStandardMaterial()
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2
floor.position.y = 0
floor.material = new THREE.MeshPhongMaterial({
  color: 0x3C0061,
  shininess: 100,
})

floor.receiveShadow = true
scene.add(floor)  

// mp3 player
const mp3_backboard_geometry = new THREE.BoxGeometry(2, 1, 0.1)
const mp3_play_geometry = new THREE.BoxGeometry(0.5, 0.5, 0.1)

const mp3_play_material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const mp3_backboard_material = new THREE.MeshStandardMaterial({ color: 0x3C0061 })
const mp3_backboard = new THREE.Mesh(mp3_backboard_geometry, mp3_backboard_material)
const mp3_play = new THREE.Mesh(mp3_play_geometry, mp3_play_material)
const mp3_back = new THREE.Mesh(mp3_play_geometry, mp3_play_material)
const mp3_skip = new THREE.Mesh(mp3_play_geometry, mp3_play_material)

let button_gap = 0.6;
mp3_backboard.position.set(0, 1, 0)
mp3_play.position.set(0, 1, 0.1)
mp3_skip.position.set(button_gap, 1, 0.1)
mp3_back.position.set(-button_gap, 1, 0.1)

scene.add(mp3_backboard)
scene.add(mp3_play)
scene.add(mp3_skip)
scene.add(mp3_back)



// Light
const light = new THREE.DirectionalLight(0xffffff, 4.2)
light.position.set(-0, 3, 5)
//light.position.set(5, 100, 5)
scene.add(light)

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const direction = new THREE.Vector3()
const right = new THREE.Vector3()

const composer = new EffectComposer(renderer)
const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)
const filmPass = new FilmPass(
  0.15, 
  0.9,
)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.1,
  0.5,
  0.85
)

// ray cast function doesn't quite work yet.
function onClick() {
  if (!controls.isLocked) return
  raycaster.setFromCamera({ x: 0, y: 0 }, camera)

  const intersects = raycaster.intersectObjects(
    [mp3_play, mp3_back, mp3_skip],
    false
  )

  if (!intersects.length) return
  console.log(intersects)

  const clicked = intersects[0].object

  if (clicked === mp3_play) {
    console.log('PLAY')
  } else if (clicked === mp3_back) {
    console.log('BACK')
  } else if (clicked === mp3_skip) {
    console.log('SKIP')
  }
}



composer.addPass(bloomPass)
composer.addPass(filmPass)
function animate() {
  requestAnimationFrame(animate)
  //cube.rotation.x += 0.01
  //cube.rotation.y += 0.01

  for (let i=0; i<star_array.length; i++) {
    star_array[i].position.x += 0.01
    // star_array[i].material.color.r = Math.random() * orb_random_color_intensity + 0
    
    if (star_array[i].position.x > 50) star_array[i].position.x = -50
  }
  // if (orb_random_color_intensity < 10) orb_random_color_intensity += 0.01

  // WASD movement
  camera.getWorldDirection(direction)
  direction.y = 0
  direction.normalize()
  right.crossVectors(direction, camera.up)
  if (keys.w) camera.position.addScaledVector(direction, speed)
  if (keys.a) camera.position.addScaledVector(right, -speed)
  if (keys.s) camera.position.addScaledVector(direction, -speed)
  if (keys.d) camera.position.addScaledVector(right, speed)
  controls.update()
  composer.render()

}

animate()
