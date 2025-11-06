<template>
  <ManagementList
    ref="managementListRef"
    :title="title"
    :table-data="tableData"
    :columns="columns"
    :loading="loading"
    :total-records="totalRecords"
    :show-selection="true"
    :toolbar-buttons="toolbarButtons"
    :search-options="searchOptions"
    :bulk-actions="bulkActions"
    :query-params="queryParams"
    @search="handleSearch"
    @refresh="handleRefresh"
    @page-change="handlePageChange"
    @selection-change="handleSelectionChange"
    @bulk-action="handleBulkAction"
  >
    <template #columns>
      <el-table-column prop="userId" label="用户ID" />
      <el-table-column prop="username" label="用户名称" />
      <el-table-column prop="createTime" label="创建时间" sortable="custom" />
      <el-table-column prop="enable" label="用户状态">
        <template #default="scope">
          <el-switch
            v-model="scope.row.enable"
            active-color="#409EFF"
            inactive-color="#C0CCDA"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="roles" label="角色">
        <template #default="scope">
          <span>{{ scope.row.roles.map((role) => role.label).join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="groups" label="用户组">
        <template #default="scope">
          <span>{{ scope.row.groups.map((group) => group.label).join(', ') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="lastLogin" label="最近登录时间" sortable="custom" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="scope">
          <div class="table-button" @click="handleEdit(scope.row)">编辑</div>
          <el-dropdown @command="handleMoreAction" trigger="click">
            <div class="table-button">更多</div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'activeUser', row: scope.row }">
                  激活
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'assignRole', row: scope.row }">
                  分配角色
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'addToGroup', row: scope.row }">
                  添加至组
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'resetPassword', row: scope.row }">
                  重置密码
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', row: scope.row }"
                  divided
                  style="color: #f56c6c"
                >
                  删除用户
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </template>
  </ManagementList>

  <!-- 新建/编辑用户弹框 -->
  <CreateEditDialog
    v-model:visible="createEditDialogVisible"
    :create-title="'新建用户'"
    :edit-title="'编辑用户'"
    :fields="createEditFields"
    :default-form-data="currentEditData"
    :is-edit="isEdit"
    @confirm="handleCreateEditConfirm"
  />

  <!-- 邀请用户弹框 -->
  <InviteDialog
    v-model:visible="inviteDialogVisible"
    :title="'邀请用户'"
    :fields="inviteFields"
    @confirm="handleInviteConfirm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ManagementList } from '@/components/ManagementList'
import { CreateEditDialog, type FormField } from '@/components/CreateEditDialog'
import { InviteDialog, type InviteFormField } from '@/components/InviteDialog'
import type {
  TableColumn,
  ToolbarButton,
  SearchOption,
  BulkAction
} from '@/components/ManagementList'
import { apiGetRoleList } from '@/api/role'
import { apiGetusersList, apiCreateUser, apiEditUser, apiActiveUser } from '@/api/user'

const title = '用户'
const managementListRef = ref()
const tableData = ref<any[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const createEditDialogVisible = ref(false)
const inviteDialogVisible = ref(false)
const isEdit = ref(false)
const currentEditData = ref<any>({})
const selectedRows = ref<any[]>([])

const queryParams = reactive({
  page: 1,
  pageSize: 10
})

// 表格列配置
const columns: TableColumn[] = []

// 工具栏按钮
const toolbarButtons: ToolbarButton[] = [
  {
    key: 'create',
    label: '新建用户',
    type: 'primary',
    onClick: () => {
      isEdit.value = false
      currentEditData.value = {}
      createEditDialogVisible.value = true
    }
  },
  {
    key: 'invite',
    label: '邀请用户',
    type: 'primary',
    onClick: () => {
      inviteDialogVisible.value = true
    }
  }
]

// 搜索选项
const searchOptions: SearchOption[] = [{ label: '搜索用户名称', value: 'username' }]

// 批量操作
const bulkActions: BulkAction[] = [
  {
    key: 'addPermission',
    label: '添加权限',
    disabled: false,
    onClick: (rows) => {
      console.log('添加权限', rows)
    }
  },
  {
    key: 'addToGroup',
    label: '添加至组',
    disabled: false,
    onClick: (rows) => {
      console.log('添加至组', rows)
    }
  },
  {
    key: 'assignRole',
    label: '分配角色',
    disabled: false,
    onClick: (rows) => {
      console.log('分配角色', rows)
    }
  },
  {
    key: 'delete',
    label: '删除用户',
    disabled: false,
    onClick: (rows) => {
      handleBatchDelete(rows)
    }
  }
]

// 新建/编辑表单字段
const createEditFields: FormField[] = [
  {
    prop: 'username',
    label: '用户名称',
    type: 'input',
    placeholder: '仅支持英文、数字、和符号".-_",6-40个字符',
    required: true,
    maxlength: 64,
    rules: [
      {
        required: true,
        message: '请输入用户名称',
        trigger: 'blur'
      },
      {
        pattern: /^[a-zA-Z0-9\.\-_]{6,64}$/,
        message: '仅支持英文、数字、和符号".-_",6-40个字符',
        trigger: 'blur'
      }
    ]
  },
  {
    prop: 'email',
    label: '邮箱地址',
    type: 'email',
    required: true,
    rules: [
      {
        required: true,
        message: '请输入邮箱地址',
        trigger: 'blur'
      },
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: 'blur'
      }
    ]
  },
  {
    prop: 'rid',
    label: '角色',
    type: 'select',
    options: []
  },
  {
    prop: 'password',
    label: '登录密码',
    type: 'password',
    required: true,
    showGenerate: true
  },
  {
    prop: 'description',
    label: '备注',
    type: 'textarea',
    maxlength: 128,
    showWordLimit: true,
    placeholder: '不超过128个字符',
    rows: 3
  }
]

// 邀请表单字段
const inviteFields: InviteFormField[] = [
  {
    prop: 'email',
    label: '邮箱地址',
    type: 'email',
    required: true
  },
  {
    prop: 'permission',
    label: '权限名称',
    type: 'select',
    placeholder: '请选择权限',
    options: [
      { label: '权限A', value: '权限A' },
      { label: '权限B', value: '权限B' },
      { label: '权限C', value: '权限C' }
    ]
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    rows: 3
  }
]

// 获取角色列表
const getRoleList = async () => {
  try {
    const { data, code } = await apiGetRoleList({})
    if (code === 200 && data?.list) {
      // 找到角色字段并更新选项
      const roleField = createEditFields.find((field) => field.prop === 'rid')
      if (roleField) {
        roleField.options = data.list.map((role) => ({
          label: role.name,
          value: +role.id
        }))
      }
    }
  } catch (error) {
    console.error('获取角色列表失败', error)
  }
}

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await apiGetusersList(queryParams)
    tableData.value = res.data.list
    totalRecords.value = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = (params: any) => {
  Object.assign(queryParams, params)
  queryParams.page = 1
  getList()
}

// 刷新
const handleRefresh = (params: any) => {
  Object.assign(queryParams, params)
  getList()
}

// 分页变化
const handlePageChange = (page: number, pageSize: number) => {
  queryParams.page = page
  queryParams.pageSize = pageSize
  getList()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 批量操作
const handleBulkAction = (actionKey: string, rows: any[]) => {
  console.log('批量操作', actionKey, rows)
}

// 编辑
const handleEdit = (row: any) => {
  isEdit.value = true
  currentEditData.value = { ...row }
  createEditDialogVisible.value = true
}

// 状态变化
const handleStatusChange = async (row: any) => {
  await apiActiveUser({
    actionIds: [row.userId],
    action: row.enable ? 'USER_ACTION_DISABLE' : 'USER_ACTION_ENABLE'
  })
  ElMessage.closeAll()
  setTimeout(() => {
    ElMessage.success(`${row.enable ? '启用' : '禁用'}成功`)
  }, 10)
}
// 激活用户
const handleActiveUser = async (row: any) => {
  await apiActiveUser({
    actionIds: [row.userId],
    action: 'USER_ACTION_ACTIVE'
  })
  ElMessage.success('激活成功')
}
// 更多操作
const handleMoreAction = ({ action, row }: { action: string; row: any }) => {
  switch (action) {
    case 'activeUser':
      handleActiveUser(row)
      break
    case 'assignRole':
      ElMessage.info('分配角色功能待实现')
      break
    case 'addToGroup':
      ElMessage.info('添加至组功能待实现')
      break
    case 'resetPassword':
      ElMessage.info('重置密码功能待实现')
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 删除单个用户
const handleDelete = async (row?: any) => {
  await ElMessageBox.confirm(`确认删除【${row.username}】，删除后用户将无法登录`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await apiActiveUser({
    actionIds: [row.userId],
    action: 'USER_ACTION_DELETE'
  })
  ElMessage.success('删除成功')
  getList()
}

// 批量删除
const handleBatchDelete = async (rows: any[]) => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的${rows.length}个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用API批量删除
    ElMessage.success('删除成功')
    getList()
  } catch {
    // 用户取消
  }
}

// 新建/编辑确认
const handleCreateEditConfirm = async (formData: any, done: (success: boolean) => void) => {
  try {
    console.log('提交表单', formData)
    if (isEdit.value) {
      await apiEditUser(formData)
    } else {
      await apiCreateUser(formData)
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
    getList()
    done(true) // 成功时调用 done(true)
  } catch (error: any) {
    console.error('保存失败', error)
    ElMessage.error(error?.message || (isEdit.value ? '编辑失败' : '创建失败'))
    done(false) // 失败时调用 done(false)
  }
}

// 邀请确认
const handleInviteConfirm = (formData: any) => {
  console.log('邀请用户', formData)
  // TODO: 调用API邀请
  ElMessage.success('邀请成功')
  getList()
}

onMounted(() => {
  getList()
  getRoleList()
})
</script>

<style lang="less" scoped>
:deep(.el-link) {
  font-size: 13px;
}
</style>
