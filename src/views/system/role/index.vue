<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getRoleMenus,
  setRoleMenus,
  getMenuTree,
  type RoleInfo,
  type MenuInfo
} from "@/api/system";
import { ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import AddFill from "~icons/ri/add-circle-line";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Search from "~icons/ep/search";
import Refresh from "~icons/ep/refresh";
import MenuIcon from "~icons/ep/menu";

defineOptions({ name: "SystemRole" });

const loading = ref(false);
const dataList = ref<RoleInfo[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const keyword = ref("");

// 角色表单
const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const formData = reactive<Partial<RoleInfo>>({
  id: undefined,
  roleName: "",
  roleCode: "",
  description: "",
  sort: 0,
  status: 1
});

// 权限表单
const permDialogVisible = ref(false);
const permDialogTitle = ref("");
const currentRoleId = ref<number>(0);
const menuTreeData = ref<MenuInfo[]>([]);
const checkedMenuIds = ref<number[]>([]);
const menuTreeRef = ref<any>(null);
const defaultProps = {
  children: "children",
  label: "menuName"
};

const rules: FormRules = {
  roleName: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  roleCode: [{ required: true, message: "请输入角色代码", trigger: "blur" }]
};

const columns = [
  { label: "ID", prop: "id", width: 80 },
  { label: "角色名称", prop: "roleName", minWidth: 150 },
  { label: "角色代码", prop: "roleCode", minWidth: 150 },
  { label: "描述", prop: "description", minWidth: 200 },
  { label: "排序", prop: "sort", width: 100 },
  { label: "状态", prop: "status", width: 100, slot: "status" },
  { label: "创建时间", prop: "createdAt", minWidth: 180 },
  { label: "操作", fixed: "right", width: 280, slot: "operation" }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getRoleList({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined
    });
    if (res.code === 200) {
      dataList.value = res.data.list;
      total.value = res.data.total;
    }
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  dialogTitle.value = "新增角色";
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: RoleInfo) => {
  dialogTitle.value = "编辑角色";
  Object.assign(formData, row);
  dialogVisible.value = true;
};

// 打开权限设置弹窗
const handlePermission = async (row: RoleInfo) => {
  currentRoleId.value = row.id;
  permDialogTitle.value = `设置权限 - ${row.roleName}`;

  // 获取菜单树
  const menuRes = await getMenuTree();
  if (menuRes.code === 200) {
    menuTreeData.value = menuRes.data;
  }

  // 获取角色已有权限
  const roleMenuRes = await getRoleMenus(row.id);
  if (roleMenuRes.code === 200) {
    checkedMenuIds.value = roleMenuRes.data;
  }

  permDialogVisible.value = true;
};

// 保存权限设置
const handleSavePermission = async () => {
  if (!menuTreeRef.value) return;

  // 获取所有选中的节点
  const checkedKeys = menuTreeRef.value.getCheckedKeys();
  const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys();
  const allCheckedKeys = [...checkedKeys, ...halfCheckedKeys];

  const res = await setRoleMenus({
    roleId: currentRoleId.value,
    menuIds: allCheckedKeys
  });

  if (res.code === 200) {
    message("权限设置成功", { type: "success" });
    permDialogVisible.value = false;
  } else {
    message(res.message, { type: "error" });
  }
};

const handleDelete = (row: RoleInfo) => {
  ElMessageBox.confirm(`确定删除角色 "${row.roleName}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const res = await deleteRole(row.id);
    if (res.code === 200) {
      message("删除成功", { type: "success" });
      fetchData();
    } else {
      message(res.message, { type: "error" });
    }
  });
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async valid => {
    if (valid) {
      if (formData.id) {
        const res = await updateRole(formData);
        if (res.code === 200) {
          message("修改成功", { type: "success" });
          dialogVisible.value = false;
          fetchData();
        } else {
          message(res.message, { type: "error" });
        }
      } else {
        const res = await createRole(formData);
        if (res.code === 200) {
          message("添加成功", { type: "success" });
          dialogVisible.value = false;
          fetchData();
        } else {
          message(res.message, { type: "error" });
        }
      }
    }
  });
};

const resetForm = () => {
  formData.id = undefined;
  formData.roleName = "";
  formData.roleCode = "";
  formData.description = "";
  formData.sort = 0;
  formData.status = 1;
  formRef.value?.resetFields();
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  keyword.value = "";
  currentPage.value = 1;
  fetchData();
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
  fetchData();
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
          <span class="font-medium">角色管理</span>
        </div>
      </template>

      <!-- 搜索区域 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="keyword"
            placeholder="角色名称/角色代码"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :icon="useRenderIcon(Search)"
            @click="handleSearch"
          >
            搜索
          </el-button>
          <el-button :icon="useRenderIcon(Refresh)" @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <div class="mb-4">
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd"
        >
          新增角色
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="dataList"
        border
        stripe
        highlight-current-row
      >
        <el-table-column
          v-for="col in columns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :width="col.width"
          :min-width="col.minWidth"
          :fixed="col.fixed"
        >
          <template #default="{ row }">
            <template v-if="col.slot === 'status'">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? "启用" : "禁用" }}
              </el-tag>
            </template>
            <template v-else-if="col.slot === 'operation'">
              <el-button
                v-if="row.roleCode !== 'admin'"
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                v-if="row.roleCode !== 'admin'"
                link
                type="success"
                :icon="useRenderIcon(MenuIcon)"
                @click="handlePermission(row)"
              >
                权限
              </el-button>
              <el-button
                v-if="row.roleCode !== 'admin'"
                link
                type="danger"
                :icon="useRenderIcon(Delete)"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
            <template v-else>
              {{ row[col.prop] || "-" }}
            </template>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 角色表单弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input
              v-model="formData.roleName"
              placeholder="请输入角色名称"
            />
          </el-form-item>
          <el-form-item label="角色代码" prop="roleCode">
            <el-input
              v-model="formData.roleCode"
              placeholder="请输入角色代码"
              :disabled="!!formData.id"
            />
          </el-form-item>
          <el-form-item label="描述">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请输入角色描述"
            />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formData.sort" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">启用</el-radio>
              <el-radio :value="2">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>

      <!-- 权限设置弹窗 -->
      <el-dialog
        v-model="permDialogVisible"
        :title="permDialogTitle"
        width="500px"
        destroy-on-close
      >
        <div class="menu-tree-container">
          <el-tree
            ref="menuTreeRef"
            :data="menuTreeData"
            :props="defaultProps"
            :default-checked-keys="checkedMenuIds"
            node-key="id"
            show-checkbox
            default-expand-all
          />
        </div>
        <template #footer>
          <el-button @click="permDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermission"
            >确定</el-button
          >
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.menu-tree-container {
  max-height: 400px;
  overflow-y: auto;
}
</style>
