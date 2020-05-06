/*
 * @Author: your name
 * @Date: 2020-05-02 08:14:25
 * @LastEditTime: 2020-05-03 07:36:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/router/index.ts
 */
import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import SearchPage from "../views/Search.vue";
import SettingPage from "../views/Setting.vue";
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "SearchPage",
    component: SearchPage
  },
  {
    path: "/setting",
    name: "SettingPage",
    component: SettingPage
  }
];

const router = new VueRouter({
  routes
});

export default router;
