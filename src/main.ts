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
import { getSettingForm ,SETTING_FORM, SettingForm} from './services/SettingService';
import {setItem} from './utils/LocalHelper'
import EventBus from 'vue-bus-ts';

Vue.use(VueAwesomeSwiper /* { default options with global component } */)
Vue.use(Antd)
Vue.config.productionTip = false
Vue.use(EventBus);
var bus = new EventBus.Bus();
router.beforeEach((to: Route, from: Route, next: () => void) => {
  const $content = document.querySelector('#scroller')
  const scrollTop = $content ? $content.scrollTop : 0
  from.meta.scrollTop = scrollTop
  next()
})
document.title = '知乎过滤器';
// 判断setting form 中是否有值，如果没有则直接给定一个默认值
const settingForm = getSettingForm()
// 说明是第一次进入，默认直接给个初值
if(!settingForm){
  setItem(SETTING_FORM,new SettingForm())
}
export default new Vue({
  bus,
  router,
  render: h => h(App)
}).$mount('#app')
