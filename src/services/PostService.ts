import axios from 'axios'
// 获取问题答案 查询条件
export class SearchAnswerListParams {
  searchId = '' // 查询帖子的id
  sortBy = 'updated' // 帖子排序方式 updated:按时间 default:默认
  limit = 20 // 一次请求数量 最大值20
  offset = 0  // 查询的页码
}

/**
 * 获取问题答案
 * @param params 查询条件
 */
export async function searchAnswerList(params:SearchAnswerListParams) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/questions/${params.searchId}/answers`,
    {
      params: {
        sort_by: params.sortBy,
        limit: params.limit,
        offset: params.offset,
        include:
          'data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_labeled,is_recognized,paid_info,paid_info_content;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics'
      }
    }
  )
  return data
}
