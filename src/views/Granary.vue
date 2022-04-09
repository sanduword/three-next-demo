<script lang="ts" setup>
import { reactive } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { ElNotification } from 'element-plus'
import '@/styles/granary.scss'

let pathStr = '../../src/assets/granary/'
if (import.meta.env.MODE === 'production') {
  pathStr = import.meta.env.BASE_URL + 'assets/granary/'
}
// 属性状态
const state = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
  panelShow: false, // 提示面板
  lcShow: true, // 粮仓
  labelShow: true, // 标签
  weatherShow: true, // 天气
  poucheShow: true, // 剖切
  treeData: new Array(),
  left: 500,
  top: 500,
  S: 0,
  currentMesh: {
    G_name: '', // 名称
    G_C_height: 0, // 仓高
    G_L_height: 0, // 粮高
    G_class: 0, // 谷物
    G_temperature: 0, // 温度
    G_ton: 0, // 吨位
    iconpath: '', // 图标
  },
})

// 左上角切换状态
const setStatus = (swtType: String) => {
  switch (swtType) {
    case 'lcShow':
      // 隐藏粮仓
      allGroup.children.forEach((group: any) => {
        group.children.forEach((mesh: any) => {
          if (mesh.type === 'Mesh') {
            if (state.lcShow) {
              mesh.material.visible = true
            } else {
              mesh.material.visible = false
            }
          }
        })
      })
      break
    case 'labelShow':
      // 显示标签
      const labelList = document.querySelectorAll<HTMLElement>('.label')
      for (let i = 0; i < labelList.length; i++) {
        if (state.labelShow) {
          labelList[i].style.visibility = 'hidden'
        } else {
          labelList[i].style.visibility = 'visible'
        }
      }

      break
    case 'weatherShow':
      // 天气可见
      if (state.weatherShow) {
        scene.remove(rainGroup)
      } else {
        scene.add(rainGroup)
      }
      break
    case 'poucheShow':
      // 关闭剖切
      if (state.poucheShow) {
        renderer.localClippingEnabled = true
      } else {
        renderer.localClippingEnabled = false
      }
      break
  }
}

// 场景
const scene = new THREE.Scene()
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load(pathStr + 'maps/background/0.jpg')
scene.background = texture

// 平房仓、立筒仓、浅圆仓
const groupPF = new THREE.Group()
const groupLT = new THREE.Group()
const groupQY = new THREE.Group()

groupPF.position.set(+10, 0, -85)
groupLT.position.set(-40, 0, -105)
groupQY.position.set(-40, 0, -25)

const allGroup = new THREE.Group()
allGroup.add(groupPF, groupLT, groupQY)
scene.add(allGroup)
state.treeData = [
  {
    id: groupPF.id,
    label: '平房仓',
    children: [],
  },
  {
    id: groupLT.id,
    label: '立筒仓',
    children: [],
  },
  {
    id: groupQY.id,
    label: '浅圆仓',
    children: [],
  },
]

// 加载模型
const objLoader = new OBJLoader()

// 粮仓主体 地板、门、围栏
const renterFrame = () => {
  objLoader.load(pathStr + 'models/wall.obj', function (obj: any) {
    obj.scale.set(0.98, 0.6, 1)
    const textLan = new THREE.TextureLoader().load(
      pathStr + 'maps/wall/lan.png'
    )
    textLan.wrapS = THREE.RepeatWarpping
    textLan.wrapT = THREE.RepeatWarpping
    textLan.repeat.set(40, 1)
    obj.children[0].material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: textLan,
      transparent: true,
    })

    const textDoor = new THREE.TextureLoader().load(
      pathStr + 'maps/door/door.png'
    )
    obj.children[1].material = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      map: textDoor,
      transparent: true,
    })

    scene.add(obj)
  })
}

// 加载平房仓
const renderPFC = () => {
  objLoader.load(pathStr + 'models/pfc.obj', function (obj: any) {
    const mesh = obj.children[0]
    mesh.translateZ(2)
    mesh.translateX(1)
    mesh.scale.set(1.3, 1.4, 1.5)
    const textureLoader = new THREE.TextureLoader().load(
      pathStr + 'models/pfc_background.png'
    )
    // 创建，2行3列的贴图模型
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        const meshN = mesh.clone()
        meshN.material = new THREE.MeshBasicMaterial({
          map: textureLoader,
          transparent: true,
          side: THREE.DoubleSide,
          clipIntersection: true,
        })
        // 编号
        meshN.G_id = 'P-' + (i + 1) * (j + 1)
        // 名称
        meshN.G_name = state.treeData[0].label + ' P-' + (i + 1) * (j + 1)
        meshN.translateX(i * 52.5)
        meshN.translateZ(j * 81.6)
        groupPF.add(meshN)

        // 仓高
        meshN.G_C_height = 8
        // 粮高
        meshN.G_L_height = (4.9 * Math.random() + 3).toFixed(1)
        // 谷物
        meshN.G_class = '黄豆'
        // 温度
        meshN.G_temperature = (36 * (Math.random() / 10 + 0.9)).toFixed(1)
        // 吨位
        meshN.G_ton = meshN.G_L_height * 1000
        meshN.iconpath = pathStr + 'models/huangdou.png'
        // 模型
        const geometry = new THREE.BoxGeometry(
          21 - 0.2,
          meshN.G_L_height,
          40 - 0.2,
          25
        )
        // 材质
        const material = new THREE.MeshLambertMaterial({
          color: 0xe99147,
        })
        const meshM = new THREE.Mesh(geometry, material)
        meshN.add(meshM)
        meshM.translateY(meshN.G_L_height / 2)
        groupPF.add(meshN)
        const label = renderLabel('label-white', 0, meshN)
        groupPF.add(label)
      }
    }
  })
}

// 加载立筒仓
const renderLTC = () => {
  objLoader.load(pathStr + 'models/ltc.obj', function (obj: any) {
    const mesh = obj.children[0]
    mesh.rotateZ(Math.PI)
    mesh.translateY(-36)
    const textureLoader = new THREE.TextureLoader().load(
      pathStr + 'models/ltc_background.png'
    )
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 3; j++) {
        const meshN = mesh.clone()
        meshN.material = new THREE.MeshPhongMaterial({
          map: textureLoader,
          transparent: true,
          side: THREE.DoubleSide,
          clipIntersection: true,
        })
        // 编号
        meshN.G_id = 'L-' + (i + 1) * (j + 1)
        // 名称
        meshN.G_name = state.treeData[1].label + ' L-' + (i + 1) * (j + 1)
        meshN.translateX(i * 26)
        meshN.translateZ(j * 21)
        meshN.rotateY(Math.PI / 6)
        groupLT.add(meshN)

        // 仓高
        meshN.G_C_height = 36
        // 粮高
        meshN.G_L_height = (15 * Math.random() + 20).toFixed(1)
        // 谷物
        meshN.G_class = '红豆'
        // 温度
        meshN.G_temperature = (36 * (Math.random() / 10 + 0.9)).toFixed(1)
        // 吨位
        meshN.G_ton = meshN.G_L_height * 200
        meshN.iconpath = pathStr + 'models/hongdou.png'
        // 模型
        const geometry = new THREE.CylinderGeometry(
          8 - 0.2,
          8 - 0.2,
          meshN.G_L_height,
          25
        )
        // 材质
        const material = new THREE.MeshLambertMaterial({
          color: 0xb63427,
        })
        const meshM = new THREE.Mesh(geometry, material)
        meshN.add(meshM)
        meshM.translateY(36 - meshN.G_L_height / 2)
        const label = renderLabel('label-cyan', 1, meshN)
        groupLT.add(label)
      }
    }
  })
}

// 加载浅圆仓
const renderQYC = () => {
  objLoader.load(pathStr + 'models/qyc.obj', function (obj: any) {
    const mesh = obj.children[0]
    mesh.rotateZ(Math.PI)
    mesh.translateY(-20)
    mesh.translateZ(5)
    const textureLoader = new THREE.TextureLoader().load(
      pathStr + 'models/qyc_background.png'
    )
    // 创建2行6列的贴图模型
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 6; j++) {
        const meshN = mesh.clone()
        meshN.material = new THREE.MeshPhongMaterial({
          map: textureLoader,
          transparent: true,
          side: THREE.DoubleSide,
          clipIntersection: true,
        })
        // 编号
        meshN.G_id = 'Q-' + (i + 1) * (j + 1)
        // 名称
        meshN.G_name = state.treeData[2].label + ' Q-' + (i + 1) * (j + 1)
        meshN.translateX(i * 25)
        meshN.translateZ(j * 24)
        meshN.rotateY(Math.PI / 6)
        groupQY.add(meshN)

        // 仓高
        meshN.G_C_height = 20
        // 粮高
        meshN.G_L_height = (10.9 * Math.random() + 9).toFixed(1)
        // 谷物
        meshN.G_class = '绿豆'
        // 温度
        meshN.G_temperature = (36 * (Math.random() / 10 + 0.9)).toFixed(1)
        // 吨位
        meshN.G_ton = meshN.G_L_height * 400
        meshN.iconpath = pathStr + 'models/lvdou.png'
        // 模型
        const geometry = new THREE.CylinderGeometry(
          10 - 0.2,
          10 - 0.2,
          meshN.G_L_height,
          25
        )
        // 材质
        const material = new THREE.MeshLambertMaterial({
          color: 0x91a337,
        })
        const meshM = new THREE.Mesh(geometry, material)
        meshN.add(meshM)
        meshM.translateY(20 - meshN.G_L_height / 2)
        const label = renderLabel('label-cyan', 2, meshN)
        groupQY.add(label)
      }
    }
  })
}

// 渲染label组件
const renderLabel = (labelCls: string, num: number, meshN: any) => {
  const labelObj = document.querySelector<HTMLElement>(`.${labelCls}`)
  if (labelObj) {
    const labelObj2 = labelObj.cloneNode(true) as HTMLElement

    labelObj2.style.visibility = 'hidden'
    labelObj2.className += ' label'
    labelObj2.childNodes[1].childNodes[0].textContent = meshN.G_name

    const label = new CSS2DObject(labelObj2)
    label.position.copy(meshN.position)
    state.treeData[num].children.push({
      id: meshN.id,
      mesh: meshN,
      label: meshN.G_name,
      children: [],
    })

    return label
  }
}

// 雨雪
const rainGroup = new THREE.Group()
// @num 落点
// @x   x坐标
// @y   y坐标
// @z   z坐标
const renderRain = (num: number, x: number, y: number, z: number) => {
  const rainText = new THREE.TextureLoader().load(pathStr + 'models/rain.png')
  for (let i = 0; i < num; i++) {
    const spriteMaterial = new THREE.SpriteMaterial({
      map: rainText,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    rainGroup.add(sprite)
    sprite.scale.set(x, y, z)
    const k1 = Math.random() - 0.5
    const k2 = Math.random() - 0.5
    sprite.position.set(num * k1, (num / 2) * Math.random(), num * k2)
  }
}

// 光源
const axesHelper = new THREE.AxesHelper(500)
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7)
directionalLight.position.set(50, 250, 500)
scene.add(directionalLight)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight2.position.set(-400, -400, -400)
scene.add(directionalLight2)
const ambient = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambient)

// 相机
let k = state.width / state.height
let s = 100
let ks = Math.ceil(s * k)
/* 
  left——渲染空间的左边界
  right——渲染空间的右边界
  top——渲染空间的上边界
  bottom——渲染空间的下边界
  near——near属性表示的是从距离相机多远的位置开始渲染，一般情况会设置一个很小的值。 默认值0.1
  far——far属性表示的是距离相机多远的位置截止渲染，如果设置的值偏小小，会有部分场景看不到。 默认值1000
*/

const camera = new THREE.OrthographicCamera(-ks, ks, s, -s, 1, 20000)
camera.position.set(ks * 1.533, ks, ks * 1.185)
camera.lookAt(scene.position)

// 渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})

renderer.setSize(state.width, state.height)
renderer.setClearColor(0x409eff, 1)
document.body.appendChild(renderer.domElement)

// 渲染在模型坐标上的网页标签
const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(state.width, state.height)
labelRenderer.domElement.style.position = 'absolute'
labelRenderer.domElement.style.top = '0'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

// 多通道渲染
const rendererPass = new RenderPass(scene, camera)

// 线条渲染
const outlinePass = new OutlinePass(
  new THREE.Vector2(state.width, state.height),
  scene,
  camera
)
outlinePass.visibleEdgeColor = new THREE.Color(0, 1, 0)
outlinePass.hiddenEdgeColor = new THREE.Color(0, 1, 0)
outlinePass.edgeThickness = 3.0

// 效果合成器
const composer = new EffectComposer(renderer)
composer.addPass(rendererPass)
composer.addPass(outlinePass)

// 着色器通道渲染
const shadePass = new ShaderPass(FXAAShader)
shadePass.renderToScreen = true
shadePass.uniforms['resolution'].value.set(1 / state.width, 1 / state.height)

composer.addPass(shadePass)
// 可以剖切
renderer.localClippingEnabled = true

const clock = new THREE.Clock()
const FPS = 30
let T = 1 / FPS
let timeS = 0
let i = 0
scene.rotateY(-0.3)
const render = () => {
  i += 1
  if (i < 300) {
    scene.rotateY(0.001)
  }
  rainGroup.children.forEach((sprite: any) => {
    sprite.position.y -= 0.5
    if (sprite.position.y < 0) {
      sprite.position.y = 200
    }
  })
  requestAnimationFrame(render)
  //renderer.render(scene, camera)
  let deltaT = clock.getDelta()
  timeS = timeS + deltaT
  if (timeS > T) {
    // 效果合成器最终把背景进行实时渲染
    composer.render()
    labelRenderer.render(scene, camera)
    timeS = 0
  }
}

// 鼠标控制
const initControls = () => {
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enablePan = false
  controls.minZoom = 0.6
  controls.maxZoom = 3
}

// 底部场景
// 创建粮仓地面
const createGrPanel = () => {
  const geometry = new THREE.PlaneGeometry(270, 260)
  // 宽1014 高1024
  const texture = new THREE.TextureLoader().load(
    pathStr + 'maps/ground/floor3.png'
  )
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    side: THREE.DoubleSide,
    transparent: true,
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  mesh.rotateX(-Math.PI / 2)
  mesh.position.y = -0.01
}

// 创建草地地面
const createGrLand = () => {
  const geometry = new THREE.PlaneGeometry(1024, 1024)
  const texture = new THREE.TextureLoader().load(pathStr + 'maps/land/1.png')
  texture.wrapS = THREE.RepeatWarpping
  texture.wrapT = THREE.RepeatWarpping
  texture.repeat.set(10, 10)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  mesh.rotateX(-Math.PI / 2)
  mesh.position.y = -0.1
}

// 创建马路路面
const createGrRoad = () => {
  const geometry = new THREE.PlaneGeometry(24, 800)
  const texture = new THREE.TextureLoader().load(pathStr + 'maps/road/road.png')
  texture.wrapS = THREE.RepeatWarpping
  texture.wrapT = THREE.RepeatWarpping
  texture.repeat.set(1, 10)
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  mesh.rotateX(-Math.PI / 2)
  mesh.rotateZ(Math.PI / 2)
  mesh.position.z = 142
}

// 创建一圈树
const createGrTree = () => {
  const group = new THREE.Group()
  let w = 190
  let h = 260
  const textureTree = new THREE.TextureLoader().load(
    pathStr + 'maps/tree/tree.png'
  )
  const material = new THREE.SpriteMaterial({
    map: textureTree,
    transparent: true,
  })

  const sprite = new THREE.Sprite(material)
  let H = 8
  sprite.scale.set(4, H, 1)
  sprite.translateY(H / 2)

  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 27; j++) {
      if (i * 10 === 0 || i * 10 === 190 || j * 10 === 0 || j * 10 === 260) {
        if (j * 10 === 260 && i * 10 >= 120 && i * 10 <= 150) {
        } else {
          const spriteN = sprite.clone()
          spriteN.translateX(i * 10 - w / 2)
          spriteN.translateZ(j * 10 - h / 2)
          group.add(spriteN)
        }
      }
    }
  }

  group.scale.set(0.96, 0.96, 0.98)
  scene.add(group)
}

// 添加模型点击事件
// 用面板装载
const panelArr = [
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), 1),
  new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
]
let lastMesh: any
const modelsClick = (event: any) => {
  if (lastMesh) {
    state.panelShow = false
    lastMesh.material.clippingPlanes = null
    outlinePass.selectedObjects = []
  }

  const sX = event.clientX
  const sY = event.clientY
  state.left = sX + 20
  state.top = sY + 20
  let x = (sX / state.width) * 2 - 1
  let y = -(sY / state.height) * 2 + 1
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  const intersects = raycaster.intersectObjects(allGroup.children, true)
  if (intersects.length > 0) {
    state.panelShow = true
    const mesh = intersects[0].object
    Object.assign(state.currentMesh, mesh)
    outlinePass.selectedObjects = [mesh]
    let S = state.currentMesh.G_ton
    state.S = 0
    let startTime = new Date().getTime()
    let timer = setInterval(() => {
      if (new Date().getTime() - startTime > (S / 58) * 6) {
        clearInterval(timer)
        return
      }
      if (state.S < S) {
        state.S += 58
      }
    }, 6)
    scene.updateMatrixWorld(true)
    const worldPosition = new THREE.Vector3()
    mesh.getWorldPosition(worldPosition)
    lastMesh = mesh
    panelArr[0].constant = worldPosition.x
    panelArr[1].constant = worldPosition.z
    mesh.material.clipIntersection = true
    mesh.material.clippingPlanes = panelArr
  }
}

addEventListener('click', modelsClick)

window.onresize = function () {
  state.width = window.innerWidth
  state.height = window.innerHeight
  labelRenderer.setSize(state.width, state.height)
  renderer.setSize(state.width, state.height)
  k = state.width / state.height
  camera.left = -s * k
  camera.right = s * k
  camera.top = s
  camera.bottom = -s
  camera.updateProjectionMatrix()
}

// 着火
// WebGL调用代码
// 顶点着色器代码
const vertexShader = `
    attribute vec4 orientation;
    attribute vec3 offset;
    attribute vec2 scale;
    attribute float life;
    attribute float random;
    varying vec2 vUv;
    varying float vRandom;
    varying float vAlpha;
    float range(float oldValue, float oldMin, float oldMax, float newMin, float newMax) {
        float oldRange = oldMax - oldMin;
        float newRange = newMax - newMin;
        return (((oldValue - oldMin) * newRange) / oldRange) + newMin;
    }
    float pcurve(float x, float a, float b) {
        float k = pow(a + b, a + b) / (pow(a, a) * pow(b, b));
        return k * pow(x, a) * pow(1.0 - x, b);
    }
    void main() {
        vUv = uv;
        vRandom = random;
        vAlpha = pcurve(life, 1.0, 2.0);
        vec3 pos = position;
        pos.xy *= scale * vec2(range(pow(life, 1.5), 0.0, 1.0, 1.0, 0.6), range(pow(life, 1.5), 0.0, 1.0, 0.6, 1.2));
        vec4 or = orientation;
        vec3 vcV = cross(or.xyz, pos);
        pos = vcV * (2.0 * or.w) + (cross(or.xyz, vcV) * 2.0 + pos);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `
// 片元着色器代码
const fragmentShader = `
    uniform sampler2D uMap;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uTime;
    varying vec2 vUv;
    varying float vAlpha;
    varying float vRandom;
    void main() {
        vec2 uv = vUv;
        float spriteLength = 10.0;
        uv.x /= spriteLength;
        float spriteIndex = mod(uTime * 0.1 + vRandom * 2.0, 1.0);
        uv.x += floor(spriteIndex * spriteLength) / spriteLength;
        vec4 map = texture2D(uMap, uv);
        gl_FragColor.rgb = mix(uColor2, uColor1, map.r);
        gl_FragColor.a = vAlpha * map.a;
    }
  `

const initFire = (
  w: number,
  h: number,
  posX: number,
  posY: number,
  posZ: number
) => {
  // 随机数
  const random = (min: number, max: number, precision: number) => {
    // 求幂
    let p = Math.pow(10, precision)
    return Math.round((min + Math.random() * (max - min)) * p) / p
  }

  const fireVertexShader = vertexShader
  const fireFragmentShader = fragmentShader

  let _geometry: any
  let _shader: any
  let _mesh: any
  let _group: any
  let _num = 12
  const _x = new THREE.Vector3(1, 0, 0)
  const _y = new THREE.Vector3(0, 1, 0)
  const _z = new THREE.Vector3(0, 0, 1)
  const _tipTarget = new THREE.Vector3()
  const _tip = new THREE.Vector3()
  const _diff = new THREE.Vector3()
  const _quat = new THREE.Quaternion()
  const _quat2 = new THREE.Quaternion()

  const initGeometry = () => {
    _geometry = new THREE.InstancedBufferGeometry()
    _geometry.maxInstancedCount = _num
    const shape = new THREE.PlaneBufferGeometry(w, h)
    shape.translate(0, 0.4, 0)
    const data = shape.attributes
    _geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(data.position.array), 3)
    )
    _geometry.setAttribute(
      'uv',
      new THREE.BufferAttribute(new Float32Array(data.uv.array), 2)
    )
    _geometry.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(data.normal.array), 3)
    )
    _geometry.setIndex(
      new THREE.BufferAttribute(new Uint16Array(shape.index.array), 1)
    )
    shape.dispose()
  }

  const initInstances = () => {
    const orientation = new THREE.InstancedBufferAttribute(
      new Float32Array(_num * 4),
      4
    )
    const randoms = new THREE.InstancedBufferAttribute(
      new Float32Array(_num),
      1
    )
    const scale = new THREE.InstancedBufferAttribute(
      new Float32Array(_num * 2),
      2
    )
    const life = new THREE.InstancedBufferAttribute(new Float32Array(_num), 1)
    for (let i = 0; i < _num; i++) {
      orientation.setXYZW(i, 0, 0, 0, 1)
      life.setX(i, i / _num + 1)
    }
    _geometry.setAttribute('orientation', orientation)
    _geometry.setAttribute('scale', scale)
    _geometry.setAttribute('life', life)
    _geometry.setAttribute('random', randoms)
  }

  const initShader = () => {
    let uniforms = {
      uMap: {
        type: 't',
        value: null,
      },
      uColor1: {
        typeof: 'c',
        value: new THREE.Color(0x961800),
      },
      uColor2: {
        typeof: 'c',
        value: new THREE.Color(0x4b5828),
      },
      uTime: {
        type: 'f',
        value: 0,
      },
    }

    _shader = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      pathStr + 'images/flame.png',
      (t: any) => (_shader.uniforms.uMap.value = t)
    )
  }

  const initMesh = () => {
    _group = new THREE.Group()
    _mesh = new THREE.Mesh(_geometry, _shader)
    _mesh.frustumCulled = false
    _group.add(_mesh)
    scene.add(_group)
    _mesh.scale.set(0.01, 0.01, 0.01)
    setTimeout(() => {
      _mesh.scale.set(1, 1, 1)
      ElNotification({
        title: '火警',
        message: '平房仓 P-2失火报警',
        type: 'warning',
      })
    }, 3000)
    setTimeout(() => {
      ElNotification({
        title: '自动灭火',
        message: '自动灭火器开启预计1分内完成无需119',
        type: 'success',
      })
    }, 5000)
    let startTime = new Date().getTime()
    let interval = setInterval(function () {
      if (new Date().getTime() - startTime > 20 * 1000) {
        ElNotification({
          title: '成功',
          message: '已完成灭火，用时20s',
          type: 'success',
        })
        scene.remove(_group)
        clearInterval(interval)
        return
      }
    }, 200)
    //_fire = _group
  }

  const loop = (e: any) => {
    requestAnimationFrame(loop)
    _shader.uniforms.uTime.value = e * 0.001
    const life = _geometry.attributes.life
    const orientation = _geometry.attributes.orientation
    const scale = _geometry.attributes.scale
    const randoms = _geometry.attributes.random
    for (let i = 0; i < _num; i++) {
      let value = life.array[i]
      value += 0.04
      if (value > 1) {
        value -= 1
        _quat.setFromAxisAngle(_y, random(0, 3.14, 3))
        _quat2.setFromAxisAngle(_x, random(-1, 1, 2) * 0.1)
        _quat.multiply(_quat2)
        _quat2.setFromAxisAngle(_z, random(-1, 1, 2) * 0.3)
        _quat.multiply(_quat2)
        orientation.setXYZW(i, _quat.x, _quat.y, _quat.z, _quat.w)
        scale.setXY(i, random(0.8, 1.2, 3), random(0.8, 1.2, 3))
        randoms.setX(i, random(0, 1, 3))
      }
      life.setX(i, value)
    }
    life.needsUpdate = true
    orientation.needsUpdate = true
    scale.needsUpdate = true
    randoms.needsUpdate = true
    _group.position.x = posX
    _group.position.y = posY
    _group.position.z = posZ
    let tipOffset = 0.4
    _tipTarget.copy(_group.position)
    _tipTarget.y += tipOffset
    _tip.lerp(_tipTarget, 0.1)
    _diff.copy(_tip)
    _diff.sub(_group.position)
    let length = _diff.length()
    _group.scale.y = (length / tipOffset - 1) * 0.4 + 1
    _group.quaternion.setFromUnitVectors(_y, _diff.normalize())
  }

  ;(function () {
    initGeometry()
    initInstances()
    initShader()
    initMesh()
    requestAnimationFrame(loop)
  })()
}

;(function () {
  render()
  // 创建粮仓地面
  createGrPanel()
  // 创建草地地面
  createGrLand()
  // 创建马路路面
  createGrRoad()
  // 创建一圈树
  createGrTree()
  // 粮仓模型
  renterFrame()
  // 加载平房仓
  renderPFC()
  // 加载立筒仓
  renderLTC()
  // 加载浅圆仓
  renderQYC()
  // 雨雪
  renderRain(500, 3.2, 4, 1)
  renderRain(500, 2.4, 3, 1)
  // 场景鼠标控制
  initControls()

  setTimeout(() => {
    initFire(20, 40, 20, 30, 0)
  }, 2000)
})()
</script>

<template>
  <div class="granary">
    <div class="title">
      <h4>粮仓3D可视化系统</h4>
      <img src="@/assets/granary/images/line.png" />
    </div>
    <div class="hud">
      <div class="row" style="padding-bottom: 10px">
        <el-switch
          v-model="state.lcShow"
          @change="setStatus('lcShow')"
        ></el-switch>
        <span class="text" style="padding-right: 20px">隐藏粮仓</span>
        <el-switch
          v-model="state.labelShow"
          @change="setStatus('labelShow')"
        ></el-switch>
        <span class="text">显示标签</span>
      </div>
      <div class="row" style="padding-top: 10px">
        <el-switch
          v-model="state.weatherShow"
          @change="setStatus('weatherShow')"
        ></el-switch>
        <span class="text" style="padding-right: 20px">天气可见</span>
        <el-switch
          v-model="state.poucheShow"
          @change="setStatus('poucheShow')"
        ></el-switch>
        <span class="text">关闭剖切</span>
      </div>
    </div>
    <div class="label-cyan">
      <!--青色弹窗-->
      <div class="lb-main">
        <div class="text"></div>
        <div class="cls-img">
          <img src="@/assets/granary/images/cyan.png" />
        </div>
      </div>
    </div>
    <div class="label-white">
      <!--白色弹窗-->
      <div class="lb-main2">
        <div class="text"></div>
        <div class="cls-img">
          <img src="@/assets/granary/images/white.png" />
        </div>
      </div>
    </div>
    <div
      class="tan"
      v-show="state.panelShow"
      :style="{ left: state.left + 'px', top: state.top + 'px' }"
    >
      <div class="child">
        <div class="com c1">
          <div class="name">{{ state.currentMesh.G_name }}</div>
          <div class="ton">{{ state.currentMesh.G_class }}（吨）</div>
          <div class="temp">
            <img src="@/assets/granary/images/temp.png" />
            <span>{{ state.currentMesh.G_temperature }} ℃</span>
          </div>
        </div>
        <div class="com c2">
          <div class="cla"><img :src="state.currentMesh.iconpath" /></div>
          <div class="vls">{{ Math.floor(state.S) }}t</div>
        </div>
        <div class="com c3">
          <div class="cg">仓高—{{ state.currentMesh.G_C_height }} m</div>
          <div class="lg">粮高—{{ state.currentMesh.G_L_height }} m</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.granary {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .title {
    position: absolute;
    width: 100%;
    h4 {
      position: absolute;
      width: 100%;
      display: flex;
      top: 2px;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 2px;
      color: #00ffff;
    }
    img {
      width: 100%;
      height: 28px;
    }
  }
  .hud {
    position: absolute;
    padding: 10px 20px;
    display: flex;
    flex-direction: column;
    left: 50px;
    top: 65px;
    z-index: 5;
    line-height: 20px;
    display: flex;
    align-items: center;
    background: rgba($color: #000000, $alpha: 0.1);
    font-size: 16px;
    color: #fff;
    box-shadow: 0 0 2px #00ffff inset;
    background: linear-gradient(#00ffff, #00ffff) left top,
      linear-gradient(#00ffff, #00ffff) left top,
      linear-gradient(#00ffff, #00ffff) right bottom,
      linear-gradient(#00ffff, #00ffff) right bottom;
    background-repeat: no-repeat;
    background-size: 1px 6px, 6px 1px;
    .row {
      width: 100%;
      display: flex;
      flex-direction: row;
      .text {
        display: inline-block;
        padding-left: 5px;
      }
    }
  }
  .tan {
    position: absolute;
    color: #fff;
    font-size: 16px;
    z-index: 102;
    .child {
      background: url('@/assets/granary/images/panel.png') no-repeat;
      width: 398px;
      height: 241px;
      background-size: 100% 100%;
      padding: 30px 25px;
      .com {
        width: 100%;
        display: flex;
        flex-direction: row;
      }
      .c1 {
        height: 25%;
        padding: 10px 0px 0px 5px;
        .name {
          width: 33%;
        }
        .ton {
          width: 34%;
          text-align: center;
          padding-top: 10px;
        }
        .temp {
          width: 33%;
          img {
            width: 50px;
            top: 25px;
            position: absolute;
            right: 70px;
          }
          span {
            right: 25px;
            position: absolute;
          }
        }
      }
      .c2 {
        height: 50%;
        display: flex;
        align-items: center;
        .cla {
          width: 35%;
          text-align: right;
          padding-right: 20px;
          img {
            width: 60px;
          }
        }
        .vls {
          width: 65px;
          text-align: left;
          font-size: 60px;
          color: #00ffff;
        }
      }
      .c3 {
        height: 25%;
        justify-content: center;
        align-items: center;
        .cg {
          height: 40px;
          border-radius: 20px;
          padding: 5px 25px;
          border: 1px solid #00ffff;
          display: flex;
          align-items: center;
          margin-right: 25px;
        }
        .lg {
          display: flex;
          align-items: center;
          padding-left: 20px;
        }
      }
    }
  }
}
</style>