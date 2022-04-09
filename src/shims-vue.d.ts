declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 解决three.js导入警告
declare module "three";
declare module "three/examples/jsm/controls/OrbitControls";
declare module "three/examples/jsm/renderers/CSS2DRenderer";
declare module "three/examples/jsm/postprocessing/EffectComposer";
declare module "three/examples/jsm/postprocessing/RenderPass";
declare module "three/examples/jsm/postprocessing/ShaderPass";
declare module "three/examples/jsm/postprocessing/OutlinePass";
declare module "three/examples/jsm/shaders/FXAAShader";
declare module "three/examples/jsm/loaders/OBJLoader";
declare module "three/examples/jsm/shaders/CopyShader";
declare module "three/examples/jsm/loaders/FBXLoader";
declare module "three/examples/js/libs/fflate.min";
