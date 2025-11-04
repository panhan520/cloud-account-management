<template>
  <el-dialog
    v-model="visible"
    width="900"
    :style="{ height: '80vh', overflow: 'auto' }"
    :with-header="true"
    class="upload-certificate"
  >
    <!-- 自定义 header -->
    <template #title>
      <div class="custom-header">
        <span>上传证书</span>
        <!-- 提示信息 -->
        <div class="info">
          <el-icon><WarningFilled color="#1759dd" /></el-icon>
          <ul>
            <li>
              您可以将第三方证书服务商处导出的证书上传托管至火山引擎证书中心，便于统一管理及使用。
            </li>
            <li>上传证书时，证书文件和私钥文件都是必须的。</li>
          </ul>
        </div>
      </div>
    </template>
    <div class="upload-certificate-dialog-content">
      <!-- 表单 -->
      <el-form label-width="160px" :model="ruleForm" :rules="rules" ref="ruleFormRef">
        <!-- 证书标准 -->
        <el-form-item label="证书标准" prop="standards">
          <el-radio-group v-model="ruleForm.standards" text-color="#1664ff" fill="#f4f7ff">
            <el-radio-button border label="gj">国际标准</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 密钥算法 -->
        <el-form-item label="密钥算法" prop="algorithm">
          <el-radio-group v-model="ruleForm.algorithm" text-color="#1664ff" fill="#f4f7ff">
            <el-radio-button border label="rsa">RSA / ECC 算法</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 上传方式 -->
        <el-form-item label="上传方式" prop="mode">
          <el-radio-group
            v-model="ruleForm.mode"
            text-color="#1664ff"
            fill="#f4f7ff"
            @click="resetForm(ruleFormRef)"
          >
            <el-radio-button border label="input">手动输入</el-radio-button>
            <el-radio-button border label="file">文件上传</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- 证书文件 -->
        <el-form-item label="证书文件" prop="certificatePem">
          <el-upload
            v-if="ruleForm.mode === 'file'"
            class="upload-demo"
            drag
            action="#"
            accept=".crt,.pem"
            :auto-upload="false"
            :file-list="fileList"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">点击或拖拽文件到此处上传</div>
          </el-upload>
          <el-input
            v-else
            v-model="ruleForm.certificatePem"
            :rows="12"
            type="textarea"
            placeholder="请将文件内容复制粘贴到这里，示例：
-----BEGIN CERTIFICATE-----
…
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
…
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
…
-----END CERTIFICATE-----"
          />
        </el-form-item>
        <el-form-item>
          <div class="form-item-desc">
            <p>1. 请使用PEM编码格式的证书文件（文件扩展名为CRT或PEM）</p>
            <p
              >2. 可以只提供针对域名颁发的证书（包含一个 -----BEGIN CERTIFICATE----- 和一个 -----END
              CERTIFICATE-----），或者提供完整的证书链（包含多段证书）。</p
            >
          </div>
        </el-form-item>

        <el-form-item label="证书私钥文件" prop="privateKeyPem">
          <el-upload
            v-if="ruleForm.mode === 'file'"
            class="upload-demo"
            drag
            action="#"
            accept=".key,.pem"
            :auto-upload="false"
            :on-change="handleFileChangeKey"
            :file-list="fileListKey"
            :on-remove="handleFileRemoveKey"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">点击或拖拽文件到此处上传</div>
          </el-upload>
          <el-input
            v-else
            v-model="ruleForm.privateKeyPem"
            :rows="12"
            type="textarea"
            placeholder="请将文件内容复制粘贴到这里，示例：
-----BEGIN (RSA) PRIVATE KEY-----
…
-----END (RSA) PRIVATE KEY-----"
          />
        </el-form-item>
        <el-form-item>
          <div class="form-item-desc">
            <p>1. 请使用PEM编码格式的证书私钥文件（文件扩展名为KEY或PEM）</p>
            <p>2. 确保私钥未设定密码保护。</p>
          </div>
        </el-form-item>
        <el-form-item label="备注名称" prop="name">
          <el-input v-model="ruleForm.name" maxlength="68" />
        </el-form-item>
        <el-form-item label="标签">
          <template #label>
            <span
              >标签
              <el-tooltip
                content="支持通过标签标记资源，从不同维度实现云资源分类与聚合。"
                placement="top"
                effect="light"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <TagInput v-model="ruleForm.tags" ref="tagInputRef" />
        </el-form-item>
        <el-form-item label="允许上传相同证书" prop="allowDuplicate">
          <div class="form-item-switch">
            <el-switch v-model="ruleForm.allowDuplicate" />
          </div>
          <div class="form-item-desc">
            <p v-if="ruleForm.allowDuplicate">关闭后，不允许上传相同内容的证书</p>
            <p v-else> 开启后，允许上传相同内容的证书 </p>
          </div>
        </el-form-item>
        <el-form-item label="开启证书完整性校验" prop="disableIntegrityCheck">
          <template #label>
            <span
              >开启证书完整性校验
              <el-tooltip
                content="证书完整性校验是指证书中心会检查您上传的证书链是否完整并向上补齐、检查证书的上下级签发关系是否成立以及是否采用了不安全的摘要算法，以保证您上传证书的可用性。"
                placement="top"
                effect="light"
              >
                <el-icon><QuestionFilled /></el-icon>
              </el-tooltip>
            </span>
          </template>
          <div class="form-item-switch">
            <el-switch v-model="ruleForm.disableIntegrityCheck" />
          </div>

          <div class="form-item-desc">
            <p v-if="ruleForm.disableIntegrityCheck">关闭后，不进行证书完整性校验</p>
            <p v-else>开启后，默认进行证书完整性校验</p>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(ruleFormRef)" :loading="loading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, toRaw } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { UploadFile } from 'element-plus'
import TagInput from '../TagInput/index.vue'
import { apiCreateCert } from '@/api/certificate'
import { ElMessage } from 'element-plus'
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['update:visible'])
const visible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})
const ruleFormRef = ref<FormInstance>()
const initialForm = {
  standards: 'gj',
  algorithm: 'rsa',
  mode: 'file',
  certificatePem: '',
  privateKeyPem: '',
  name: '上传证书',
  allowDuplicate: false,
  disableIntegrityCheck: true,
  tags: []
}
const ruleForm = reactive({ ...initialForm })
const rules = reactive<FormRules>({
  standards: [{ required: true, trigger: 'change' }],
  algorithm: [
    {
      required: true,
      trigger: 'change'
    }
  ],
  mode: [
    {
      required: true,
      trigger: 'change'
    }
  ],
  certificatePem: [
    {
      required: true,
      message: '该字段不能为空',
      trigger: 'change'
    }
  ],
  privateKeyPem: [
    {
      required: true,
      message: '该字段不能为空',
      trigger: 'change'
    }
  ],
  name: [
    {
      required: true,
      message: '该字段不能为空',
      trigger: 'change'
    }
  ]
})
const fileList = ref<UploadFile[]>([])
const fileListKey = ref<UploadFile[]>([])
const loading = ref(false)
const tagInputRef = ref<InstanceType<typeof TagInput>>()
const handleFileChange = (file: UploadFile, files: UploadFile[]) => {
  if (!file.raw) return
  const reader = new FileReader()
  reader.onload = (e) => {
    ruleForm.certificatePem = e.target?.result as string
  }
  reader.readAsText(file.raw)
  fileList.value = files.slice(-1) // 只保留最新的一个文件
  ruleFormRef.value?.clearValidate('certificatePem')
}
const handleFileRemove = () => {
  fileList.value = []
  ruleForm.certificatePem = ''
}
const handleFileChangeKey = (file: UploadFile, files: UploadFile[]) => {
  if (!file.raw) return
  const reader = new FileReader()
  reader.onload = (e) => {
    ruleForm.privateKeyPem = e.target?.result as string
  }
  reader.readAsText(file.raw)
  fileListKey.value = files.slice(-1) // 只保留最新的一个文件
  ruleFormRef.value?.clearValidate('privateKeyPem')
}
const handleFileRemoveKey = () => {
  fileListKey.value = []
  ruleForm.privateKeyPem = ''
}
// 表单重置
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
// 表单提交
const submitForm = async (formEl: FormInstance | undefined) => {
  try {
    if (!formEl) return
    await formEl.validate(async (valid, fields) => {
      const tagsValid = await tagInputRef.value?.validate()
      if (valid && tagsValid) {
        console.log('submit!', valid)
        const rawForm = toRaw(ruleForm)
        const params = {
          certificatePem: rawForm.certificatePem,
          privateKeyPem: rawForm.privateKeyPem,
          name: rawForm.name,
          allowDuplicate: rawForm.allowDuplicate,
          disableIntegrityCheck: rawForm.disableIntegrityCheck,
          tags: rawForm.tags
        }
        loading.value = true
        const { code } = await apiCreateCert(params)
        loading.value = false
        if (code === 200) {
          ElMessage.success('创建成功')
          handleCancel(ruleFormRef.value)
        }
      } else {
        console.log('error submit!', fields)
      }
    })
  } catch {
    loading.value = false
  }
}
// 取消
const handleCancel = (formEl: FormInstance | undefined) => {
  visible.value = false
  if (!formEl) return
  Object.assign(ruleForm, initialForm) // 重置为初始值
  ruleForm.tags = []
  formEl.clearValidate() // 清除校验信息
  fileList.value = [] // 清空上传的文件
  fileListKey.value = []
  tagInputRef.value?.onReset() // 清空标签输入框
}
</script>

<style lang="less" scoped>
.upload-demo {
  width: 100%;
}
.info {
  display: flex;
  padding: 9px 24px;
  gap: 8px;
  background-color: #f4f7ff;
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
      list-style: disc;
    }
  }
}
.form-item-desc {
  color: #737a87;
  font-size: 12px;
  line-height: 18px;
  margin-top: 5px;
}
.form-item-switch {
  width: 100%;
  margin-top: 4px;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
<style lang="less">
.upload-certificate {
  .el-dialog__header {
    height: auto !important;
  }
}
</style>
