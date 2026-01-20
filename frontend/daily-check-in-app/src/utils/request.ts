// API 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// 请求封装
export function request(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  needAuth?: boolean
}) {
  const { url, method = 'GET', data, header, needAuth = true } = options

  // 获取 token
  const token = uni.getStorageSync('token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...header,
  }

  if (needAuth && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: headers,
      success: (res: any) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none',
            })
            reject(res.data.message)
          }
        } else if (res.statusCode === 401) {
          // Token 过期，跳转登录
          uni.showToast({
            title: '请重新登录',
            icon: 'none',
          })
          // 清除 token
          uni.removeStorageSync('token')
          // 跳转登录页
          uni.navigateTo({
            url: '/pages/login/login',
          })
          reject('未授权')
        } else {
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          })
          reject('网络错误')
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}

export default { request, BASE_URL }