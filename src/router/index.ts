import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

export const Layout = () => import("@/layouts/index.vue");

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    meta: { hidden: true },
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "Dashboard",
        meta: {
          title: "仪表盘",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "order/list",
        component: () => import("@/views/orders/index.vue"),
        name: "Orders",
        meta: {
          title: "订单管理",
          icon: "list",
          hidden: true,
          keepAlive: true,
        },
      },
      {
        path: "orders",
        redirect: "order/list",
        meta: { hidden: true },
      },
      {
        path: "riders",
        component: () => import("@/views/riders/index.vue"),
        name: "Riders",
        meta: {
          title: "骑手管理",
          icon: "user",
          hidden: true,
          keepAlive: true,
        },
      },
      {
        path: "service/category",
        component: () => import("@/views/service/category/index.vue"),
        name: "ServiceCategory",
        meta: {
          title: "服务分类",
          icon: "list",
          hidden: true,
          keepAlive: true,
        },
      },
      {
        path: "service/banner",
        component: () => import("@/views/service/banner/index.vue"),
        name: "ServiceBanner",
        meta: {
          title: "轮播图管理",
          icon: "list",
          hidden: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true },
      },
      {
        path: "dispatch/assign-rider",
        name: "AssignRider",
        component: () => import("@/views/dispatch/assign-rider/index.vue"),
        meta: { title: "指派骑手", icon: "user", hidden: true },
      },
      {
        path: "my-notice",
        name: "MyNotice",
        component: () => import("@/views/profile/notice/index.vue"),
        meta: { title: "我的通知", icon: "user", hidden: true },
      },
      {
        path: "/detail/:id(\\d+)",
        name: "DemoDetail",
        component: () => import("@/views/demo/detail.vue"),
        meta: { title: "详情页缓存", icon: "user", hidden: true, keepAlive: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router);
}

export default router;
