/*
 * @Author: your name
 * @Date: 2020-05-02 08:14:25
 * @LastEditTime: 2020-05-07 06:25:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/main.ts
 */
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
Vue.use(VueAwesomeSwiper, /* { default options with global component } */)
Vue.use(Antd);
Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
