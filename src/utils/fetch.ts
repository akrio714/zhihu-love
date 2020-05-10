import app from "../main";
export function showErrorMsg(e: any) {
  console.error(e);
  app.$notification["error"]({
    message: "错误",
    description: e.message,
  });
}
