import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x111111)

const keys = { 
  w: false,
  a: false,
  s: false,
  d: false
}
const speed = 0.05

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
// Cube
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({ color: 0x00ff88 })
const cube = new THREE.Mesh(geometry, material)
cube.position.set(0, 0.9, 0)
scene.add(cube)

const controls = new PointerLockControls(camera, document.body)
document.addEventListener('click', () => controls.lock())

// Floor plane
const floorGeometry = new THREE.PlaneGeometry(100, 100)
const floorMaterial = new THREE.MeshStandardMaterial()
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2
floor.position.y = 0
floor.material = new THREE.MeshPhongMaterial({
  color: 0x9DD6AD,
  shininess: 100,
})

floor.receiveShadow = true
scene.add(floor)  

// Light
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 10, 5)
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
  0.35, 
  0.9,
  256,
  false, 
)
composer.addPass(filmPass)
function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01

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
