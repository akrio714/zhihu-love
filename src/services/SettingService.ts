import { db } from '../utils/db'
import { setItem, getItem } from '../utils/LocalHelper'
import {
  SearchAnswerListParams,
  searchAnswerList
} from '../services/PostService'
import moment from 'moment'
export const SETTING_FORM = 'SETTING_FORM'
/**
 * 保存setting的表单数据
 */
export class SettingForm {
  interval = 0 // 自动获取数据间隔 (分钟) 0：不自动获取
  notification = false // 是否开启系统通知显示
  max = 1 // 分析帖子的数量
  searchId = '' // 需要用户分析的帖子的id
  updated = new Date().getTime() // 上次更新时间
}
/**
 * 获取当前设置
 */
export function getSettingForm() :SettingForm{
  const form = getItem<SettingForm>(SETTING_FORM)
  return form
}
/**
 * 保存setting信息
 * @param form
 * @param scheduleCallback
 */
type ScheduleCallbackType = (count: number, total: number) => {}
export async function saveSetting(
  form: SettingForm,
  scheduleCallback?: ScheduleCallbackType
) :Promise<SettingForm>{
  // 拉取历史setting信息，对影响post信息的数据进行比较，如果变化则重新拉取
  const oldForm = getSettingForm()
  let needReloadPost = false
  // 如果没有历史记录 或者帖子，拉取数量，排序条件发生改变，那么就重新拉取帖子
  if (oldForm) {
    needReloadPost =
      oldForm.searchId !== form.searchId || oldForm.max !== form.max
    // 判断是否需要从新拉帖子
    if (needReloadPost) {
      // 初始化查询answer查询条件
      let searchParams = new SearchAnswerListParams()
      searchParams.searchId = form.searchId
      let list: any[] = []
      // 计算截止时间
      const abortTime = moment()
        .months(-form.max)
        .unix()
      // 无限循环
      for (let i = 0; true; i += searchParams.limit) {
        // 查询获取分页答案
        const result = await searchAnswerList(searchParams)
        // 通过回调将当前请求数量进行返回
        if (scheduleCallback) {
          scheduleCallback(i, result.paging.totals)
        }
        // 预设下一页查询条件
        searchParams.offset = i
        // 是否数据全部拉取成功的标识
        let isEnd = result.paging.is_end
        // 循环验证时间是否符合标准
        result.data.forEach((item: any) => {
          // 晚于截止时间的帖子插入list
          if (item.update_time > abortTime) {
            list.push(item)
          } else {
            // 因为是按照时间排序，如果出现早于截止得情况则说明后面也都早于，则进行跳出
            isEnd = true
            return false
          }
        })
        if (isEnd) {
          break
        }
      }
      // 清空之前选项
      await db.posts.remove(
        {},
        {
          multi: true
        }
      )
      // 将新数据进行插入
    await db.posts.insert(list)
    }
  }
  setItem(SETTING_FORM,form)
  return form
}
/**
 * 项目初始化
 */
export async function clear():Promise<SettingForm>{
      // 清空保存的帖子数据
  await db.posts.remove(
    {},
    {
      multi: true
    }
  )
  const form = new SettingForm()
  setItem(SETTING_FORM,form)
  return form
}