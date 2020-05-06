/*
 * @Author: your name
 * @Date: 2020-05-02 17:36:33
 * @LastEditTime: 2020-05-07 06:25:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /love/src/services/zhihu.ts
 */
import axios from 'axios'
import nodejieba from 'nodejieba'
import moment from 'moment'
import {dbFactory} from '../utils/db'
/**
 * 查询指定类型的文章
 * @param keyword 查询的关键词
 */
export function searchAnswer(keyword = '择偶') {
  return axios.get('https://www.zhihu.com/api/v4/search_v3', {
    params: {
      t: 'general',
      q: keyword,
      correction: 1,
      offset: 0,
      limit: 20,
      'lc_idx': 0,
      'show_all_topics': 0,
    },
  })
}
export class SettingForm {
  interval = 0 // 自动获取数据间隔 (分钟) 0：不自动获取
  notification = false // 是否开启系统通知显示
  max = 200 // 分析帖子的数量
  sort = 'updated' // 帖子排序方式 updated:按时间 default:默认
  searchId = '' // 需要用户分析的帖子的id
}
export class Answer {
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
  url:string
  constructor(obj: any) {
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
    this.updatedTime = moment(obj.updated_time*1000).format('YYYY-MM-DD HH:mm')
    // 计算原文地址
    this.url = `https://www.zhihu.com/question/${obj.question.id}/answer/${obj.id}`
    // 获取回答中的所有图片
    const frag = document.createElement('div')
    frag.innerHTML = obj.content
    //获取img 标签
    frag.querySelectorAll('img').forEach((img) => {
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
    if(this.authorGender === 2){
    // 如果从用户获取不到性别则尝试从文章中关键字进行获取
    const manStringList = ['本人男','我是男','爱好女','找女朋友']
    // 先尝试判断是否为男生
    for(const s of manStringList){
      const isMan = this.content.indexOf(s) !== -1
      // 通过关键字判断为男性
      if(isMan){
        this.authorGender = 1
        break
      }
    }
  }
    if(this.authorGender === 2){
      const wonmanStringList = ['本人女','我是女','爱好男','找男朋友']
      // 尝试判断是否为女生
    for(const s of wonmanStringList){
      const isWoman = this.content.indexOf(s) !== -1
      // 通过关键字判断为女性
      if(isWoman){
        this.authorGender = 0
        break
      }
    }
    }
  }
}
/**
 * 获取问题答案
 * @param answerId 查询问题的id
 * @param sortBy 排序方式 default：默认排序 updated：按时间排序
 */
export async function getAnswer(answerId: string, sortBy = 'updated') {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/questions/${answerId}/answers`,
    {
      params: {
        'sort_by': sortBy,
        include:
          'data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_labeled,is_recognized,paid_info,paid_info_content;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics',
      },
    }
  )
  return data
}
/**
 * 直接请求url
 * @param url 请求的url
 */
export async function getNext(url: string) {
  const { data } = await axios.get(url)
  return data
}

const db = {
  settings: dbFactory('settings.db'),
  posts: dbFactory('posts.db'),
}
export async function saveSetting(form:SettingForm) {
  const save =  await db.settings.update({
    type:'settings'
    }, {
      $set: {
        form:form
      }
    });
  return save
}
/**
 * 更新保存的帖子信息
 * @param list 
 */
export async function savePostList(list:any){
  // 清空之前选项
  await db.posts.remove({},{
    multi: true
  })
  // 将新数据进行插入
  const result = await db.posts.insert(list)
  return result
}
type postParams = { gender: number, keywords: string[] }
/**
 * 获取缓存中的帖子信息
 */
export async function getPostList(params:postParams){
  console.log('params',params)
  const result = await db.posts.find({})
  const list = result.map(item => new Answer(item)).filter(item => {
    // 计算性别是否匹配
    const genderFliter = params.gender === item.authorGender || item.authorGender === 2
    // 计算关键字是否匹配
    let keywordFilter = true
    for(const keyword of params.keywords){
      const success = item.content.indexOf(keyword) !==-1
      console.log(`${keyword} success`)
            // 如果keyword有一项不匹配则直接过滤掉
            if(!success){
              keywordFilter = false
              break
                    }
    }
    return genderFliter && keywordFilter
  })
  return list
}
/**
 * 获取设置页面的表单数据
 */
export async function getSettingForm(){
  type DbResult = {form: SettingForm }
  const one = await db.settings.findOne<DbResult>({type:'settings'})
  return one.form
}
/**
 * 清空所有数据，同时对必要参数进行初始化 settings设置
 */
export async function clear(){
  // 清空设置数据
  await db.settings.remove({},{
    multi: true
  })
  // 清空保存的帖子数据
  await db.posts.remove({},{
    multi: true
  })
  // 初始化表单数据
 await db.settings.insert({
   type:'settings',
   form:new SettingForm()
 })
}