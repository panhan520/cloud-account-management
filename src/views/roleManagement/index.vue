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
      <el-table-column prop="id" label="角色ID" width="100" />
      <el-table-column prop="name" label="角色名称" />
      <el-table-column prop="createTime" label="创建时间" sortable="custom" width="180" />
      <el-table-column prop="status" label="角色状态" width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            :active-value="'开'"
            :inactive-value="'关'"
            active-color="#409EFF"
            inactive-color="#C0CCDA"
            @change="handleStatusChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="permissionCount" label="权限数量" width="100" />
      <el-table-column prop="userCount" label="用户数量" width="100" />
      <el-table-column prop="remark" label="备注" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
          <el-dropdown @command="handleMoreAction" trigger="click">
            <el-link type="primary" style="margin-left: 12px">更多</el-link>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ action: 'assignPermission', row: scope.row }">
                  分配权限
                </el-dropdown-item>
                <el-dropdown-item :command="{ action: 'manageUsers', row: scope.row }">
                  管理用户
                </el-dropdown-item>
                <el-dropdown-item
                  :command="{ action: 'delete', row: scope.row }"
                  divided
                  style="color: #f56c6c"
                >
                  删除角色
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </template>
  </ManagementList>

  <!-- 新建/编辑角色弹框 -->
  <CreateEditDialog
    v-model:visible="createEditDialogVisible"
    :create-title="'新建角色'"
    :edit-title="'编辑角色'"
    :fields="createEditFields"
    :default-form-data="currentEditData"
    :is-edit="isEdit"
    @confirm="handleCreateEditConfirm"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ManagementList } from '@/components/ManagementList'
import { CreateEditDialog, type FormField } from '@/components/CreateEditDialog'
import type { ToolbarButton, SearchOption, BulkAction } from '@/components/ManagementList'

const title = '角色管理'
const managementListRef = ref()
const tableData = ref<any[]>([])
const loading = ref(false)
const totalRecords = ref(0)
const createEditDialogVisible = ref(false)
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
    label: '新建角色',
    type: 'primary',
    onClick: () => {
      isEdit.value = false
      currentEditData.value = {}
      createEditDialogVisible.value = true
    }
  }
]

// 搜索选项
const searchOptions: SearchOption[] = [{ label: '搜索角色名称', value: 'nameKeyword' }]

// 批量操作
const bulkActions: BulkAction[] = [
  {
    key: 'assignPermission',
    label: '分配权限',
    disabled: false,
    onClick: (rows) => {
      console.log('分配权限', rows)
    }
  },
  {
    key: 'delete',
    label: '删除角色',
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
    label: '角色名称',
    type: 'input',
    placeholder: '请输入角色名称',
    required: true,
    maxlength: 64,
    showWordLimit: true,
    hint: '仅支持英文、数字、和符号".-_",不超过64个字符'
  },
  {
    prop: 'remark',
    label: '备注',
    type: 'textarea',
    maxlength: 128,
    showWordLimit: true,
    hint: '不超过128个字符',
    rows: 3
  }
]

// 获取列表数据
const getList = async () => {
  try {
    loading.value = true
    // TODO: 调用API获取数据
    setTimeout(() => {
      tableData.value = [
        {
          id: 1,
          name: '角色A',
          createTime: '2025-09-07 17:23:00',
          status: '开',
          permissionCount: 10,
          userCount: 5,
          remark: ''
        },
        {
          id: 2,
          name: '角色B',
          createTime: '2025-09-03 17:23:00',
          status: '关',
          permissionCount: 8,
          userCount: 3,
          remark: ''
        }
      ]
      totalRecords.value = 2
      loading.value = false
    }, 300)
  } catch (error) {
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
    case 'assignPermission':
      ElMessage.info('分配权限功能待实现')
      break
    case 'manageUsers':
      ElMessage.info('管理用户功能待实现')
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 删除单个角色
const handleDelete = async (row?: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
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
    await ElMessageBox.confirm(`确定要删除选中的${rows.length}个角色吗？`, '提示', {
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

onMounted(() => {
  getList()
})
</script>

<style lang="less" scoped>
:deep(.el-link) {
  font-size: 13px;
}
</style>
