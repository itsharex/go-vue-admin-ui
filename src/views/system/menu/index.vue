<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from "vue";
import { message } from "@/utils/message";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  getMenuTree,
  createMenu,
  updateMenu,
  deleteMenu,
  type MenuInfo
} from "@/api/system";
import { ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import AddFill from "~icons/ri/add-circle-line";
import EditPen from "~icons/ep/edit-pen";
import Delete from "~icons/ep/delete";
import Refresh from "~icons/ep/refresh";

defineOptions({ name: "SystemMenu" });

const loading = ref(false);
const dataList = ref<MenuInfo[]>([]);

const dialogVisible = ref(false);
const dialogTitle = ref("");
const formRef = ref<FormInstance>();
const formData = reactive<Partial<MenuInfo>>({
  id: undefined,
  parentId: 0,
  menuName: "",
  menuType: 1,
  icon: "",
  path: "",
  component: "",
  perm: "",
  sort: 0,
  status: 1,
  visible: 1
});

const menuTypeOptions = [
  { label: "目录", value: 1 },
  { label: "菜单", value: 2 },
  { label: "按钮", value: 3 }
];

// 可选的上级菜单（只显示目录类型）
const parentMenuOptions = computed(() => {
  const options = [{ id: 0, menuName: "顶级菜单" }];
  const findDirectories = (menus: MenuInfo[]) => {
    menus.forEach(menu => {
      if (menu.menuType === 1) {
        options.push(menu);
        if (menu.children) {
          findDirectories(menu.children);
        }
      }
    });
  };
  findDirectories(dataList.value);
  return options;
});

// 当前选中的上级菜单（用于确保新增时能正确显示）
const currentParentMenu = ref<MenuInfo | null>(null);

const rules: FormRules = {
  menuName: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
  menuType: [{ required: true, message: "请选择菜单类型", trigger: "change" }],
  path: [{ required: true, message: "请输入路由路径", trigger: "blur" }],
  component: [
    {
      required: true,
      message: "请输入组件路径",
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (formData.menuType === 2 && !value) {
          callback(new Error("菜单类型必须填写组件路径"));
        } else {
          callback();
        }
      }
    }
  ]
};

const columns = [
  { label: "菜单名称", prop: "menuName", minWidth: 180, slot: "menuName" },
  { label: "图标", prop: "icon", width: 80, slot: "icon" },
  { label: "类型", prop: "menuType", width: 100, slot: "menuType" },
  { label: "路由路径", prop: "path", minWidth: 150 },
  { label: "组件路径", prop: "component", minWidth: 200 },
  { label: "权限标识", prop: "perm", minWidth: 150 },
  { label: "排序", prop: "sort", width: 80 },
  { label: "状态", prop: "status", width: 100, slot: "status" },
  { label: "操作", fixed: "right", width: 220, slot: "operation" }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getMenuTree();
    if (res.code === 200) {
      dataList.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

const handleAdd = (row?: MenuInfo) => {
  dialogTitle.value = "新增菜单";
  resetForm();
  currentParentMenu.value = null;
  if (row) {
    // 如果是添加子菜单，设置父级ID，并且默认菜单类型为菜单（不能是目录）
    formData.parentId = row.id;
    currentParentMenu.value = row; // 保存当前选中的父菜单，确保能正确显示
    // 如果父级不是顶级菜单（parentId > 0），则只能是菜单或按钮，不能是目录
    if (row.parentId && row.parentId > 0) {
      formData.menuType = 2; // 默认为菜单
    }
  }
  dialogVisible.value = true;
};

const handleEdit = (row: MenuInfo) => {
  dialogTitle.value = "编辑菜单";
  Object.assign(formData, row);
  dialogVisible.value = true;
};

const handleDelete = (row: MenuInfo) => {
  ElMessageBox.confirm(`确定删除菜单 "${row.menuName}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(async () => {
    const res = await deleteMenu(row.id);
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
      // 准备提交的数据
      const submitData = { ...formData };

      // 目录类型或按钮类型，清空组件路径
      if (submitData.menuType !== 2) {
        submitData.component = "";
      }

      // 确保路径以 / 开头
      if (submitData.path && !submitData.path.startsWith("/")) {
        submitData.path = "/" + submitData.path;
      }

      if (submitData.id) {
        const res = await updateMenu(submitData);
        if (res.code === 200) {
          message("修改成功", { type: "success" });
          dialogVisible.value = false;
          fetchData();
        } else {
          message(res.message, { type: "error" });
        }
      } else {
        const res = await createMenu(submitData);
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
  formData.parentId = 0;
  formData.menuName = "";
  formData.menuType = 1;
  formData.icon = "";
  formData.path = "";
  formData.component = "";
  formData.perm = "";
  formData.sort = 0;
  formData.status = 1;
  formData.visible = 1;
  formRef.value?.resetFields();
};

const handleRefresh = () => {
  // 清空数据再重新加载，确保刷新效果
  dataList.value = [];
  nextTick(() => {
    fetchData();
  });
};

const getMenuTypeLabel = (type: number) => {
  const map: Record<number, string> = { 1: "目录", 2: "菜单", 3: "按钮" };
  return map[type] || "未知";
};

const getMenuTypeTag = (type: number): any => {
  const map: Record<number, any> = {
    1: "primary",
    2: "success",
    3: "warning"
  };
  return map[type] || "";
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
          <span class="font-medium">菜单管理</span>
        </div>
      </template>

      <!-- 操作按钮 -->
      <div class="mb-4">
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="handleAdd()"
        >
          新增菜单
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="handleRefresh">
          刷新
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="dataList"
        border
        stripe
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
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
            <template v-if="col.slot === 'menuName'">
              {{ row.menuName }}
            </template>
            <template v-else-if="col.slot === 'icon'">
              <component
                :is="useRenderIcon(row.icon || 'ri:folder-line')"
                v-if="row.icon"
              />
              <span v-else>-</span>
            </template>
            <template v-else-if="col.slot === 'menuType'">
              <el-tag :type="getMenuTypeTag(row.menuType)">
                {{ getMenuTypeLabel(row.menuType) }}
              </el-tag>
            </template>
            <template v-else-if="col.slot === 'status'">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? "显示" : "隐藏" }}
              </el-tag>
            </template>
            <template v-else-if="col.slot === 'operation'">
              <el-button
                link
                type="primary"
                :icon="useRenderIcon(AddFill)"
                @click="handleAdd(row)"
              >
                新增
              </el-button>
              <el-button
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
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

      <!-- 弹窗表单 -->
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
          <el-form-item label="菜单类型" prop="menuType">
            <el-radio-group v-model="formData.menuType">
              <el-radio
                :value="1"
                :disabled="formData.parentId > 0"
                :title="formData.parentId > 0 ? '二级菜单不能选择目录' : ''"
              >
                目录
              </el-radio>
              <el-radio :value="2">菜单</el-radio>
              <el-radio :value="3">按钮</el-radio>
            </el-radio-group>
            <div
              v-if="formData.parentId > 0"
              class="text-gray-400 text-xs mt-1"
            >
              二级菜单不能选择目录类型
            </div>
          </el-form-item>
          <el-form-item label="菜单名称" prop="menuName">
            <el-input
              v-model="formData.menuName"
              placeholder="请输入菜单名称"
            />
          </el-form-item>
          <el-form-item label="上级菜单">
            <el-select
              v-model="formData.parentId"
              placeholder="请选择上级菜单"
              style="width: 100%"
            >
              <el-option
                v-for="menu in [
                  ...parentMenuOptions,
                  ...(currentParentMenu &&
                  !parentMenuOptions.some(m => m.id === currentParentMenu.id)
                    ? [currentParentMenu]
                    : [])
                ]"
                :key="menu.id"
                :label="menu.menuName"
                :value="menu.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="formData.menuType !== 3" label="图标">
            <el-input v-model="formData.icon" placeholder="请输入图标名称" />
          </el-form-item>
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="formData.path" placeholder="请输入路由路径" />
          </el-form-item>
          <el-form-item
            v-if="formData.menuType === 2"
            label="组件路径"
            prop="component"
          >
            <el-input
              v-model="formData.component"
              placeholder="请输入组件路径，如：/system/user/index"
            />
          </el-form-item>
          <el-form-item label="权限标识">
            <el-input
              v-model="formData.perm"
              placeholder="请输入权限标识，如：system:user:list"
            />
          </el-form-item>
          <el-form-item label="排序">
            <el-input-number v-model="formData.sort" :min="0" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="formData.status">
              <el-radio :value="1">显示</el-radio>
              <el-radio :value="2">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
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
</style>
