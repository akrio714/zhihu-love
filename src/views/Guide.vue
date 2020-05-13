<template>
  <div>
    <a-form-model ref="ruleForm" :rules="rules" :model="form" layout="vertical">
      <a-form-model-item prop="searchUrl" label="推荐文章">
        <a-radio-group v-model="form.searchUrl">
          <a-radio
            :value="item.url"
            :style="radioStyle"
            v-for="item in searchList"
            :key="item.url"
          >
            {{ item.title }}
          </a-radio>
          <a-radio :style="radioStyle" value="custom">
            自定义
            <a-input
              v-model="form.customUrl"
              @blur="valdateUrl"
              placeholder="https://www.zhihu.com/question/xxxx"
              v-if="form.searchUrl === 'custom'"
              :style="{ width: 160, marginLeft: 20 }"
            />
          </a-radio>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="onSubmit">
          确定
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<style lang="less" scoped></style>
<script lang="ts">
import Vue from "vue";
import { getQuestionInfoBy, getQuestionBy } from "../services/PostService";
import { clipboard } from "electron";
import PostSettingVo from "../services/model/PostSettingVo";
import {
  saveOrUpdatePostSetting,
  saveSetting,
  SettingForm
} from "../services/SettingService";
import { showErrorMsg } from "../utils/fetch";
// 第一次进入的引导页面
export default Vue.extend({
  name: "GuidePage",
  data() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    return {
      // radio纵向排列样式
      radioStyle: {
        display: "block",
        height: "34px",
        lineHeight: "34px"
      },
      searchList: [
        {
          url: "https://www.zhihu.com/question/364035162/answer/973163598",
          title: "2020年你的择偶标准是什么？"
        },
        {
          url: "https://www.zhihu.com/question/280523155/answer/1038923064",
          title: "你最真实（很少吐露）的择偶标准是什么？"
        },
        {
          url: "https://www.zhihu.com/question/304090066/answer/783313495",
          title: "你的择偶标准是怎么样的？"
        },
        {
          url: "https://www.zhihu.com/question/311378291/answer/804648946",
          title: "天津的你，择偶的标准是怎样的？"
        },
        {
          url: "https://www.zhihu.com/question/309872833/answer/956414233",
          title: "身在北京的你，择偶标准是怎样的"
        },
        {
          url: "https://www.zhihu.com/question/356957129/answer/929341654",
          title: "研究生的你，择偶标准是什么？"
        },
        {
          url: "https://www.zhihu.com/question/308798869",
          title: "上海的你，择偶的标准是怎样的？"
        },
        {
          url: "https://www.zhihu.com/question/310390277/answer/1143443473",
          title: "西安的你，择偶的标准是怎样的？"
        }
      ],
      form: {
        searchUrl: "", // 通过预选项进行的选择
        customUrl: "" // 通过自定义项手动输入的url
      },
      oldClipboardText: "", // 上次保存在剪切板中的数据
      rules: {
        searchUrl: [
          {
            required: true,
            message: "请任意选择一篇文章",
            trigger: "blur"
          },
          {
            asyncValidator(
              rule: unknown,
              value: string,
              callback: (info?: unknown) => {}
            ) {
              // 如果是自定义模式 那么就要检测url是否正确了
              if (value === "custom") {
                const customUrl = _this.form.customUrl;
                if (customUrl === "") {
                  callback(new Error("请输入关注问题url地址"));
                }
                const result = getQuestionInfoBy(customUrl);
                if (result) {
                  getQuestionBy(result.qId).then(() => {
                    callback();
                  });
                } else {
                  callback(
                    new Error(
                      "这是一个无效的链接，请在浏览器中检验该链接是否可以打开"
                    )
                  );
                }
              }
              callback();
            }
          }
        ]
      }
    };
  },
  methods: {
    /**
     * 验证自定义url是否符合要求
     */
    valdateUrl() {
      (this.$refs.ruleForm as any).validateField("searchUrl");
    },
    onSubmit() {
      (this.$refs.ruleForm as any).validate(async (valid: boolean) => {
        if (valid) {
          // 通过验证后保存当前post到库中
          try {
            this.$bus.$emit("showLoading", true);
            const postForm = new PostSettingVo();
            if (this.form.searchUrl === "custom") {
              postForm.url = this.form.customUrl;
            } else {
              postForm.url = this.form.searchUrl;
            }
            // 保存Post信息
            const { id } = await saveOrUpdatePostSetting(postForm);
            // 然后为基础设置给定一个初始值，并帮他把当前搜索的帖子填上
            const settingForm = new SettingForm();
            // 将刚刚保存post信息中的id自动进行填写
            settingForm.searchId = id;
            await saveSetting(settingForm);
            // 显示左侧隐藏的菜单
            this.$bus.$emit("initSuccess", true);
            // 然后跳转到查询页面
            this.$router.push({
              name: "SearchPage"
            });
          } catch (e) {
            showErrorMsg(e);
          } finally {
            this.$bus.$emit("showLoading", false);
          }
        } else {
          return false;
        }
      });
    }
  },
  created() {
    try {
      // 能进入这个页面说明数据已经被清空了，那么直接隐藏左边菜单
      this.$bus.$emit("initSuccess", false);
      const handleVisibilityChange = async () => {
        if (document.hidden) {
          console.log("页面被隐藏");
        } else {
          const currentClipborad = clipboard.readText();
          // 判断当前剪切板数据是否和上次一致，如果一样就说明用户不想用这个，直接隐藏
          if (currentClipborad === this.oldClipboardText) {
            console.log(
              `当前剪切板(${currentClipborad}和历史记录${this.oldClipboardText}相同`
            );
            return;
          }
          // 获取剪切板数据，然后验证是否为有效url
          const result = getQuestionInfoBy(currentClipborad);
          if (result) {
            try {
              this.$bus.$emit("showLoading", true);
              await getQuestionBy(result.qId);
              /**
               * 判定剪切板中数据为有效url
               * 这里分为2种情况
               * 1.用户当前选中的为预选项，那么需要弹出提示进行确认
               * 2.用户选在就是自定义项，那么在自定义url为空时自动带入，非空也需要弹出提示
               *  */
              let auto = false; // 是否为无提示自动带入
              if (this.form.searchUrl === "custom" && !this.form.customUrl) {
                auto = true;
              }
              // eslint-disable-next-line @typescript-eslint/no-this-alias
              const _this = this;
              if (auto) {
                this.form.customUrl = currentClipborad; // 自动将url粘贴到剪切板
                // 从新触发验证去掉错误提示
                this.valdateUrl();
              } else {
                this.$confirm({
                  content: `请问是否直接采用接切板中url(${currentClipborad})`,
                  okText: "确认",
                  cancelText: "取消",
                  onOk() {
                    // 自动切换到自定义选项
                    _this.form.searchUrl = "custom";
                    // 自动填写url
                    _this.form.customUrl = currentClipborad;
                    // 从新触发验证去掉错误提示
                    _this.valdateUrl();
                  }
                });
              }
              // 更新历史剪切板数据
              this.oldClipboardText = currentClipborad;
            } catch (e) {
              showErrorMsg(e);
            } finally {
              this.$bus.$emit("showLoading", false);
            }
          }
          console.log("页面被激活");
        }
      };
      // 去掉事件监听主要是调试所需，因为开发环境中自动更新会多次触发created,造成多次绑定
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // 增加自动通过剪切板数据自动填入自定义项的逻辑
      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange,
        false
      );
    } catch (e) {
      showErrorMsg(e);
    }
  }
});
</script>
