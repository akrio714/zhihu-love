<template>
  <a-spin :spinning="showLoading" :delay="500">
    <a-layout id="components-layout-demo-custom-trigger">
      <a-layout-sider
        v-if="!this.isGuide"
        v-model="collapsed"
        :trigger="null"
        collapsible
      >
        <div class="logo" />
        <a-menu
          theme="dark"
          mode="inline"
          v-model="defaultPage"
          @select="selectItem"
        >
          <a-menu-item key="SearchPage">
            <a-icon type="search" />
            <span>搜索</span>
          </a-menu-item>
          <!-- <a-menu-item key="StarPage">
          <a-icon type="heart" />
          <span>关注</span>
        </a-menu-item> -->
          <a-menu-item key="PostPage">
            <a-icon type="cloud-server" />
            <span>帖子</span>
          </a-menu-item>
          <a-menu-item key="SettingPage">
            <a-icon type="form" />
            <span>设置</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header class="layout-header-container">
          <a-icon
            v-if="!this.isGuide"
            class="trigger"
            :type="collapsed ? 'menu-unfold' : 'menu-fold'"
            @click="() => (collapsed = !collapsed)"
          />
          <a-button type="link" @click="showHelpPage" class="help-link"
            >帮助</a-button
          >
        </a-layout-header>
        <a-layout-content
          id="scroller"
          :style="{
            margin: '24px 16px',
            padding: '24px',
            background: '#fff',
            height: 'calc(100vh - 112px)',
            overflow: 'scroll',
          }"
        >
          <keep-alive>
            <router-view />
          </keep-alive>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-spin>
</template>
<script lang="ts">
import Vue from "vue";
import { getSettingForm } from "./services/SettingService";
import { shell } from "electron";
export default Vue.extend({
  name: "LayoutPage",
  data() {
    return {
      showLoading: false,
      collapsed: false,
      isGuide: false,
      defaultPage: ["SearchPage"], // 默认选中项
    };
  },
  methods: {
    // 显示帮助页面
    showHelpPage() {
      shell.openExternal(`https://github.com/akrio714/zhihu-love`);
    },
    selectItem(item: { key: string }) {
      this.$router.push({ name: item.key });
    },
  },
  async created() {
    const settingForm = getSettingForm();
    // 第一次进入，直接锁死setting页面
    if (!settingForm || settingForm.searchList.length === 0) {
      this.$router.push({ name: "GuidePage" });
      this.isGuide = true;
    } else {
      const defaultPage = "SearchPage";
      this.defaultPage = [defaultPage];
      // 对setting信息进行初始化
      this.$router.push({ name: defaultPage });
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore：无法监听到$bus
    this.$bus.$on("initSuccess", (success: boolean) => {
      this.isGuide = !success;
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore：无法监听到$bus
    this.$bus.$on("showLoading", (show: boolean) => {
      this.showLoading = show;
    });
  },
});
</script>
<style lang="less">
.layout-header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff !important;
  padding: 0 !important;
  .help-link {
    position: relative;
    right: 5px;
  }
}
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
