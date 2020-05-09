<template>
  <div>
    <div><button @click="showAnswerList">searchAnswerList</button></div>
    <div>{{ result }}</div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import {
  searchAnswerList,
  SearchAnswerListParams
} from "../services/PostService";
export default Vue.extend({
  name: "DemoPage",
  data() {
    return {
      result: []
    };
  },
  methods: {
    async showAnswerList() {
      const params = new SearchAnswerListParams();
      params.offset = 0;
      params.searchId = "392288808";
      params.limit = 20;
      this.result = await searchAnswerList(params);
      console.log(" this.result", this.result.data.length);
    }
  }
});
</script>
