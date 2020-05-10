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
        <a-layout-header style="background: #fff; padding: 0">
          <a-icon
            v-if="!this.isGuide"
            class="trigger"
            :type="collapsed ? 'menu-unfold' : 'menu-fold'"
            @click="() => (collapsed = !collapsed)"
          />
          关于作者
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
    selectItem(item: { key: string }) {
      this.$router.push({ name: item.key });
    },
  },
  async created() {
    const settingForm = getSettingForm();
    // 第一次进入，直接锁死setting页面
    if (!settingForm || !settingForm.searchId) {
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
    // 判断用户是否存在设置了自动拉取逻辑,
    // await updatePostList();
  },
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
