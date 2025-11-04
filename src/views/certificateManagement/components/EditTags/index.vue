<template>
  <el-dialog
    v-model="visible"
    width="600"
    :style="{ height: '70vh', overflow: 'auto' }"
    :with-header="true"
    class="upload-certificate"
    title="编辑标签"
  >
    <div class="title-container">实例信息</div>
    <Table :columns="columns" :data="tableDataList" />
    <div class="title-container"
      >标签
      <el-tooltip
        content="支持通过标签标记资源，从不同维度实现云资源分类与聚合。"
        placement="top"
        effect="light"
      >
        <el-icon><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>
    <TagInput v-model="tags" ref="tagInputRef" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel()">取消</el-button>
        <el-button type="primary" @click="submitForm()"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { ElTooltip, ElTag } from 'element-plus'

import { Table, TableColumn } from '@/components/Table'
import TagInput from '../TagInput/index.vue'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  tags: {
    type: Array<string>,
    default: () => []
  },
  tableDataList: {
    type: Array<any>,
    default: () => []
  }
})
const tagInputRef = ref<InstanceType<typeof TagInput> | null>(null)

const emit = defineEmits(['update:visible', 'update:tags', 'confirmEditTags'])
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})
const tags = computed({
  get: () => props.tags,
  set: (val) => emit('update:tags', val)
})
const columns: TableColumn[] = [
  {
    field: 'subjectNames',
    label: '绑定域名',
    slots: {
      default: ({ row }) => {
        const names: string[] = Array.isArray(row.subjectNames) ? row.subjectNames : []

        return h(
          'div',
          { class: 'subject-list' },
          names.map((item, idx) =>
            // 外层包一个块级 div，并且给 key，防止 Vue 复用组件实例
            h(
              'div',
              {
                key: `${item}-${idx}`,
                style: {
                  display: 'block', // 每个 item 换行
                  marginBottom: '8px' // 间距（按需调整）
                }
              },
              [
                h(
                  ElTooltip,
                  {
                    content: item,
                    placement: 'top',
                    effect: 'light'
                  },
                  {
                    default: () => h(ElTag, { type: 'info', class: 'bottom-10' }, () => item)
                  }
                )
              ]
            )
          )
        )
      }
    }
  },
  {
    field: 'id',
    label: 'ID'
  }
]
const handleCancel = () => {
  visible.value = false
}
const submitForm = async () => {
  const tagsValid = await tagInputRef.value?.validate()
  if (!tagsValid) {
    return
  }
  emit('confirmEditTags')
  visible.value = false
}
</script>
<style lang="less" scoped>
.title-container {
  font-size: 13px;
  margin: 20px 0 10px;
}
</style>
