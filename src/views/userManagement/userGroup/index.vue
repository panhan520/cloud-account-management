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
      <el-table-column prop="name" label="用户组名称" />
      <el-table-column prop="createdAt" label="创建时间" sortable="custom" width="180" />
      <el-table-column prop="memberCount" label="用户数" />
      <el-table-column prop="roleNames" label="权限数" width="100" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
          <el-dropdown @command="handleMoreAction" trigger="click">
            <el-link type="primary" style="margin-left: 12px">更多</el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'assignRole', row: scope.row }">
                  分配角色
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'addPermission', row: scope.row }">
                  添加权限
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'manageMembers', row: scope.row }">
                  管理成员
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', row: scope.row }"
                  divided
                  style="color: #f56c6c"
                >
                  删除用户组
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </template>
  </ManagementList>

  <!-- 新建/编辑用户组弹框 -->
  <CreateEditDialog
    v-model:visible="createEditDialogVisible"
    :create-title="'新建用户组'"
    :edit-title="'编辑用户组'"
    :fields="createEditFields"
    :default-form-data="currentEditData"
    :is-edit="isEdit"
    @confirm="handleCreateEditConfirm"
  />

  <!-- 邀请用户组弹框 -->
  <InviteDialog
    v-model:visible="inviteDialogVisible"
    :title="'邀请用户组'"
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
import type { ToolbarButton, SearchOption, BulkAction } from '@/components/ManagementList'
import { apiGetGroupsList } from '@/api/userGroup'

const title = '用户组'
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
  pageSize: 10,
  nameKeyword: ''
})

// 表格列配置
const columns: any[] = []

// 工具栏按钮
const toolbarButtons: ToolbarButton[] = [
  {
    key: 'create',
    label: '新建用户组',
    type: 'primary',
    onClick: () => {
      isEdit.value = false
      currentEditData.value = {}
      createEditDialogVisible.value = true
    }
  },
  {
    key: 'invite',
    label: '邀请用户组',
    type: 'primary',
    onClick: () => {
      inviteDialogVisible.value = true
    }
  }
]

// 搜索选项
const searchOptions: SearchOption[] = [{ label: '搜索用户组名称', value: 'nameKeyword' }]

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
    key: 'assignRole',
    label: '分配角色',
    disabled: false,
    onClick: (rows) => {
      console.log('分配角色', rows)
    }
  },
  {
    key: 'delete',
    label: '删除用户组',
    disabled: false,
    onClick: (rows) => {
      handleBatchDelete(rows)
    }
  }
]

// 新建/编辑表单字段
const createEditFields: FormField[] = [
  {
    prop: 'name',
    label: '用户组名称',
    type: 'input',
    placeholder: '仅支持英文、数字、和符号".-_",不超过64个字符',
    required: true,
    maxlength: 64
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
      { label: '权限B', value: '权限B' }
    ]
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    rows: 3
  }
]

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    const res = await apiGetGroupsList({})
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
const handleStatusChange = (row: any) => {
  console.log('状态变化', row)
  ElMessage.success('状态更新成功')
}

// 更多操作
const handleMoreAction = ({ action, row }: { action: string; row: any }) => {
  switch (action) {
    case 'assignRole':
      ElMessage.info('分配角色功能待实现')
      break
    case 'addPermission':
      ElMessage.info('添加权限功能待实现')
      break
    case 'manageMembers':
      ElMessage.info('管理成员功能待实现')
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 删除单个用户组
const handleDelete = async (row?: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户组吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    // TODO: 调用API删除，使用 row.id
    ElMessage.success('删除成功')
    getList()
  } catch {
    // 用户取消
  }
}

// 批量删除
const handleBatchDelete = async (rows: any[]) => {
  try {
    await ElMessageBox.confirm(`确定要删除选中的${rows.length}个用户组吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('删除成功')
    getList()
  } catch {
    // 用户取消
  }
}

// 新建/编辑确认
const handleCreateEditConfirm = (formData: any) => {
  console.log('提交表单', formData)
  ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
  getList()
}

// 邀请确认
const handleInviteConfirm = (formData: any) => {
  console.log('邀请用户组', formData)
  ElMessage.success('邀请成功')
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style lang="less" scoped>
:deep(.el-link) {
  font-size: 13px;
}
</style>
