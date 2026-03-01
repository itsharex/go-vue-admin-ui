# 菜单管理使用指南

## 📋 菜单字段说明

### 1. 菜单名称
- **说明**：显示在左侧导航栏的文字
- **示例**：`用户管理`、`订单列表`、`数据统计`

### 2. 上级菜单
- **说明**：父级菜单的ID
- **填写规则**：
  - `0` = 顶级菜单（一级目录）
  - 其他数字 = 对应父级菜单的ID
- **示例**：如果要添加到"系统管理"下，填写系统管理的ID

### 3. 菜单类型
| 类型 | 说明 | 使用场景 |
|------|------|----------|
| **目录** | 文件夹，只用于分组 | 系统管理、用户中心 |
| **菜单** | 实际页面，可跳转 | 用户列表、角色管理 |
| **按钮** | 页面内操作权限 | 新增、编辑、删除按钮 |

### 4. 图标 ⭐
- **说明**：左侧导航栏显示的图标
- **格式**：`ri:图标名`
- **查找图标**：访问 [Remix Icon](https://remixicon.com/)
- **常用图标**：
  - `ri:user-line` - 用户
  - `ri:settings-3-line` - 设置
  - `ri:shopping-bag-line` - 商品
  - `ri:file-list-3-line` - 订单
  - `ri:money-cny-circle-line` - 财务
  - `ri:bar-chart-box-line` - 统计
  - `ri:home-line` - 首页

### 5. 路由路径 ⭐
- **说明**：浏览器地址栏显示的路径
- **格式**：以 `/` 开头
- **示例**：
  - 一级目录：`/goods`
  - 二级菜单：`/goods/list`
  - 三级菜单：`/goods/list/detail`

### 6. 组件路径 ⭐
- **说明**：前端页面文件的路径（相对于 `src/views`）
- **格式**：以 `/` 开头，不包含 `.vue` 后缀
- **对应文件**：`src/views/{组件路径}.vue`
- **示例**：
  | 组件路径 | 对应文件 |
  |----------|----------|
  | `/system/user/index` | `src/views/system/user/index.vue` |
  | `/goods/list` | `src/views/goods/list.vue` |
  | `/order/detail` | `src/views/order/detail.vue` |

### 7. 权限标识
- **说明**：后端接口权限控制标识
- **格式**：`模块:功能:操作`
- **示例**：
  - `system:user:list` - 查看用户列表
  - `system:user:create` - 创建用户
  - `system:user:update` - 更新用户
  - `system:user:delete` - 删除用户
  - `goods:list` - 查看商品列表
  - `order:export` - 导出订单

---

## 📝 新增菜单示例

### 示例1：添加"商品管理"模块

**步骤1：创建目录（一级菜单）**
```
菜单名称：商品管理
上级菜单：0
菜单类型：目录
图标：ri:shopping-bag-line
路由路径：/goods
组件路径：（空）
权限标识：（空）
排序：2
状态：显示
```

**步骤2：创建"商品列表"页面**
```
菜单名称：商品列表
上级菜单：6（商品管理的ID）
菜单类型：菜单
图标：ri:list-unordered
路由路径：/goods/list
组件路径：/goods/list
权限标识：goods:list
排序：1
状态：显示
```

### 示例2：添加"新增商品"按钮权限
```
菜单名称：新增商品
上级菜单：7（商品列表的ID）
菜单类型：按钮
图标：（空）
路由路径：（空）
组件路径：（空）
权限标识：goods:create
排序：1
状态：显示
```

---

## 💻 如何创建前端页面

### 步骤1：创建文件
在 `src/views/` 下创建对应的 `.vue` 文件

**示例**：创建商品列表页面
```
文件路径：src/views/goods/list.vue
```

### 步骤2：编写页面代码
```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { message } from "@/utils/message";

defineOptions({ name: "GoodsList" });

const loading = ref(false);
const dataList = ref([]);

const fetchData = async () => {
  loading.value = true;
  // 调用API获取数据
  // const res = await getGoodsList();
  // dataList.value = res.data;
  loading.value = false;
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="main">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="font-medium">商品列表</span>
        </div>
      </template>
      
      <!-- 你的页面内容 -->
      <p>这是商品列表页面</p>
      
    </el-card>
  </div>
</template>
```

### 步骤3：刷新页面
- 保存文件后，前端会自动编译
- 刷新浏览器即可看到新页面

---

## ⚠️ 注意事项

1. **组件路径必须正确**：路径对应的文件必须存在，否则页面显示404
2. **菜单类型选择**：
   - 一级菜单必须是"目录"
   - 二级菜单必须是"菜单"（选择目录会报错）
   - 操作按钮选择"按钮"
3. **权限分配**：
   - 新增菜单后，超级管理员自动获得权限
   - 其他角色需要在"角色管理"中手动分配
4. **路径规范**：
   - 路由路径必须以 `/` 开头
   - 组件路径对应实际的 `.vue` 文件
