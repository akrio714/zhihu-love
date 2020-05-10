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
import PostPage from '../views/Post.vue'
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/search",
    name: "SearchPage",
    component: SearchPage
  },
  {
    path: "/setting",
    name: "SettingPage",
    component: SettingPage
  },
  {
    path: "/post",
    name: "PostPage",
    component: PostPage
  }
];

const router = new VueRouter({
  routes,
  scrollBehavior (to, from, savedPosition) {
    console.log('savedPosition',savedPosition)
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
});

export default router;
