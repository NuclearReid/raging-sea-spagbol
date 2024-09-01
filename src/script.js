import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import vertexWaterShader from './shaders/water/vertex.glsl'
import fragmentWaterShader from './shaders/water/fragment.glsl'
import { Sky } from 'three/examples/jsm/Addons.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/**
 * Water
 */

// Geometry
const waterGeometry = new THREE.PlaneGeometry(3, 3, 512, 512)

const boxGeometry = new THREE.BoxGeometry(1, 1, 1, 1);
const boxMaterial = new THREE.MeshStandardMaterial();

const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(boxMesh)
boxMesh.visible = false

// Color
debugObject.surfaceColor = '#9bd8ff'
debugObject.depthColor = '#186691'

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexWaterShader,
    fragmentShader: fragmentWaterShader,
    uniforms: {
        uTime: { value: 0 }, // update this in the tick function

        // Big Waves
        uBigWavesElevation: { value: 0.16 },
        uBigWavesFrequency: { value: new THREE.Vector2(4.0, 1.5)},
        uBigWaveSpeed: { value: 0.75},

        // Small Waves
        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 3.0 },
        uSmallWavesSpeed: { value: 0.25 },
        uSmallIterations: { value: 3.0 },

        // colors
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uColorOffSet: { value: 0.322},
        uColorMultiplier: { value: 2.39 },

    }
})

/* 
 * Models
 */
let ship = null
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    './model/dutch_ship/dutch_ship_medium_1k.gltf',
    (gltf) =>
    {
        ship = gltf.scene
        ship.scale.set(0.05, 0.05, 0.05)
        scene.add(ship)
    }
)

// Debug
gui.add(waterMaterial.uniforms.uBigWavesElevation, 'value').min(0).max(1.0).step(0.01).name('uBigWavesElevation')




gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x').min(0).max(10).step(0.01).name('uBigWavesFrequencyX')
gui.add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y').min(0).max(10).step(0.01).name('uBigWavesFrequencyY')
gui.add(waterMaterial.uniforms.uBigWaveSpeed, 'value').min(0).max(10).step(0.01).name('uBigWaveSpeed')

// Small Wave tweeks
gui.add(waterMaterial.uniforms.uSmallWavesElevation, 'value').min(0).max(10.0).step(0.001).name('uSmallWavesElevation')
gui.add(waterMaterial.uniforms.uSmallWavesFrequency, 'value').min(0).max(10.0).step(0.001).name('uSmallWavesFrequency')
gui.add(waterMaterial.uniforms.uSmallWavesSpeed, 'value').min(0).max(10.0).step(0.001).name('uSmallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallIterations, 'value').min(0).max(10.0).step(1).name('uSmallIterations')

// debug colors
gui.addColor(debugObject, 'surfaceColor').onChange(() =>
    {
        waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
    })
gui.addColor(debugObject, 'depthColor').onChange( () => 
    {
        waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
    })



gui.add(waterMaterial.uniforms.uColorOffSet, 'value').min(0).max(1.0).step(0.001).name('uColorOffSet')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(15.0).step(0.01).name('uColorMultiplier')


// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/* 
 * Light
 */
const light = new THREE.AmbientLight(0xffffff)
scene.add(light)

const directionalLight = new THREE.DirectionalLight('#86cdff', 5.5)
directionalLight.position.set(3, 2, -8)
scene.add(directionalLight)


/* 
 * Sky
 */
const sky = new Sky()
sky.scale.set(100, 100, 100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

/* 
 * Fog
 */

// scene.fog = new THREE.FogExp2(0x0000ff, 0.8)
// scene.fog = new THREE.Fog('red', 1, 13)

/**
 * Animate
 */
const clock = new THREE.Clock()

debugObject.shipDownOffset = 0.072

gui.add(debugObject, 'shipDownOffset').min(-2).max(2).step(0.001)

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()




    waterMaterial.uniforms.uTime.value = elapsedTime; // needs to be '.value'
    if(ship)
    {
        ship.rotation.z = Math.cos(elapsedTime + 1) * 0.3
        ship.position.y = (waterMaterial.uniforms.uBigWavesElevation.value - debugObject.shipDownOffset) //+ Math.cos(elapsedTime) * 0.05
    }
    
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()