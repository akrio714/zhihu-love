export enum PostSettingType {
  Answer = 0, // 普通问题
  Club = 1, // 圈子
}
export default class PostSettingVo {
  id = ""; // 问题或者圈子id
  url = ""; // 需要分析url 通过url获取id
  type = PostSettingType.Answer; // 类型 圈子 普通问题
  question = ""; // 问题或者圈子的名字
  answerCount = 0; // 总贴数量
  constructor(obj?: any) {
    if (obj) {
      this.id = obj.id;
      this.url = obj.url;
      this.type = obj.type;
      this.question = obj.question;
      this.answerCount = obj.answerCount;
    }
  }
}
