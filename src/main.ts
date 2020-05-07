/*
 * @Author: your name
 * @Date: 2020-05-02 08:14:25
 * @LastEditTime: 2020-05-07 06:25:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/main.ts
 */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {Route} from 'vue-router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
Vue.use(VueAwesomeSwiper /* { default options with global component } */)
Vue.use(Antd)
Vue.config.productionTip = false
Vue.prototype.$bus = Vue.prototype.$bus || new Vue() // 注册一个全局的总线组件
router.beforeEach((to: Route, from: Route, next: () => void) => {
  const $content = document.querySelector('#scroller')
  const scrollTop = $content ? $content.scrollTop : 0
  from.meta.scrollTop = scrollTop
  next()
})
document.title = '知乎过滤器';
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
