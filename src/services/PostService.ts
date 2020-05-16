import axios from "axios";
import AnswerVo from "../services/model/AnswerVo";
import { db } from "../utils/db";
import QuestionVo from "./model/QuestionVo";
import { PostSettingType } from "./model/PostSettingVo";
import { getSettingForm } from "./SettingService";
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
/**
 * 获取问题信息
 * @param qId 问题id
 */
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
/**
 * 尝试自动更新搜索结果
 */
export async function autoUpload() {
  // 首先判断用户是否开启了自动更新配置
  const settingForm = getSettingForm();
  // 说明项目还未初始化 或者就没开自动更新开关 那么就不做更新
  if (!settingForm || !settingForm.searchId || !settingForm.autoUpdate) {
    return;
  }
  // 拉取当前帖子中最新一条记录的时间
  const result = await db.posts
    .find({})
    .sort({ updated_time: -1 })
    .skip(0)
    .limit(1); // 按照时间排序
  // 防止1条数据都没有
  if (result.length === 0) {
    return;
  }
  const lastUpdateTime = (result[0] as any).updated_time;
  let searchParams = new SearchAnswerListParams();
  searchParams.searchId = settingForm.searchId;
  // 预设的待插入的答案
  const addList: any[] = [];
  // 下面为死循环，此字段用于控制跳出逻辑 即拉取所有最新帖子后进行退出
  let isEnd = false;
  for (let i = 0; true; i += searchParams.limit) {
    // 预设当前查询条件
    searchParams.offset = i;
    // 查询获取分页答案
    const {data:answerList} = await searchAnswerList(searchParams);
    debugger
    answerList.forEach((answer: any) => {
      // 判断是否最新的帖子
      if (answer.updated_time > lastUpdateTime) {
        addList.push(answer);
      } else {
        isEnd = true;
        return false;
      }
    });
    if (isEnd) {
      break;
    }
  }
  // 遍历当前待添加答案
  for (let i = 0; i < addList.length; i++) {
    const answer: any = addList[0];
    // 判断当前项是否已存在，存在则更新，不存在则添加
    const one = await db.posts.findOne({ id: answer.id });
    if (one) {
      // 存在则进行更新
      await db.posts.update({ id: answer.id }, answer, {
        multi: false,
      });
    } else {
      // 不存在则进行添加
      await db.posts.insert(answer);
    }
  }
  // 如果真的更新了数据，则更新上次更新时间，这样到查询页面会重新触发查询
  if(addList.length > 0){

  }
}
