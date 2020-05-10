/**
 * 对知乎问题进行二次封装
 */
export default class QuestionVo {
    id: string // 问题id
    title: string // 帖子标题
    answerCount: number // 回答数量
    constructor(obj: any) {
      this.id = obj.id
      this.title = obj.title
      this.answerCount = obj.answer_count
    }
  }