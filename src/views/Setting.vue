<!--
 * @Author: your name
 * @Date: 2020-05-03 07:10:36
 * @LastEditTime: 2020-05-07 06:42:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/views/Setting.vue
 -->
<template>
  <div>
    <a-modal
      v-model="loadPost.show"
      :closable="false"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      :width="170"
    >
      <div>
        <a-progress
          type="circle"
          :percent="parseInt((loadPost.current / loadPost.total) * 100)"
        >
        </a-progress>
        {{ loadPost.current }}/{{ loadPost.total }}
      </div>
    </a-modal>
    <a-form-model
      :rules="rules"
      :model="form"
      ref="settingsForm"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-form-model-item
        label="帖子"
        extra="需分析的帖子"
        placeholder="请选择需要分析的帖子"
        prop="searchId"
      >
        <a-select
          v-if="searchList.length > 0"
          v-model="form.searchId"
          style="width: 440px"
          placeholder="请选择需要分析的帖子"
        >
          <a-select-option
            v-for="searchItem in searchList"
            :key="searchItem.id"
          >
            {{ searchItem.title }}（{{ `共有${searchItem.answerCount}条` }}）
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="获取间隔" extra="自动获取数据间隔">
        <a-radio-group v-model="form.interval">
          <a-radio :value="0">
            从不
          </a-radio>
          <a-radio :value="30">
            30分钟
          </a-radio>
          <a-radio :value="60">
            1小时
          </a-radio>
          <a-radio :value="300">
            5小时
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="帖子时间" extra="通过发布时间对帖子进行拉取">
        <a-radio-group v-model="form.max">
          <a-radio :value="1">
            最近1个月
          </a-radio>
          <a-radio :value="3">
            最近3个月
          </a-radio>
          <a-radio :value="6">
            最近半年
          </a-radio>
          <a-radio :value="-1">
            全部(慎用，可能会被制裁)
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item
        label="通知"
        extra="是否开启系统通知显示，防止错过信息"
      >
        <a-switch
          v-model="form.notification"
          checked-children="开"
          un-checked-children="关"
          default-checked
        />
      </a-form-model-item>
      <a-form-model-item
        label="清空缓存"
        extra="清空后所有的设置以及保存的信息都将丢失"
      >
        <a-popconfirm
          placement="topLeft"
          ok-text="是"
          cancel-text="否"
          @confirm="clearAllClick"
        >
          <template slot="title">
            <p>清空后所有信息都会丢失，请确认是否执行该操作？</p>
          </template>
          <a-button type="danger" shape="round" icon="delete"></a-button>
        </a-popconfirm>
      </a-form-model-item>
      <a-form-model-item :wrapper-col="{ span: 14, offset: 3 }">
        <a-button type="primary" @click="onSubmit">
          保存
        </a-button>
        <a-button @click="resetClick" style="margin-left: 10px;">
          恢复默认
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { getQuestion } from "../services/zhihu";
import {
  saveSetting,
  SettingForm,
  getSettingForm,
  clear
} from "../services/SettingService";
import { showErrorMsg } from "../utils/fetch";
export default Vue.extend({
  name: "SettingPage",
  data() {
    return {
      loadPost: {
        show: false,
        total: 100,
        current: 1
      },
      labelCol: { span: 3 },
      wrapperCol: { span: 20 },
      rules: {
        searchId: [
          {
            required: true,
            message: "请选择一个帖子",
            trigger: ["change", "blur"]
          }
        ]
      },
      searchIds: [
        "275359100",
        "280523155",
        "364035162",
        "385006282",
        "356957129",
        "311378291"
      ],
      searchList: [],
      form: new SettingForm()
    };
  },
  methods: {
    async onSubmit() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs.settingsForm as any).validate(async (valid: boolean) => {
        if (valid) {
          try {
            await saveSetting(this.form);
          } catch (e) {
            showErrorMsg;
          } finally {
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async resetClick() {
      this.form = new SettingForm();
      await saveSetting(this.form);
    },
    async clearAllClick() {
      this.form = await clear();
    },
    /**
     * 重新拉取帖子的信息
     */
    async reloadPostInfo() {
      const list = [];
      for (const id of this.searchIds) {
        const question = await getQuestion(id);
        list.push(question);
      }
      this.$set(this, "searchList", list);
    }
  },
  async activated() {
    await this.reloadPostInfo();
    const form = getSettingForm() || new SettingForm();
    this.form = form;
    //
  }
});
</script>

<style></style>
