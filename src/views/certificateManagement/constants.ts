import status1 from '@/assets/imgs/status1.svg'
import status2 from '@/assets/imgs/status2.svg'
import status3 from '@/assets/imgs/status3.svg'
import status4 from '@/assets/imgs/status4.svg'
import status5 from '@/assets/imgs/status5.svg'

export const statusMap: Record<string, string> = {
  CERT_STATUS_EXPIRES_SOON: '即将过期',
  CERT_STATUS_EXPIRED: '已过期',
  CERT_STATUS_ISSUE: '已签发',
  CERT_STATUS_ABNORMAL: '异常',
  CERT_STATUS_UNUSED: '未使用',
  CERT_STATUS_ALL: '全部证书'
}

export const statusImgMap: Record<string, string> = {
  CERT_STATUS_EXPIRES_SOON: status3,
  CERT_STATUS_EXPIRED: status4,
  CERT_STATUS_ISSUE: status2,
  CERT_STATUS_ABNORMAL: status5,
  CERT_STATUS_ALL: status1
}

export const statusOptions = [
  {
    label: '即将过期',
    value: 'CERT_STATUS_EXPIRES_SOON'
  },
  {
    label: '已到期',
    value: 'CERT_STATUS_EXPIRED'
  },
  {
    label: '已签发',
    value: 'CERT_STATUS_ISSUE'
  }
  // {
  //   label: '异常',
  //   value: 'CERT_STATUS_ABNORMAL'
  // },
  // {
  //   label: '未使用',
  //   value: 'CERT_STATUS_UNUSED'
  // }
]

export { status1, status2, status3, status4 }
