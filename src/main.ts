import { createApp } from "vue";
import ElementPlus from "element-plus";
import { Expand } from "@element-plus/icons";
import router from "@/router";
import App from "@/App.vue";
import "element-plus/theme-chalk/src/index.scss";
import "@/styles/common.scss";
import "@/styles/element.scss";

// 因为使用了按需导入组件：unplugin-vue-components，所以这里不需要再导入element-plus
// 但是可以配置element-plus的全局配置
const app = createApp(App);
app.config.globalProperties.$ELEMENT = {
  size: "small",
  zIndex: 3000,
};

app.use(router);
app.use(ElementPlus);
app.component("expand", Expand);

app.mount("#app");
