<template>
  <el-dialog v-model="visible" width="600" title="确定删除该证书吗？">
    <!-- 提示信息 -->
    <div class="info">
      <el-icon color="rgba(208,141,6)" :size="20"><WarningFilled /></el-icon>
      <ul>
        <li>
          删除证书可能会面临业务中断的风险，请预先全面排查本证书在云产品的部署状态，确认无风险后再进行删除操作。
        </li>
      </ul>
    </div>
    <!-- 表单 -->
    <el-form :model="ruleForm" :rules="rules" ref="ruleFormRef">
      <!-- 证书标准 -->
      <el-form-item prop="isHasRisk">
        <el-checkbox v-model="ruleForm.isHasRisk" label="已确认无风险" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel(ruleFormRef)">取消</el-button>
        <el-button type="danger" @click="handleConfirm(ruleFormRef)"> 删除 </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, reactive, toRaw } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { computed } from 'vue'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:visible', 'confirmDelete'])
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive({
  isHasRisk: false
})
const rules = reactive<FormRules>({
  isHasRisk: [
    {
      validator: (rule, value, callback) => {
        if (value === true) {
          callback() // 校验通过
        } else {
          callback(new Error('请勾选'))
        }
      },
      trigger: 'change'
    }
  ]
})
// 取消
const handleCancel = (formEl: FormInstance | undefined) => {
  visible.value = false
  if (!formEl) return
  formEl.resetFields()
}
const handleConfirm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      visible.value = false
      emit('confirmDelete')
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>
<style lang="less" scoped>
.title-container {
  font-size: 13px;
  margin: 20px 0 10px;
}
.info {
  display: flex;
  padding: 9px 24px;
  gap: 8px;
  background-color: rgba(254, 248, 235);
  margin-bottom: 16px;
  font-size: 13px;
  i {
    margin-right: 10px;
    margin-top: 4px;
  }
  ul {
    list-style: none;
    li {
      line-height: 22px;
    }
  }
}
</style>
