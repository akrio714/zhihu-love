<!--
 * @Author: your name
 * @Date: 2020-05-02 08:14:25
 * @LastEditTime: 2020-05-06 19:40:11
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/App.vue
 -->
<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider v-model="collapsed" :trigger="null" collapsible>
      <div class="logo" />
      <a-menu
        theme="dark"
        mode="inline"
        v-model="defaultPage"
        @select="selectItem"
      >
        <a-menu-item :disabled="disabled" key="SearchPage">
          <a-icon type="search" />
          <span>搜索</span>
        </a-menu-item>
        <a-menu-item :disabled="disabled" key="StarPage">
          <a-icon type="heart" />
          <span>关注</span>
        </a-menu-item>
        <a-menu-item key="SettingPage">
          <a-icon type="form" />
          <span>设置</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon
          class="trigger"
          :type="collapsed ? 'menu-unfold' : 'menu-fold'"
          @click="() => (collapsed = !collapsed)"
        />
      </a-layout-header>
      <a-spin :spinning="spinning" :delay="500">
        <a-layout-content
          id="scroller"
          :style="{
            margin: '24px 16px',
            padding: '24px',
            background: '#fff',
            minHeight: '280px',
            overflow: 'scroll'
          }"
        >
          <keep-alive>
            <router-view />
          </keep-alive>
        </a-layout-content>
      </a-spin>
    </a-layout>
  </a-layout>
</template>
<script lang="ts">
import Vue from "vue";
import { getSettingForm } from "./services/SettingService";
export default Vue.extend({
  name: "LayoutPage",
  data() {
    return {
      spinning: true,
      collapsed: false,
      disabled: false,
      defaultPage: ["SearchPage"] // 默认选中项
    };
  },
  methods: {
    selectItem(item: any) {
      console.log(this);
      this.$router.push({ name: item.key });
    }
  },
  async created() {
    let defaultPage = "SearchPage";
    const settingForm = getSettingForm();
    // 第一次进入，直接锁死setting页面
    if (!settingForm || !settingForm.searchId) {
      defaultPage = "SettingPage";
      this.disabled = true;
    }
    this.defaultPage = [defaultPage];
    // 对setting信息进行初始化
    this.$router.push({ name: defaultPage });
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore：无法监听到$bus
    this.$bus.$on("changeMenuLock", disabled => {
      this.disabled = disabled;
    });
    // 判断用户是否存在设置了自动拉取逻辑,
    // await updatePostList();
  }
});
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  .trigger {
    font-size: 18px;
    line-height: 64px;
    padding: 0 24px;
    cursor: pointer;
    transition: color 0.3s;
    &:hover {
      color: #1890ff;
    }
  }
  .logo {
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    margin: 16px;
  }
}
#components-layout-demo-custom-trigger {
  height: 100vh;
}
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
</style>
