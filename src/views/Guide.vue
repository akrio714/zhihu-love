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
        lineHeight: "34px",
      },
      searchList: [
        {
          url: "https://www.zhihu.com/question/364035162/answer/973163598",
          title: "2020年你的择偶标准是什么？",
        },
        {
          url: "https://www.zhihu.com/question/280523155/answer/1038923064",
          title: "你最真实（很少吐露）的择偶标准是什么？",
        },
        {
          url: "https://www.zhihu.com/question/304090066/answer/783313495",
          title: "你的择偶标准是怎么样的？",
        },
        {
          url: "https://www.zhihu.com/question/324628376/answer/745818043",
          title: "天津的你择偶标准是什么？",
        },
        {
          url: "https://www.zhihu.com/question/309872833/answer/956414233",
          title: "身在北京的你，择偶标准是怎样的",
        },
        {
          url: "https://www.zhihu.com/question/356957129/answer/929341654",
          title: "研究生的你，择偶标准是什么？",
        },
        {
          url: "https://www.zhihu.com/question/308798869",
          title: "上海的你，择偶的标准是怎样的？",
        },
        {
          url: "https://www.zhihu.com/question/310390277/answer/1143443473",
          title: "西安的你，择偶的标准是怎样的？",
        },
      ],
      form: {
        searchUrl: "",
        customUrl: "",
      },
      rules: {
        searchUrl: [
          {
            required: true,
            message: "请任意选择一篇文章",
            trigger: "blur",
          },
        ],
        customUrl: [
          {
            asyncValidator(
              rule: unknown,
              value: string,
              callback: (info?: unknown) => {}
            ) {
              console.log("rule", rule);
              // 如果是自定义模式 那么就要检测url是否正确了
              if (_this.form.searchUrl === "custom") {
                if (value === "") {
                  callback(new Error("请输入关注问题url地址"));
                }
                const result = getQuestionInfoBy(value);
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
            },
          },
        ],
      },
    };
  },
  methods: {
    onSubmit() {
      (this.$refs.ruleForm as any).validate((valid: boolean) => {
        if (valid) {
          // 通过验证折后
        } else {
          return false;
        }
      });
    },
  },
  created() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) {
          console.log("页面被隐藏");
        } else {
          // 如果用户处于手动输入文章状态
          console.log("页面被激活");
        }
      },
      false
    );
  },
});
</script>
