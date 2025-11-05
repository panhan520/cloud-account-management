<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? editTitle : createTitle"
    width="600"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" @submit.prevent>
      <el-form-item
        v-for="field in fields"
        :key="field.prop"
        :label="field.label"
        :prop="field.prop"
        :required="field.required"
      >
        <!-- 输入框 -->
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          :maxlength="field.maxlength"
          :show-word-limit="field.showWordLimit"
          clearable
        />
        <!-- 邮箱输入框 -->
        <el-input
          v-else-if="field.type === 'email'"
          v-model="formData[field.prop]"
          placeholder="请输入邮箱地址"
          clearable
        />
        <!-- 密码输入框 -->
        <template v-else-if="field.type === 'password'">
          <div class="password-input-wrapper">
            <el-input
              v-model="formData[field.prop]"
              type="password"
              :placeholder="field.placeholder"
              :maxlength="field.maxlength"
              show-password
              clearable
            />
            <el-link
              v-if="field.showGenerate"
              type="primary"
              class="generate-link"
              @click="handleGeneratePassword(field.prop)"
            >
              一键生成
            </el-link>
          </div>
          <div v-if="field.hint" class="field-hint">{{ field.hint }}</div>
        </template>
        <!-- 选择器 -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || '请选择'"
          clearable
          style="width: 100%"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <!-- 多行文本 -->
        <el-input
          v-else-if="field.type === 'textarea'"
          v-model="formData[field.prop]"
          type="textarea"
          :placeholder="field.placeholder"
          :maxlength="field.maxlength"
          :show-word-limit="field.showWordLimit"
          :rows="field.rows || 3"
        />
        <!-- 提示信息 -->
        <div v-if="field.hint && field.type !== 'password'" class="field-hint">
          {{ field.hint }}
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface FormField {
  prop: string
  label: string
  type: 'input' | 'email' | 'password' | 'select' | 'textarea'
  placeholder?: string
  required?: boolean
  maxlength?: number
  showWordLimit?: boolean
  hint?: string
  rows?: number
  showGenerate?: boolean // 仅用于密码类型
  options?: Array<{ label: string; value: any }> // 仅用于select类型
  rules?: any[] // 自定义验证规则
}

interface Props {
  visible: boolean
  createTitle?: string
  editTitle?: string
  fields: FormField[]
  defaultFormData?: Record<string, any>
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  createTitle: '新建',
  editTitle: '编辑',
  fields: () => [],
  defaultFormData: () => ({}),
  isEdit: false
})

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', formData: Record<string, any>): void
  (e: 'cancel'): void
}>()

const formRef = ref<FormInstance>()
const formData = reactive<Record<string, any>>({})

const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 生成密码规则
const generatePassword = () => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

const handleGeneratePassword = (prop: string) => {
  formData[prop] = generatePassword()
}

// 构建表单验证规则
const rules = computed<FormRules>(() => {
  const formRules: FormRules = {}
  props.fields.forEach((field) => {
    if (field.required || field.rules) {
      const fieldRules: any[] = []
      if (field.required) {
        fieldRules.push({
          required: true,
          message: `请输入${field.label}`,
          trigger: field.type === 'select' ? 'change' : 'blur'
        })
      }
      if (field.rules) {
        fieldRules.push(...field.rules)
      }
      // 邮箱验证
      if (field.type === 'email') {
        fieldRules.push({
          type: 'email',
          message: '请输入正确的邮箱地址',
          trigger: 'blur'
        })
      }
      formRules[field.prop] = fieldRules
    }
  })
  return formRules
})

// 初始化表单数据
const initFormData = () => {
  props.fields.forEach((field) => {
    if (props.isEdit && props.defaultFormData[field.prop] !== undefined) {
      formData[field.prop] = props.defaultFormData[field.prop]
    } else {
      formData[field.prop] = field.type === 'select' ? undefined : ''
    }
  })
}

// 监听 visible 变化，初始化表单
watch(
  () => props.visible,
  (val) => {
    if (val) {
      initFormData()
    } else {
      formRef.value?.resetFields()
    }
  },
  { immediate: true }
)

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleClose = () => {
  formRef.value?.resetFields()
  emit('cancel')
}

const handleConfirm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    emit('confirm', { ...formData })
    visible.value = false
  } catch (error) {
    console.log('表单验证失败', error)
  }
}
</script>

<style lang="less" scoped>
.password-input-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  .generate-link {
    font-size: 12px;
    white-space: nowrap;
  }
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
