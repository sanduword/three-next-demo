import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
//import InDoor from "../views/InDoor.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/granary",
  },
  {
    path: "/indoor", // 室内设计
    name: "indoor",
    component: () => import("@/views/InDoor.vue"),
  },
  {
    path: "/granary", // 粮仓
    name: "granary",
    component: () => import("@/views/Granary.vue"),
  },
  {
    path: "/turbine", // 涡轮
    name: "turbine",
    component: () => import("@/views/Turbine.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
