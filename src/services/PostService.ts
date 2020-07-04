import axios from "axios";
import AnswerVo from "../services/model/AnswerVo";
import { db } from "../utils/db";
import QuestionVo from "./model/QuestionVo";
import ClubVo from "./model/ClubVo";
import { PostSettingType } from "./model/PostSettingVo";
class BaseSearchParams{
  searchId = ""; // 查询帖子的id
  limit = 20; // 一次请求数量 最大值20
  offset = 0; // 查询的页码
}
// 获取问题答案 查询条件
export class SearchAnswerListParams extends BaseSearchParams{
  sortBy = "updated"; // 帖子排序方式 updated:按时间 default:默认
}
// 获取Club 查询条件
export class SearchClubListParams extends BaseSearchParams{
}
/**
 * 获取圈子答案
 * @param params 查询条件
 */
export async function searchClubList(params: SearchClubListParams) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/clubs/${params.searchId}/posts`,
    {
      params: {
        limit: params.limit,
        offset: params.offset,
        include:
          "data[*].is_normal,admin_closed_comment,reward_info,is_collapsed,annotation_action,annotation_detail,collapse_reason,is_sticky,collapsed_by,suggest_edit,comment_count,can_comment,content,editable_content,voteup_count,reshipment_settings,comment_permission,created_time,updated_time,review_info,relevant_info,question,excerpt,relationship.is_authorized,is_author,voting,is_thanked,is_nothelp,is_labeled,is_recognized,paid_info,paid_info_content;data[*].mark_infos[*].url;data[*].author.follower_count,badge[*].topics",
      },
    }
  );
  return data;
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
/**
 * 获取圈子帖子
 * @param cId  问题id
 */
export async function getClubBy(cId: string) {
  const { data } = await axios.get(
    `https://www.zhihu.com/api/v4/clubs/${cId}/posts`,
    {
      params: {
        include: `data[*].answer_count,author,follower_count`,
      },
    }
  );
  return new ClubVo(data);
}
/**
 * 获取普通问答帖子
 * @param qId  问题id
 */
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
/**
 * 检查url是否有效
 * @param url 添加帖子的url
 */
export async function checkUrlBy(url: string) {
  const params = getQuestionInfoBy(url);
  if (params) {
    if (params.type === PostSettingType.Answer) {
      await getQuestionBy(params.id);
    } else if (params.type === PostSettingType.Club) {
      await getClubBy(params.id);
    } else {
      return false;
    }
    return true
  } else {
    return false;
  }
}
// 根据url获取当前问题的id和类型
export function getQuestionInfoBy(url: string) {
  // 分析url中的id和类型
  const questionSplit = url.split("https://www.zhihu.com/question/");
  const clubSplit = url.split("https://www.zhihu.com/club/");
  let id = "";
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
    id = strs[0];
  } else if (clubSplit.length === 2) {
    /**
     * 圈子url有2种各式
     * 1.https://www.zhihu.com/club/1139247351129653248 直接进入的问题页面，最后数字部分就是问题id
     * 2.https://www.zhihu.com/club/1139247351129653248/post/1260663117341732864?from=list 直接进入某个帖子回答，这时候后面会跟帖子id
     * 其中第二种需要在去掉圈子某个帖子id部分的字符串
     */
    const strs = clubSplit[1].split("/post/");
    id = strs[0];
    type = PostSettingType.Club;
  }
  // 如果qId没有分析出来则说明url有问题
  if (id) {
    return { id, type };
  }
  return null;
}
