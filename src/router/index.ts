import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import SearchPage from "../views/Search.vue";
import SettingPage from "../views/Setting.vue";
import PostPage from "../views/Post.vue";
import GuidePage from "../views/Guide.vue";
Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/search",
    name: "SearchPage",
    component: SearchPage,
  },
  {
    path: "/setting",
    name: "SettingPage",
    component: SettingPage,
  },
  {
    path: "/post",
    name: "PostPage",
    component: PostPage,
  },
  {
    path: "/guide",
    name: "GuidePage",
    component: GuidePage,
  },
];

const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

export default router;
