<script lang="ts" setup>
import { reactive, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { Zlib } from 'three/examples/js/libs/fflate.min'
import { turbineModel } from '@/data/turbine'
import { ElMessageBox, ElLoading } from 'element-plus'

let pathStr = '../../src/assets/turbine/'
if (import.meta.env.MODE === 'production') {
  pathStr = import.meta.env.BASE_URL + 'assets/turbine/'
}

let curModel: any
const state = reactive({
  width: window.innerWidth,
  height: window.innerHeight,
  length: 0,
  progressStatus: false,
  percentage: 0,
  downTitle: '',
  downType: '',
  downDescription: '',
  infoStatus: false,
  curLeft: 0,
  curTop: 0,
  num: 0,
  curModelData: {
    name: null,
    num: null,
    material: null,
    production: null,
    weight: null,
    introduction: null,
  },
})

// num翻页变化时执行
watch(
  () => state.num,
  (newVal, oldVal) => {
    viewGroup.children[0] = modelArr[newVal]
    curModel = modelArr[newVal]
    state.curModelData = curModel.data
    scene.updateMatrixWorld(true)

    updateWorld()
    render()
  }
)

// 预加载
const setLoading = () => {
  return ElLoading.service({
    lock: true,
    text: '正在加载涡轮模型...',
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.5)',
  })
}

// 场景
const scene = new THREE.Scene()
const viewGroup = new THREE.Group()
scene.add(viewGroup)
//const textureLoader = new THREE.TextureLoader()
//const backTexture = textureLoader.load(pathStr + 'modules/map/back.jpg')
//scene.background = backTexture
// 相机
let k = state.width / state.height
let s = 80
const camera = new THREE.OrthographicCamera(-s * k, s * k, s, -s, 1, 1000)
camera.position.set(162, 164, 341)
state.length = camera.position.length()
camera.lookAt(scene.position)

// 灯光
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
directionalLight.position.set(100, 350, 200)
scene.add(directionalLight)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.7)
directionalLight2.position.set(-300, -100, -400)
scene.add(directionalLight2)
const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight3.position.set(10, 300, 30)
scene.add(directionalLight3)

const point = new THREE.PointLight(0xffffff, 0.9)
point.position.set(400, 150, 300)
scene.add(point)
const ambient = new THREE.AmbientLight(0xffffff, 0.9)
scene.add(ambient)

// 渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})
renderer.setSize(state.width, state.height)
renderer.setClearColor(0x222222, 1)
document.body.appendChild(renderer.domElement)

const render = () => {
  renderer.render(scene, camera)
}

// 更新坐标系统
const updateWorld = () => {
  const worldPosition = new THREE.Vector3()
  curModel.getWorldPosition(worldPosition)

  const standardVector = worldPosition.project(camera)
  const a = state.width / 2
  const b = state.height / 2
  state.curLeft = Math.round(standardVector.x * a + a)
  state.curTop = Math.round(-standardVector.y * b + b) - 250
}

// 手势控制
const controls = new OrbitControls(camera, renderer.domElement)
controls.addEventListener('change', function () {
  updateWorld()
  render()
})

// 环境贴图
const fileData = turbineModel
let modelArr = new Array()
const loader = new FBXLoader()
const textureCube = new THREE.CubeTextureLoader()
  .setPath(pathStr + 'models/map/')
  .load(
    ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'],
    function (texture: any) {
      render()
    }
  )

// 经度条
const onProgress = (xhr: any) => {
  state.progressStatus = true
  state.percentage = Math.floor((xhr.loaded / xhr.total) * 100)
}

// 下载模型
const loadFile = (fileName: String, filePath: String, informationObj: any) => {
  state.downTitle = '下载文件'
  state.downType = 'warning'
  state.downDescription = `正在下载：${informationObj.fileName} fbx模型文件`
  return new Promise(function (resolve, reject) {
    loader.load(
      filePath,
      function (data: any) {
        state.downTitle = '下载文件'
        state.downType = 'success'
        state.downDescription = `下载${informationObj.fileName} fbx模型文件已完成`
        setTimeout(() => {
          state.progressStatus = false
          load(data, informationObj)
          resolve(data)
        }, 500)
      },
      onProgress,
      function (error: any) {
        reject(error)
      }
    )
  })
}

const loading = setLoading()
// 串行异步请求
const asyLoadObj = async () => {
  if (fileData == null || fileData.length === 0) return

  for (let i = 0; i < fileData.length; i++) {
    //state.percentage = 0
    const obj = await loadFile(
      fileData[i].fileName,
      pathStr + 'models/' + fileData[i].fileName + '.fbx',
      fileData[i]
    )

    if (i === 0) {
      loading.close()
    }
  }
}

// 模型下载之后的展示处理
const load = (modelObj: any, informationObj: any) => {
  const obj = modelObj.children[0]
  obj.data = informationObj.data
  modelArr.push(obj)

  obj.rotateX(Math.PI / 2)
  obj.traverse(function (object: any) {
    if (object.type === 'Mesh') {
      let color = null
      if (!object.material.color) {
        color = new THREE.Color(1, 1, 1)
      } else {
        color = object.material.color
      }

      object.material = new THREE.MeshPhysicalMaterial({
        color: color,
        metalness: 1.0,
        roughness: 0.6,
        envMap: textureCube,
      })
    }
  })

  const box3 = new THREE.Box3()
  box3.expandByObject(obj)
  const v3 = new THREE.Vector3()
  box3.getSize(v3)

  const num = () => {
    let max = null
    if (v3.x > v3.y) {
      max = v3.x
    } else {
      max = v3.y
    }

    if (max > v3.z) {
    } else {
      max = v3.z
    }

    return max
  }

  let S = 100 / num()
  obj.scale.set(S, S, S)
  const newBox3 = new THREE.Box3()
  newBox3.expandByObject(obj)
  const center = new THREE.Vector3()
  newBox3.getCenter(center)

  obj.position.x = obj.position.x - center.x
  obj.position.y = obj.position.y - center.y
  obj.position.z = obj.position.z - center.z

  if (obj.data.name === '离心叶轮') {
    viewGroup.add(modelArr[0])
    render()
    render()
    scene.updateMatrixWorld(true)

    state.infoStatus = true
    curModel = modelArr[0]
    updateWorld()
    Object.assign(state.curModelData, curModel.data)
  }
}

// 事件
const changeInfo = (type: String) => {
  switch (type) {
    case 'front':
      // 正视图
      camera.position.set(0, 0, state.length)
      camera.lookAt(scene.position)
      render()
      break
    case 'vertical':
      // 俯视图
      camera.position.set(0, state.length, 0)
      camera.lookAt(scene.position)
      render()
      break
    case 'side':
      // 侧视图
      camera.position.set(-state.length, 0, 0)
      camera.lookAt(scene.position)
      render()
      break
    case 'axis':
      // 轴视图
      const vec3 = new THREE.Vector3(1, 1, 1).normalize()
      camera.position.set(
        vec3.x * state.length,
        vec3.y * state.length,
        vec3.z * state.length
      )
      camera.lookAt(scene.position)
      render()
      break
  }
}

const changePage = (type: String) => {
  switch (type) {
    case 'up':
      // 上一页
      if (state.num > 0) {
        state.num -= 1
      }
      break
    case 'next':
      // 下一页
      if (state.num < modelArr.length - 1) {
        state.num += 1
      }
      break
  }
}

const openHelp = () => {
  const context = document.querySelector('.context')?.innerHTML
  ElMessageBox.alert(context, '操作说明', {
    dangerouslyUseHTMLString: true,
  })
}

window.onresize = function () {
  state.width = window.innerWidth
  state.height = window.innerHeight
  renderer.setSize(state.width, state.height)
  k = state.width / state.height
  camera.left = -s * k
  camera.right = s * k
  camera.top = s
  camera.bottom = -s
  camera.updateProjectionMatrix()
  updateWorld()
  render()
}

//初始化
;(function () {
  asyLoadObj()
  render()
})()
</script>

<template>
  <div class="turbine">
    <div class="process" v-show="state.progressStatus">
      <el-progress
        :text-inside="true"
        :stroke-width="20"
        :percentage="state.percentage"
      />
    </div>
    <div class="down-tip" v-show="state.progressStatus">
      <el-alert
        :title="state.downTitle"
        :type="state.downType"
        :description="state.downDescription"
        show-icon
      >
      </el-alert>
    </div>
    <div class="type">
      <table border="1">
        <tr>
          <th rowspan="2" colspan="2" class="name">
            {{ state.curModelData.name }}
          </th>
          <th class="num">编号</th>
          <th className="num2">
            {{ state.curModelData.num }}
          </th>
        </tr>
        <tr>
          <th>材质</th>
          <th>{{ state.curModelData.material }}</th>
        </tr>
        <tr>
          <td class="production">生产</td>
          <td class="production2">{{ state.curModelData.production }}</td>
          <th>重量</th>
          <th>{{ state.curModelData.weight }}g</th>
        </tr>
      </table>
    </div>
    <div class="ui">
      <el-button type="info" circle title="正视图" @click="changeInfo('front')">
        <i><img src="@/assets/turbine/images/front-view.png" /></i>
      </el-button>
      <el-button
        type="info"
        circle
        title="俯视图"
        @click="changeInfo('vertical')"
      >
        <i><img src="@/assets/turbine/images/vertical-view.png" /></i>
      </el-button>
      <el-button type="info" circle title="侧视图" @click="changeInfo('side')">
        <i><img src="@/assets/turbine/images/side-view.png" /></i>
      </el-button>
      <el-button type="info" circle title="轴视图" @click="changeInfo('axis')">
        <i><img src="@/assets/turbine/images/axis-view.png" /></i>
      </el-button>
    </div>
    <div class="info" v-show="state.infoStatus">
      <img src="@/assets/turbine/images/info.png" />
      <div class="content">
        <span>{{ state.curModelData.introduction }}</span>
      </div>
    </div>
    <div
      class="line"
      v-if="state.infoStatus"
      :style="{ left: state.curLeft + 'px', top: state.curTop + 'px' }"
    >
      <img src="@/assets/turbine/images/line.png" />
    </div>
    <div
      class="line"
      v-if="state.infoStatus"
      :style="{
        left: state.curLeft + 320 + 'px',
        top: state.curTop - 35 + 'px',
      }"
    >
      <span>{{ state.curModelData.name }}</span>
    </div>
    <div class="page-left">
      <el-button
        type="info"
        icon="el-icon-arrow-left"
        circle
        @click="changePage('up')"
      ></el-button>
    </div>
    <div class="page-right">
      <el-button
        type="info"
        icon="el-icon-arrow-right"
        circle
        @click="changePage('next')"
      ></el-button>
    </div>
    <div class="help">
      <el-button type="info" circle @click="openHelp()">
        <i>
          <img src="@/assets/turbine/images/help.png" width="22" height="22" />
        </i>
      </el-button>
    </div>
    <div class="context">
      1.旋转：按住左键不放上下左右拖动，可以旋转整个场景
      <br /><br />
      2.缩放：滚动鼠标中键可以缩放模型
      <br /><br />
      3.交互：通过UI按钮可以和对三维模型进行交互操作，预览模型相关信息
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/styles/var.scss';
.turbine {
  .el-button--info {
    font-size: 25px !important;
    background: rgba($color: $web-back-color, $alpha: 0.8);
    border-width: 0px;
    width: 50px;
    height: 50px;
  }
  .process {
    width: 100%;
    display: flex;
    justify-content: center;
    position: absolute;
    top: 10px;
    .el-progress {
      width: calc(100% / 4.8);
    }
  }
  .down-tip {
    position: absolute;
    left: 20px;
    bottom: 5px;
  }
  .type {
    position: absolute;
    bottom: 0px;
    right: 0px;
    table {
      position: relative;
      bottom: 0px;
      right: 0px;
      color: #ffffff;
      background: rgba($color: $web-back-color, $alpha: 0.8);
      z-index: 1;
      border-color: #333333;
      border-collapse: collapse;
      th {
        padding: 10px 16px;
        font-size: 14px;
        font-family: '微软雅黑';
        font-weight: 300;
      }
      .name {
        font-size: 20px;
      }
      .num {
        width: 64px;
      }
      .num2 {
        width: 130px;
      }
      .production {
        width: 64px;
        font-weight: 250;
        text-align: center;
      }
      .production2 {
        width: 100px;
        font-weight: 250;
        text-align: center;
      }
    }
  }
  .info {
    position: absolute;
    left: 50px;
    top: 40px;
    img {
      width: 360px;
    }
    .content {
      position: absolute;
      width: 92%;
      height: 86%;
      top: 15px;
      left: 15px;
      text-indent: 20px;
      font-size: 16px;
      color: #00c4d0;
      padding: 18px;
      background: rgba($color: #000000, $alpha: 0.3);
      z-index: 102;
    }
  }

  .line {
    position: absolute;
    span {
      display: inline-block;
      position: relative;
      color: #00c4d0;
      font-size: 18px;
    }
  }
  .help {
    position: absolute;
    right: 20px;
    top: 20px;
  }
  .ui {
    position: absolute;
    bottom: 5px;
    display: flex;
    width: 100%;
    justify-content: center;
    img {
      width: 20px;
      height: 20px;
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

  .context {
    display: none;
  }
}
</style>>