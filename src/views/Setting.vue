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
        <a-select v-model="form.searchId" style="width: 440px">
          <a-select-option
            v-for="searchItem in searchList"
            :key="searchItem.key"
            :value="searchItem.key"
          >
            {{ searchItem.label }}（{{ searchItem.number }}）
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
      <a-form-model-item
        label="拉取数量"
        extra="分析帖子的数量，如果不明白请选第一个"
      >
        <a-radio-group v-model="form.max">
          <a-radio :value="10">
            前10条
          </a-radio>
          <a-radio :value="500">
            前500条
          </a-radio>
          <a-radio :value="1000">
            前1000条
          </a-radio>
          <a-radio :value="5000">
            前5000条
          </a-radio>
          <a-radio :value="-1">
            全部(慎用，可能会被制裁)
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item
        label="排序方式"
        extra="由于知乎存在2种排序方式，所以会影响最终拉取的结果，建议采用时间排序"
      >
        <a-radio-group v-model="form.sort">
          <a-radio value="updated">
            按时间排序
          </a-radio>
          <a-radio value="default">
            默认排序
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
  clear,
  getSettingForm,
  SettingForm,
  getAnswer,
  getNext,
  savePostList
} from "../services/zhihu";
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
      searchList: [
        {
          key: "275359100",
          label: "你的择偶标准是怎样的？",
          number: "计算帖数中"
        },
        {
          key: "280523155",
          label: "你最真实（很少吐露）的择偶标准是什么？",
          number: "计算帖数中"
        },
        {
          key: "364035162",
          label: "2020年你的择偶标准是什么？",
          number: "计算帖数中"
        },
        {
          key: "385006282",
          label: "你择偶的标准是什么？",
          number: "计算帖数中"
        },
        {
          key: "356957129",
          label: "研究生的你，择偶标准是什么？",
          number: "计算帖数中"
        },
        {
          key: "311378291",
          label: "天津的你，择偶的标准是怎样的？",
          number: "计算帖数中"
        }
      ],
      oldForm: new SettingForm(), // 保存之前的表单数据
      form: new SettingForm()
    };
  },
  methods: {
    async onSubmit() {
      (this.$refs.settingsForm as any).validate(async (valid: boolean) => {
        if (valid) {
          const needReloadPost =
            this.oldForm.searchId !== this.form.searchId ||
            this.oldForm.max !== this.form.max ||
            this.oldForm.sort !== this.form.sort;
          // 如果拉取数量 帖子id 排序规则有任何变化则重新拉取帖子信息
          if (needReloadPost) {
            const list = [];
            const data = await getAnswer(this.form.searchId, this.form.sort);
            let nextUrl = data.paging.next;
            this.loadPost.total = this.form.max;
            if (this.form.max == -1) {
              this.loadPost.total = data.paging.totals;
            }
            this.loadPost.show = true;
            list.push(...data.data);
            this.loadPost.current = list.length;
            for (
              let i = data.data.length;
              i < this.form.max || this.form.max === -1;
              i += data.data.length
            ) {
              const nextData = await getNext(nextUrl);
              list.push(...nextData.data);
              this.loadPost.current = list.length;
              // 如果已经到底则不进行爬取
              if (!nextData.paging.is_end) {
                nextUrl = nextData.paging.next;
              } else {
                break;
              }
            }
            await savePostList(list);
            this.loadPost.show = false;
          } else {
            console.log("数据变化无需刷新post数据", this.oldForm, this.form);
          }
          // 将setting信息保存到设置信息中
          if (needReloadPost) {
            this.form.updated = new Date().getTime();
          }
          const savedSetting = await saveSetting(this.form);
          console.log("savedSetting", savedSetting);
          this.oldForm = { ...this.form };
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore：无法监听到$bus
          this.$bus.$emit("changeMenuLock", false);
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
      await clear();
      await this.reload();
    },
    async reload() {
      // 如果没有setting 表单则说明第一次进入，直接给一个初始值
      const form = await getSettingForm();
      if (form) {
        this.form = form;
      } else {
        await clear();
        this.form = new SettingForm();
      }
      this.oldForm = { ...this.form };
    }
  },
  async activated() {
    const myNotification = new Notification("标题", {
      body: "通知正文内容"
    });

    myNotification.onclick = () => {
      console.log("通知被点击");
    };
    await this.reload();
  }
});
</script>

<style></style>
