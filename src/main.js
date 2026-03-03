import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x222222)
const keys = { 
  w: false,
  a: false,
  s: false,
  d: false,
  i: false,
  o: false,
  space: false,
  shift: false
}
const speed = 0.05
let orb_random_color_intensity = 2

function isArrowKey(e) {
  if (
    e.key === "ArrowLeft" ||
    e.key === "ArrowUp" ||
    e.key === "ArrowDown" ||
    e.key === "ArrowRight") {
      return true;
  }
  return false;
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase()

  if (key in keys) keys[key] = true
  if (key === ' ') keys.space = true
  if (key === 'shift') keys.shift = true
  if (isArrowKey(e)) {
    star_shifting = true 
    shiftStar(e);
  }
})

window.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase()

  if (key in keys) keys[key] = false
  if (key === ' ') keys.space = false
  if (key === 'shift') keys.shift = false
  if (isArrowKey(e)) {
    star_shifting = false 
    shiftStar(e);
  }
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
renderer.domElement.addEventListener('click', () => {
  if (!controls.isLocked) {
    controls.lock()
    return
  }
  onClick()
})
//
//
const star_width = 100;
const star_length = 100;
//const star_material = new THREE.MeshBasicMaterial({ color: 0xffffff })

const star_material = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffffff,
  emissiveIntensity: 1.5
})
let star_shifting = false; 
let star_array = new Array()
function createRandomStars(star_count) {
  for (let i=0; i<star_count; i++) {
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.01 * Math.random() + 0.1, 8, 8), star_material)
    star.position.set(
      Math.random() * star_width - 50,
      Math.random() * 50 + 0,
      Math.random() * star_length- 50
    )

    // ill pick a cooler color later lol
    const color = new THREE.Color(
      (255 - 235) / 255,
      (209 - 207) / 255,
      (220 - 210) / 255
    )

    star.material.color.copy(color)

    star_array.push(star)
    scene.add(star)
  }
}
function initStars() {
  for (let i = 0; i < star_array.length; i++) {
    star_array[i].userData.target = new THREE.Vector3(0, 2, 0)
  }
}
function randomizeStars() {
  for (let i=0; i<star_array.length; i++) {
    star_array[i].position.set(
      Math.random() * star_width - 50,
      Math.random() * 50 + 0,
      Math.random() * star_length- 50
    )
  }
}
function shiftStar(e) {
  for (let i=0; i<star_array.length; i++) {
    const star = star_array[i]

    if (e.key === "ArrowLeft")  star.position.x -= speed
    if (e.key === "ArrowUp")    star.position.y += speed
    if (e.key === "ArrowDown")  star.position.y -= speed
    if (e.key === "ArrowRight") star.position.x += speed
  }
}
createRandomStars(100)

const controls = new PointerLockControls(camera, document.body)

const floorGeometry = new THREE.PlaneGeometry(100, 100)
const floorMaterial = new THREE.MeshStandardMaterial()
const floor = new THREE.Mesh(floorGeometry, floorMaterial)
floor.rotation.x = -Math.PI / 2
floor.position.y = 0
floor.material = new THREE.MeshPhongMaterial({
  color: 0x3C0061,
  specular: 0xffffff,
  shininess: 300,
})

floor.receiveShadow = true
scene.add(floor)  

/* mp3 player
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

// scene.add(mp3_backboard)
// scene.add(mp3_play)
// scene.add(mp3_skip)
/. scene.add(mp3_back)
*/


// Light
const hemi = new THREE.HemisphereLight(
  0xffffff, // sky color
  0x444444, // ground color
  3.6       // intensity
)
scene.add(hemi)
const light_cube_geometry = new THREE.BoxGeometry()
const light_cube_material = new THREE.MeshStandardMaterial({ color: 0x3C0061 })
const light_cube = new THREE.Mesh(light_cube_geometry, light_cube_material)
light_cube.position.set(0, 3, -5)
scene.add(light_cube)

// resize handling
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
  0.1, 
  0.9,
)
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.1,
  0.5,
  0.85
)
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

  for (let i = 0; i < star_array.length; i++) {
    const star = star_array[i]
    const target = star.userData.target

    if (target) {
      // move 2% toward target each frame (adjust for speed)
      star.position.lerp(target, 0.02)

      // stop when close enough
      if (star.position.distanceTo(target) < 0.05) {
        star.position.copy(target)
        star.userData.target = null
      }
    } else if (!star_shifting) {
        // normal drifting movement
        star.position.x += 0.01
        star.position.y += 0.01
        if (star.position.x > 50) star.position.x = -50
        if (star.position.y > 50) star.position.y = 0
    }
  }

  
  if (orb_random_color_intensity < 10) orb_random_color_intensity += 0.01

  // WASD movement
  camera.getWorldDirection(direction)
  direction.y = 0
  direction.normalize()
  right.crossVectors(direction, camera.up)
  if (keys.w) camera.position.addScaledVector(direction, speed)
  if (keys.a) camera.position.addScaledVector(right, -speed)
  if (keys.s) camera.position.addScaledVector(direction, -speed)
  if (keys.d) camera.position.addScaledVector(right, speed)
  if (keys.i) initStars()
  if (keys.o) randomizeStars()
  if (keys.space) camera.position.y += speed
  if (keys.shift) camera.position.y -= camera.position.y > floor.position.y + 1 ? speed : 0;
  controls.update()
  composer.render()

}

animate()
