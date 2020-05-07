<!--
 * @Author: your name
 * @Date: 2020-05-02 08:14:25
 * @LastEditTime: 2020-05-06 19:59:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/views/Home.vue
 -->
<template>
  <div>
    <div @click="openFilterModal" class="filter-icon-container">
      <a-icon type="setting" class="filter-icon" />
    </div>
    <a-list
      ref="list"
      item-layout="vertical"
      size="large"
      :pagination="pagination"
      :data-source="list"
    >
      <a-list-item slot="renderItem" key="item.id" slot-scope="item">
        <span slot="actions">
          <a-icon type="like-o" style="margin-right: 8px" />
          {{ item.voteupCount }}
        </span>
        <span slot="actions">
          <a-icon type="message" style="margin-right: 8px" />
          {{ item.commentCount }}
        </span>
        <span slot="actions">
          {{ item.updatedTime }}
        </span>
        <swiper
          v-if="item.imgList.length"
          slot="extra"
          class="img-container"
          ref="mySwiper"
          :options="swiperOptions"
        >
          <swiper-slide v-for="img in item.imgList" :key="img">
            <div
              class="item-img"
              :style="{ 'background-image': `url(${img})` }"
            ></div>
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
        <a-list-item-meta :description="item.authorHeadline">
          <div slot="title">
            {{ item.authorName }}
            <a-tag
              class="post-gender-icon"
              v-if="item.authorGender === 0"
              color="pink"
              >女</a-tag
            >
            <a-tag
              class="post-gender-icon"
              v-if="item.authorGender === 1"
              color="#108ee9"
              >男</a-tag
            >
            <a-tag class="post-gender-icon" v-if="item.authorGender === 2"
              >性别未知</a-tag
            >
          </div>
          <a-avatar slot="avatar" :src="item.authorImg" />
        </a-list-item-meta>
        {{ item.excerpt
        }}<span @click="openBower(item)" class="post-all-click"
          >阅读原文 >></span
        >
      </a-list-item>
    </a-list>
    <a-drawer
      title="筛选条件"
      placement="right"
      :closable="true"
      width="400"
      :visible="showFilterModal"
      @close="closeFilterModal"
    >
      <a-form-model
        :model="fliterForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item
          label="关键词"
          extra="以上条件为并列关系，即所有条件均符合才算满足"
        >
          <a-select
            mode="tags"
            style="width: 100%"
            :token-separators="[',']"
            v-model="fliterForm.keywords"
          >
            <a-select-option
              v-for="keyword in recommendKeywords"
              :key="keyword"
            >
              {{ keyword }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item label="性别" extra="智能计算，有可能未必准确">
          <a-radio-group v-model="fliterForm.gender">
            <a-radio :value="0">
              女
            </a-radio>
            <a-radio :value="1">
              男
            </a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 14, offset: 2 }">
          <a-button type="primary" @click="searchClick">
            查询
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-drawer>
  </div>
</template>

<script>
// @ is an alias to /src
import { getPostList, getSettingForm } from "../services/zhihu";
import { shell } from "electron";
export default {
  name: "AttentionPage",
  components: {},
  data() {
    return {
      showFilterModal: false,
      list: [],
      index: 1,
      fliterForm: {
        keywords: [],
        gender: 1
      },
      settingUpdateTime: 0,
      labelCol: { span: 5 },
      wrapperCol: { span: 18 },
      recommendKeywords: ["天津", "双子座"],
      swiperOptions: {
        mousewheel: true,
        direction: "vertical",
        spaceBetween: 30,
        pagination: {
          el: ".swiper-pagination",
          clickable: true
        }
        // Some Swiper option/callback...
      },
      pagination: {
        current: 1,
        onChange: () => {
          // 回到顶部
          document.getElementById("scroller").scrollTop = 0;
        },
        pageSize: 10
      }
    };
  },
  async activated() {
    // 判断是否发生数据改变
    const settingForm = await getSettingForm();
    // 如果setting都不存在那么也不用请求数据了，说明是第一次进入
    if (!settingForm) {
      return;
    }
    // 判断搜索条件是否发生改变
    const changeSettingForm = settingForm.updated !== this.settingUpdateTime;
    if (changeSettingForm) {
      await this.reload();
    } else {
      const scrollTop = this.$route.meta.scrollTop;
      const $content = document.querySelector("#scroller");
      if (scrollTop && $content) {
        $content.scrollTop = scrollTop;
      }
    }
    this.settingUpdateTime = settingForm.updated;
  },
  methods: {
    /**
     * 打开浏览器阅读原文
     */
    async openBower(item) {
      shell.openExternal(item.url);
    },
    async searchClick() {
      await this.reload();
    },
    async reload() {
      try {
        this.list = await getPostList(this.fliterForm);
        this.pagination.current = 1;
        this.closeFilterModal();
      } catch (e) {
        console.error(e);
      }
    },
    /**
     * 显示过滤弹窗
     */
    openFilterModal() {
      this.showFilterModal = true;
    },
    /**
     * 隐藏过滤弹窗
     */
    closeFilterModal() {
      this.showFilterModal = false;
    }
  }
};
</script>
<style lang="less" scoped>
@imgWidth: 300px;
.back-top-inner {
  bottom: 100px;
  z-index: 999;
}
.filter-icon-container {
  right: 30px;
  bottom: 100px;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  background: #1890ff;
  color: white;
  border-radius: 50%;
  z-index: 9;
  transform: rotate(0deg);
  transition: transform 1s;
  &:hover {
    transition-timing-function: ease;
    transform: rotate(130deg);
  }
  .filter-icon {
    font-size: 20px;
  }
}
.img-container {
  width: @imgWidth;
  height: @imgWidth;
  background: rgba(128, 128, 128, 0.453);
  .item-img {
    width: @imgWidth;
    height: @imgWidth;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
}
.post-gender-icon {
  font-size: 13px;
  margin-left: 5px;
  position: relative;
  bottom: 1px;
}
.post-all-click {
  margin-left: 10px;
  cursor: pointer;
  color: #178af5;
  &:hover {
    opacity: 0.7;
  }
}
</style>
