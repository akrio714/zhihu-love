/**
 * 对知乎圈子进行二次封装
 */
export default class QuestionVo {
  id: string = '' // 问题id
  title: string = '' // 帖子标题
  answerCount: number = 0 // 回答数量
  constructor(obj: any) {
    this.id = obj.id
    if (obj.data[0]) {
      this.title = obj.data[0].club.name
    }
    this.answerCount = obj.paging.totals
  }
}