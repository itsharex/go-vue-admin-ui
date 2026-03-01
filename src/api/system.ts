import { http } from "@/utils/http";

// ==================== 通用响应类型 ====================
export type Result<T = any> = {
  code: number;
  message: string;
  data: T;
};

export type PageResult<T = any> = {
  code: number;
  message: string;
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
};

// ==================== 用户管理 ====================
export type UserInfo = {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  email: string;
  phone: string;
  status: number;
  roleId: number;
  role?: RoleInfo;
  lastLoginIp: string;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  password?: string; // 仅用于创建/更新用户
};

export type LoginResult = {
  token: string;
  expiresAt: number;
  userInfo: UserInfo;
};

// 登录
export const login = (data: { username: string; password: string }) => {
  return http.request<Result<LoginResult>>("post", "/v1/system/login", {
    data
  });
};

// 登出
export const logout = () => {
  return http.request<Result<null>>("post", "/v1/system/logout");
};

// 获取当前用户信息
export const getUserInfo = () => {
  return http.request<Result<UserInfo>>("get", "/v1/system/user/info");
};

// 获取用户列表
export const getUserList = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: number;
}) => {
  return http.request<PageResult<UserInfo>>("get", "/v1/system/user/list", {
    params
  });
};

// 创建用户
export const createUser = (data: Partial<UserInfo> & { password: string }) => {
  return http.request<Result<number>>("post", "/v1/system/user/create", {
    data
  });
};

// 更新用户
export const updateUser = (data: Partial<UserInfo>) => {
  return http.request<Result<null>>("put", "/v1/system/user/update", {
    data
  });
};

// 删除用户
export const deleteUser = (id: number) => {
  return http.request<Result<null>>(
    "delete",
    `/v1/system/user/delete/${id}`
  );
};

// ==================== 角色管理 ====================
export type RoleInfo = {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
  status: number;
  sort: number;
  createdAt: string;
  updatedAt: string;
};

// 获取角色列表
export const getRoleList = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
}) => {
  return http.request<PageResult<RoleInfo>>("get", "/v1/system/role/list", {
    params
  });
};

// 获取角色详情
export const getRoleDetail = (id: number) => {
  return http.request<Result<RoleInfo>>(
    "get",
    `/v1/system/role/detail/${id}`
  );
};

// 创建角色
export const createRole = (data: Partial<RoleInfo>) => {
  return http.request<Result<number>>("post", "/v1/system/role/create", {
    data
  });
};

// 更新角色
export const updateRole = (data: Partial<RoleInfo>) => {
  return http.request<Result<null>>("put", "/v1/system/role/update", {
    data
  });
};

// 删除角色
export const deleteRole = (id: number) => {
  return http.request<Result<null>>(
    "delete",
    `/v1/system/role/delete/${id}`
  );
};

// 获取角色菜单权限
export const getRoleMenus = (id: number) => {
  return http.request<Result<number[]>>(
    "get",
    `/v1/system/role/menus/${id}`
  );
};

// 设置角色菜单权限
export const setRoleMenus = (data: { roleId: number; menuIds: number[] }) => {
  return http.request<Result<null>>("put", `/v1/system/role/menus`, {
    data
  });
};

// ==================== 菜单管理 ====================
export type MenuInfo = {
  id: number;
  parentId: number;
  menuName: string;
  menuType: number; // 1目录 2菜单 3按钮
  icon: string;
  path: string;
  component: string;
  perm: string;
  sort: number;
  status: number;
  visible: number;
  createdAt: string;
  updatedAt: string;
  children?: MenuInfo[];
};

// 获取菜单列表
export const getMenuList = () => {
  return http.request<Result<MenuInfo[]>>("get", "/v1/system/menu/list");
};

// 获取菜单树
export const getMenuTree = () => {
  return http.request<Result<MenuInfo[]>>("get", "/v1/system/menu/tree");
};

// 创建菜单
export const createMenu = (data: Partial<MenuInfo>) => {
  return http.request<Result<number>>("post", "/v1/system/menu/create", {
    data
  });
};

// 更新菜单
export const updateMenu = (data: Partial<MenuInfo>) => {
  return http.request<Result<null>>("put", "/v1/system/menu/update", {
    data
  });
};

// 删除菜单
export const deleteMenu = (id: number) => {
  return http.request<Result<null>>(
    "delete",
    `/v1/system/menu/delete/${id}`
  );
};

// 重置用户密码（管理员）
export const resetUserPassword = (id: number, password: string) => {
  return http.request<Result<null>>("put", `/v1/system/user/update`, {
    data: { id, password }
  });
};
