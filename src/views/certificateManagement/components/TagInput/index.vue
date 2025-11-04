<template>
  <div class="tag-input">
    <!-- 已有标签 -->
    <div v-if="modelValue.length > 0" class="form-item-tag">
      <el-form :model="form" ref="formRef">
        <div v-for="(tag, index) in modelValue" :key="index" class="item-tag">
          <el-form-item :prop="`tags.${index}`" :rules="tagRules">
            <el-input
              v-model="form.tags[index]"
              placeholder="请输入标签"
              maxlength="50"
              @update:modelValue="updateTag($event, index)"
              clearable
            />
          </el-form-item>
          <el-icon class="cursor-pointer" @click="removeTag(index)">
            <Delete />
          </el-icon>
        </div>
      </el-form>
    </div>
    <!-- 添加标签 -->
    <div class="add-tag">
      <span @click="addTag" :class="{ 'is-disabled': modelValue.length >= max }">
        <el-icon><CirclePlus /></el-icon> 添加标签
      </span>
      <span> 还可添加 {{ max - modelValue.length }} 个标签 </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete, CirclePlus } from '@element-plus/icons-vue'
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
const props = defineProps<{
  modelValue: string[]
  max?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string[]): void
  (e: 'valid-change', isValid: boolean): void
}>()

const max = props.max ?? 50
const formRef = ref()
const isValid = ref(true)

const form = reactive({
  tags: props.modelValue // 直接同步外部值
})
// 校验整个表单并通知父组件
const validateForm = () => {
  if (!formRef.value) return

  formRef.value.validate((valid: boolean) => {
    isValid.value = valid
    emit('valid-change', valid) // 通知父组件校验状态
  })
}
// watch(
//   () => props.modelValue,
//   (newVal) => {
//     form.tags = [...newVal]
//     validateForm() // 值变化时重新校验
//   },
//   { immediate: true }
// )
// 校验规则
const tagRules = [
  {
    required: true,
    validator: (rule: any, value: string, callback: any) => {
      if (!value || !value.trim()) {
        return callback(new Error('标签内容不能为空'))
      }
      return callback()
    },
    trigger: 'change'
  }
]

// 提供给外部使用的校验方法
const validate = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!formRef.value) {
      resolve(true)
      return
    }
    formRef.value.validate((valid: boolean) => {
      // isValid.value = valid
      // emit('valid-change', valid)
      console.log('valid', valid)
      resolve(valid)
    })
  })
}
const onReset = () => {
  ;(formRef.value as any).resetFields()
}
// 暴露方法给父组件调用
defineExpose({
  validate,
  isValid: () => isValid.value,
  onReset
})
const addTag = () => {
  if (props.modelValue.length >= max) return
  emit('update:modelValue', [...props.modelValue, ''])
}

const removeTag = (index: number) => {
  const newTags = [...props.modelValue]
  newTags.splice(index, 1)
  emit('update:modelValue', newTags)
}
// 初始化时进行一次校验
onMounted(() => {
  validateForm()
})
const updateTag = (val: string, index: number) => {
  const newTags = [...props.modelValue]
  newTags[index] = val
  emit('update:modelValue', newTags)
}
</script>
<style lang="less" scoped>
:deep(.el-form-item--default) {
  margin-bottom: 0;
}
.form-item-tag {
  .item-tag {
    width: 100%;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    :deep(.el-input) {
      width: 230px;
      margin-right: 10px;
    }
  }
}
.add-tag {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  > span:nth-child(1) {
    display: flex;
    gap: 5px;
    color: rgb(22, 100, 255);
    align-items: center;
    margin-right: 8px;
    cursor: pointer;
  }
  .is-disabled {
    cursor: not-allowed !important;
    opacity: 0.6;
  }
}
</style>
