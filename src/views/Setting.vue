<template>
  <div>
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
            {{ searchItem.question }}（{{ `共有${searchItem.answerCount}条` }}）
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item
        label="自动更新"
        extra="自动更新最新发布的帖子，并进行通知"
      >
        <a-radio-group v-model="form.autoUpdate">
          <a-switch
            v-model="form.autoUpdate"
            checked-children="开"
            un-checked-children="关"
            default-checked
          />
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item label="帖子范围" extra="拉取帖子的时间范围">
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
import {
  saveSetting,
  SettingForm,
  getSettingForm,
  clear,
  getPostSettingList,
} from "../services/SettingService";
import { showErrorMsg } from "../utils/fetch";
import PostSettingVo from "../services/model/PostSettingVo";
export default Vue.extend({
  name: "SettingPage",
  data() {
    return {
      labelCol: { span: 3 },
      wrapperCol: { span: 20 },
      rules: {
        searchId: [
          {
            required: true,
            message: "请选择一个帖子",
            trigger: ["change", "blur"],
          },
        ],
      },
      searchList: new Array<PostSettingVo>(),
      form: new SettingForm(),
    };
  },
  methods: {
    async onSubmit() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$refs.settingsForm as any).validate(async (valid: boolean) => {
        if (valid) {
          try {
            this.$bus.$emit("showLoading", true);
            const save = await saveSetting(this.form);
            // 如果更新了数据且开启了通知则提示信息
            if (save && this.form.notification) {
              new Notification("提示", { body: `一共获取到${save}条帖子` });
            }
          } catch (e) {
            showErrorMsg(e);
          } finally {
            this.$bus.$emit("showLoading", false);
          }
        } else {
          return false;
        }
      });
    },
    resetClick() {
      this.form = new SettingForm();
    },
    async clearAllClick() {
      try {
        this.form = await clear();
        // 显示左侧隐藏的菜单
        this.$router.push({ name: "GuidePage" });
      } catch (e) {
        showErrorMsg(e);
      }
    },
    /**
     * 重新拉取帖子的信息
     */
    async reloadPostInfo() {
      this.searchList = await getPostSettingList();
    },
  },
  async activated() {
    // 判断当前
    await this.reloadPostInfo();
    const form = getSettingForm() || new SettingForm();
    this.form = form;
    //
  },
});
</script>

<style></style>
