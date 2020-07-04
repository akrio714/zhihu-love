import moment from 'moment'
/**
 * 对知乎答案进行二次封装
 */
export default class Answer {
    id: string
    // 作者姓名
    authorName: string
    // 作者头像
    authorImg: string
    // 作者自我简介
    authorHeadline: string
    // 作者性别 0:女 1:男 2:不确定
    authorGender: number
    // 富文本文案
    content: string
    // 简介文案
    excerpt: string
    // 点赞数
    voteupCount: number
    // 评论数
    commentCount: string
    // 创建时间
    createdTime: string
    // 上次更新时间
    updatedTime: string
    // 所有图片
    imgList: string[] = []
    // 文档原文地址
    url: string
    constructor(obj: any) {
      debugger
      this.id = obj.id
      this.authorName = obj.author.name
      this.authorImg = obj.author.avatar_url_template.replace('{size}', 'hd')
      this.authorHeadline = obj.author.headline
      this.authorName = obj.author.name
      this.authorGender = obj.author.gender
      if (obj.author.name === '「已注销」' || obj.author.id === '0') {
        this.authorGender = 2
      }
      this.content = obj.content
      this.excerpt = obj.excerpt
      this.voteupCount = obj.voteup_count
      this.commentCount = obj.comment_count
      this.createdTime = moment(obj.created_time).format('YYYY-MM-DD HH:mm')
      this.updatedTime = moment(obj.updated_time * 1000).format(
        'YYYY-MM-DD HH:mm'
      )
      // 计算原文地址
      this.url = `https://www.zhihu.com/question/${obj.question.id}/answer/${obj.id}`
      // 获取回答中的所有图片
      const frag = document.createElement('div')
      frag.innerHTML = obj.content
      //获取img 标签
      frag.querySelectorAll('img').forEach(img => {
        this.imgList.push(img.dataset.actualsrc as string)
      })
      // 匿名用户就不显示头像了
      if (this.authorGender !== 2) {
        this.imgList.push(this.authorImg)
      }
      // TODO 不知道为什么 用户非匿名也无法获取性别 神奇 手动将-1情况性别改为 2：未知
      if (this.authorGender === -1) {
        this.authorGender = 2
      }
      if (this.authorGender === 2) {
        // 如果从用户获取不到性别则尝试从文章中关键字进行获取
        const manStringList = ['本人男', '我是男', '爱好女', '找女朋友']
        // 先尝试判断是否为男生
        for (const s of manStringList) {
          const isMan = this.content.indexOf(s) !== -1
          // 通过关键字判断为男性
          if (isMan) {
            this.authorGender = 1
            break
          }
        }
      }
      if (this.authorGender === 2) {
        const wonmanStringList = ['本人女', '我是女', '爱好男', '找男朋友']
        // 尝试判断是否为女生
        for (const s of wonmanStringList) {
          const isWoman = this.content.indexOf(s) !== -1
          // 通过关键字判断为女性
          if (isWoman) {
            this.authorGender = 0
            break
          }
        }
      }
    }
  }