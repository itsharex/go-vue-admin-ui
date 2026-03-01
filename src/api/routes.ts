import { http } from "@/utils/http";

export type RouteResult = {
  code: number;
  message: string;
  data: Array<any>;
};

/** 获取动态路由菜单（根据当前用户角色权限） */
export const getAsyncRoutes = () => {
  return http.request<RouteResult>("get", "/v1/system/routes");
};
