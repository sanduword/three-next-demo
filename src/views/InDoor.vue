<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { ElMessage, ElLoading } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { imageSets } from '@/data/indoor'

let pathStr = '../../src/assets/indoor/'
if (import.meta.env.MODE === 'production') {
  pathStr = import.meta.env.BASE_URL + 'assets/indoor/'
}

const state = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
  audioBool: true, // 开启语音
  rotateBool: true, // 开启旋转
  screenBool: false, // 全屏
  selectColor: '#409EFF',
  modulesData: imageSets,
  childData: imageSets[0].children,
  moduleNum: 0,
  childNum: 0,
  num: 1,
  N: imageSets[0].children[0].jpgNameArr.length,
})

// 预加载
const serLoading = () => {
  return ElLoading.service({
    lock: true,
    text: '正在加载全景模型...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.5)',
  })
}

// num翻页变化时执行
watch(
  () => state.num,
  (newVal, oldVal) => {
    const loading = serLoading()
    let url =
      pathStr +
      'styles/' +
      state.modulesData[state.moduleNum].eng +
      '/' +
      state.childData[state.childNum].eng +
      '/' +
      state.childData[state.childNum].jpgNameArr[newVal - 1]
    if (newVal <= state.N) {
      const texture = textureLoader.load(url, function () {
        loading.close()
        render()
      })
      mesh.material.map = texture
    }
  }
)

// 场景
const scene = new THREE.Scene()
const box = new THREE.SphereGeometry(25, 50, 50)
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.BackSide,
})

const mesh = new THREE.Mesh(box, material)
scene.add(mesh)

const textureLoader = new THREE.TextureLoader()
const listener = new THREE.AudioListener()
const audio = new THREE.Audio(listener)

const loading = serLoading()
const texture = textureLoader.load(
  pathStr + 'styles/chinese/restaurant/00125.jpg',
  function (obj: any) {
    var audioLoader = new THREE.AudioLoader()
    audioLoader.load(pathStr + 'music/pipa.mp3', function (AudioBuffer: any) {
      loading.close()
      audio.setBuffer(AudioBuffer)
      audio.setLoop(true)
      audio.setVolume(0.5)
      audio.autoplay = true
      audio.play()
    })
    render()
  }
)

mesh.material.map = texture
let k = state.width / state.height

// 相机
const camera = new THREE.PerspectiveCamera(
  50,
  state.width / state.height,
  1,
  1000
)
camera.zoom = 1
camera.updateProjectionMatrix()
camera.position.set(-0.8, 0.03, 0.4)
camera.lookAt(scene.position)

// 渲染
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setSize(state.width, state.height)
document.body.appendChild(renderer.domElement)

// 时钟
let clock = new THREE.Clock()
let FPS = 30
let freshTime = 1 / 30
let timeS = 0

// 实时渲染
const render = () => {
  requestAnimationFrame(render)
  let renderDelta = clock.getDelta()
  timeS = timeS + renderDelta
  if (timeS > freshTime) {
    renderer.render(scene, camera)
    if (state.rotateBool) {
      mesh.rotateY(0.002)
    }
    timeS = 0
  }
}

// 控制
const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = true

// 风格
const styleClick = (styleObject: any, index: number) => {
  const loading = serLoading()
  state.num = 1
  state.moduleNum = index
  state.childNum = 0
  state.childData = styleObject.children
  state.N = styleObject.children[0].jpgNameArr.length
  let url =
    pathStr +
    'styles/' +
    styleObject.eng +
    '/' +
    state.childData[0].eng +
    '/' +
    state.childData[0].jpgNameArr[state.num - 1]
  const texture = textureLoader.load(url, function () {
    loading.close()
    render()
  })
  mesh.material.map = texture
}

// 位置
const postionClick = (postionObject: any, index: number) => {
  const loading = serLoading()
  state.childNum = index
  state.num = 1
  state.N = postionObject.jpgNameArr.length
  let url =
    pathStr +
    'styles/' +
    state.modulesData[state.moduleNum].eng +
    '/' +
    postionObject.eng +
    '/' +
    postionObject.jpgNameArr[state.num - 1]
  const texture = textureLoader.load(url, function () {
    loading.close()
    render()
  })
  mesh.material.map = texture
}

// 上一张
const upClick = () => {
  if (state.num > 1) {
    state.num -= 1
  } else {
    state.num = 1
  }
}

// 下一张
const nextClick = () => {
  if (state.num < state.N) {
    state.num += 1
  } else {
    state.num = state.N
  }
}

// 语音
const audioClick = () => {
  state.audioBool = !state.audioBool
  if (state.audioBool) {
    audio.play()
  } else {
    audio.pause()
  }
}

// 全屏
const screenClick = () => {
  state.screenBool = !state.screenBool
  if (state.screenBool) {
    requestFullScreen()
  } else {
    exitFullscreen()
  }
}

const onResizeFun = () => {
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

window.onresize = onResizeFun
const requestFullScreen = () => {
  const de = document.documentElement
  if (de.requestFullscreen) {
    de.requestFullscreen()
  }
}

const exitFullscreen = () => {
  const de = document
  if (de.exitFullscreen) {
    de.exitFullscreen()
  }
}

// 暂停自动旋转
const rotateClick = () => {
  state.rotateBool = !state.rotateBool
}

// 操作说明
const tipClick = () => {
  ElMessage({
    showClose: true,
    message: '按住左键不放上下左右拖动，可以旋转整个场景。',
    type: 'warning',
  })
}
</script>

<template>
  <div class="in-door">
    <div class="total">
      <span>{{ state.num }}/{{ state.N }}</span>
    </div>
    <div class="tool">
      <el-button type="info" circle @click="audioClick()"
        ><i
          ><img
            :src="
              state.audioBool
                ? pathStr + 'images/auto_play.png'
                : pathStr + 'images/audo_close.png'
            "
            width="20"
            height="20" /></i></el-button
      ><el-button type="info" circle @click="screenClick()"
        ><i
          ><img
            :src="
              state.screenBool
                ? pathStr + 'images/exitfull.png'
                : pathStr + 'images/full.png'
            "
            width="18"
            height="18" /></i></el-button
      ><el-button type="info" circle @click="rotateClick()"
        ><i
          ><img
            :src="
              state.rotateBool
                ? pathStr + 'images/rotate.png'
                : pathStr + 'images/stop_rotate.png'
            "
            width="20"
            height="20" /></i></el-button
      ><el-button type="info" circle
        ><i
          ><img
            src="@/assets/indoor/images/tip.png"
            width="22"
            height="22"
            @click="tipClick()" /></i
      ></el-button>
    </div>
    <div class="page-left">
      <el-button
        type="info"
        icon="el-icon-arrow-left"
        circle
        @click="upClick()"
      ></el-button>
    </div>
    <div class="page-right">
      <el-button
        type="info"
        icon="el-icon-arrow-right"
        circle
        @click="nextClick"
      ></el-button>
    </div>
    <div class="tab-class">
      <div class="modules">
        <div class="single">
          <span class="text">风格：</span
          ><span
            class="tab"
            v-for="(item, index) in state.modulesData"
            :style="{
              backgroundColor:
                state.moduleNum === index ? state.selectColor : '',
            }"
            :key="index"
            @click="styleClick(item, index)"
            >{{ item.name }}</span
          >
        </div>
        <div class="single">
          <span class="text">位置：</span
          ><span
            class="tab"
            v-for="(item, index) in state.childData"
            :key="index"
            v-show="item.jpgNameArr.length > 0"
            :style="{
              backgroundColor:
                state.childNum === index ? state.selectColor : '',
            }"
            @click="postionClick(item, index)"
            >{{ item.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@charset 'UTF-8';
.in-door {
  width: 100%;
  height: 100%;
  .el-button--info {
    font-size: 25px !important;
    background: rgba($color: #000000, $alpha: 0.5);
    border-width: 0px;
    width: 50px;
    height: 50px;
  }
  .total {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    span {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: rgb(0, 255, 255);
    }
  }
  .tool {
    position: absolute;
    right: 20px;
    top: 20px;
    img {
      margin-top: -5px;
    }
  }
  .page-left {
    position: absolute;
    top: 48%;
    left: 5px;
  }
  .page-right {
    position: absolute;
    top: 48%;
    right: 5px;
  }
  .tab-class {
    position: absolute;
    bottom: 0px;
    width: 100%;
    display: flex;
    justify-content: center;
    .modules {
      position: relative;
      background: rgba($color: #000000, $alpha: 0.5);
      padding: 10px;
      width: 500px;
      height: 100%;
      color: #fff;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      .single {
        font-size: 16px;
        padding: 5px;
        .text {
          font-weight: bold;
          cursor: default;
        }
        .tab {
          cursor: pointer;
        }
        span {
          padding: 5px 10px;
          display: inline-block;
        }
      }
    }
  }
}
</style>