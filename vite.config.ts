import path from "path";
import px2rem from "postcss-px2rem";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
// import Icons from "unplugin-icons/vite";
// import IconsResolver from "unplugin-icons/resolver";

// https://vitejs.dev/config/
// https://cn.vitejs.dev/config/#config-intellisense 配置文件说明

// 基于volar开发模式下的element-plus配置，可以按需要导入
// 参考地址https://cnpmjs.org/package/unplugin-vue-components
// const element_plugin = Components({
//   deep: true,
//   extensions: ["vue", "md", "svg"],
//   directoryAsNamespace: true,
//   dts: true,
//   globalNamespaces: ["global"],
//   importPathTransform: (path) =>
//     path.endsWith(".svg") ? `${path}?component` : undefined,
//   resolvers: [
//     ElementPlusResolver({
//       importStyle: true,
//     }),
//     IconsResolver({
//       componentPrefix: "i",
//     }),
//   ],
// });

// 配置页面基准大小
const postcss = px2rem({
  // 基准大小 baseSize，需要和rem.ts中相同
  remUnit: 16,
});

// 公共配置
const commonConfig = {
  publicDir: "public",
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  css: {
    // lib-flexible，postcss-px2rem,针对px自动转换成rem
    postcss: {
      plugins: [postcss],
    },
    preprocessorOptions: {
      scss: {
        //additionalData: `@use "~/styles/element-index.scss" as *;`,
      },
    },
  },
};

// 开发环境配置
const devConfig = {
  plugins: [vue() /*element_plugin, Icons()*/],
  server: {
    host: "0.0.0.0", // 指定服务器应该监听哪个 IP 地址。 如果将此设置为 0.0.0.0 将监听所有地址，包括局域网和公网地址
    port: 3001,
    open: true, // 是否自动在浏览器打开
    cors: true,
  },
};

// 生产环境配置
const proConfig = {
  plugins: [vue() /*element_plugin, Icons()*/],
  base: "/", // 如果有别名，例如/live-ai
};

export default defineConfig(({ command, mode }) => {
  if (command === "serve") {
    return Object.assign(devConfig, commonConfig);
  } else {
    return Object.assign(proConfig, commonConfig);
  }
});
