<template>
  <div>
    <a-table :data-source="list" :row-key="record => record.id">
      <a-table-column title="key" data-index="id" />
      <a-table-column title="问题" data-index="question">
        <template slot-scope="question, row">
          <a-tooltip :title="`点击后跳转到${row.url}`">
            <a href="#" @click="openBower(row.url)">{{ question }}</a>
          </a-tooltip>
        </template>
      </a-table-column>
      <a-table-column title="回答数量" data-index="answerCount">
        <template slot-scope="answerCount">
          <a-statistic
            :valueStyle="{ 'font-size': '14px' }"
            class="answer-count"
            :value="answerCount"
          ></a-statistic>
        </template>
        <a-statistic></a-statistic>
      </a-table-column>
      <a-table-column title="类型" data-index="type">
        <template slot-scope="type">
          <a-tag v-if="type === 0" color="#f50">问答帖</a-tag>
          <a-tag v-if="type === 1" color="#2db7f5">圈子</a-tag>
        </template>
      </a-table-column>
      <a-table-column title="操作">
        <template slot-scope="row">
          <a-popconfirm
            title="是否删除当前选项？"
            ok-text="是"
            cancel-text="否"
            @confirm="delPostSetting(row.id)"
          >
            <a-tooltip title="删除">
              <a-icon type="delete" theme="filled" class="del-icon" />
            </a-tooltip>
          </a-popconfirm>
        </template>
      </a-table-column>
    </a-table>
    <div @click="addClick" class="add-icon-container">
      <a-icon type="plus" class="add-icon" />
    </div>
    <a-drawer
      title="帖子"
      placement="right"
      :closable="true"
      width="400"
      :visible="showFormModal"
      @close="closeFormModal"
    >
      <a-form-model
        ref="postSettingForm"
        :model="postForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-model-item prop="url" label="url" extra="请输入问题或者圈子url">
          <a-input v-model="postForm.url" placeholder="请输入问题或者圈子url" />
        </a-form-model-item>
        <a-form-model-item :wrapper-col="{ span: 14, offset: 2 }">
          <a-button type="danger" :loading="saveLoading" @click="saveClick">保存</a-button>
        </a-form-model-item>
      </a-form-model>
    </a-drawer>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import PostSettingVo from "../services/model/PostSettingVo";
import { getQuestionBy, checkUrlBy } from "../services/PostService";
import { shell } from "electron";
import {
  saveOrUpdatePostSetting,
  getPostSettingList,
  removePostSetting
} from "../services/SettingService";
import { showErrorMsg } from "../utils/fetch";
import { FormModel } from "ant-design-vue";
import { Ref, Component } from "vue-property-decorator";
@Component({})
export default class PostPage extends Vue {
  @Ref("postSettingForm")
  postSettingForm!: FormModel;
  rules = {
    url: [
      {
        required: true,
        message: "请输入文章的url地址",
        trigger: "blur"
      },
      {
        asyncValidator(
          rule: unknown,
          value: string,
          callback: (info?: unknown) => {}
        ) {
          checkUrlBy(value).then(valid => {
            if (valid) {
              callback();
            } else {
              callback(
                new Error(
                  "这是一个无效的链接，请在浏览器中检验该链接是否可以打开"
                )
              );
            }
            callback();
          });
        }
      }
    ]
  };
  list: PostSettingVo[] = [];
  postForm = new PostSettingVo(); // 关注问题列表的表单
  saveLoading = false; // 表单保存的loading
  showFormModal = false; // 是否显示表单的弹窗
  labelCol = { span: 5 };
  wrapperCol = { span: 18 };
  /**
   * 打开浏览器阅读原文
   */
  async openBower(url: string) {
    shell.openExternal(url);
  }
  /**
   * 保存按钮点击事件
   */
  async saveClick() {
    this.postSettingForm.validate(async valid => {
      if (valid) {
        try {
          this.saveLoading = true;
          await saveOrUpdatePostSetting(this.postForm);
          // 更新列表数据
          this.list = await getPostSettingList();
          // 关闭表单
          this.showFormModal = false;
        } catch (e) {
          showErrorMsg(e);
        } finally {
          this.saveLoading = false;
        }
      }
    });
  }
  async delPostSetting(id: string) {
    try {
      await removePostSetting(id);
      this.list = await getPostSettingList();
    } catch (e) {
      showErrorMsg(e);
    }
  }
  /**
   * 添加按钮点击事件
   */
  addClick() {
    // 重置添加表单
    this.postForm = new PostSettingVo();
    this.showFormModal = true;
    this.$nextTick(() => {
      this.postSettingForm.resetFields();
    });
  }
  /**
   * 隐藏表单弹窗
   */
  closeFormModal() {
    this.showFormModal = false;
  }
  async activated() {
    this.list = await getPostSettingList();
  }
}
</script>
<style lang="less" scoped>
.del-icon {
  color: #ff4d4f;
  font-size: 20px;
  &:hover {
    opacity: 0.7;
  }
}
.add-icon-container {
  right: 30px;
  top: 70px;
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
  transition: transform 0.7s;
  &:hover {
    transition-timing-function: ease;
    transform: rotate(90deg);
  }
  .add-icon {
    font-size: 20px;
  }
}
</style>
