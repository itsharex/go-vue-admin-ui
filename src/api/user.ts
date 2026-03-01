import { http } from "@/utils/http";
import type { Result, LoginResult } from "./system";

// 类型别名，保持与原始代码兼容
export type UserResult = Result<LoginResult>;
export type RefreshTokenResult = Result<{
  token: string;
  expiresAt: number;
}>;

// 重新导出system中的方法，保持兼容性
export { login as getLogin } from "./system";

/** 刷新token（后端暂未实现，预留接口） */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>(
    "post",
    "/v1/system/refresh-token",
    {
      data
    }
  );
};

/** 获取用户信息 */
export const getUserProfile = () => {
  return http.request<Result<any>>("get", "/v1/system/user/info");
};
