import axios from "axios";
import AnswerVo from "../services/model/AnswerVo";
import { db } from "../utils/db";
import QuestionVo from "./model/QuestionVo";
import { PostSettingType } from "./model/PostSettingVo";
// 获取问题答案 查询条件
export class SearchAnswerListParams {
  searchId = ""; // 查询帖子的id
  sortBy = "updated"; // 帖子排序方式 updated:按时间 default:默认
  limit = 20; // 一次请求数量 最大值20
  offset = 0; // 查询的页码
}

/**
 * 获取问题答案
 * @param params 查询条件
 */
export async function searchAnswerList(params: SearchAnswerListParams) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/questions/${params.searchId}/answers`,
    {
      params: {
        sort_by: params.sortBy,
        limit: params.limit,
        offset: params.offset,
        include:
          "data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_labeled,is_recognized,paid_info,paid_info_content;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics",
      },
    }
  );
  return data;
}
type postParams = { gender: number | null; keywords: string[] };
/**
 * 获取缓存中的帖子信息
 */
export async function getPostList(params: postParams) {
  const result = await db.posts.find({}).sort({ updated_time: -1 }); // 按照时间排序
  const list = result
    .map((item) => new AnswerVo(item))
    .filter((item) => {
      // 计算性别是否匹配
      let genderFliter =
        params.gender === item.authorGender || item.authorGender === 2;
      // 如果gender 为null 则不进行性别过滤
      if (params.gender === null) {
        genderFliter = true;
      }
      // 计算关键字是否匹配
      let keywordFilter = true;
      for (const keyword of params.keywords) {
        const success = item.content.indexOf(keyword) !== -1;
        // 如果keyword有一项不匹配则直接过滤掉
        if (!success) {
          keywordFilter = false;
          break;
        }
      }
      return genderFliter && keywordFilter;
    });
  return list;
}
export async function getQuestionBy(qId: string) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/questions/${qId}`,
    {
      params: {
        include: `data[*].answer_count,author,follower_count`,
      },
    }
  );
  return new QuestionVo(data);
}
// 根据url获取当前问题的id和类型
export function getQuestionInfoBy(url: string) {
  // 分析url中的id和类型
  const questionSplit = url.split("https://www.zhihu.com/question/");
  let qId = "";
  let type = PostSettingType.Answer;
  // 如果能拆出来2个说明是普通问题
  if (questionSplit.length === 2) {
    /**
     * 问题url有2种各式
     * 1.https://www.zhihu.com/question/311378291 直接进入的问题页面，最后数字部分就是问题id
     * 2.https://www.zhihu.com/question/311378291/answer/960371629 直接进入某个帖子回答，这时候后面会跟帖子id
     * 其中第二种需要在去掉答案id部分的字符串
     */
    const strs = questionSplit[1].split("/answer/");
    qId = strs[0];
  }
  // 如果qId没有分析出来则说明url有问题
  if (qId) {
    return { qId, type };
  }
  return null;
}
export async function getQuestion(qId: string) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/questions/${qId}`,
    {
      params: {
        include: `data[*].answer_count,author,follower_count`,
      },
    }
  );
  return new QuestionVo(data);
}
