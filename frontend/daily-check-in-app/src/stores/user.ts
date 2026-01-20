import { ref, computed } from 'pinia'
import { defineStore } from 'pinia'
import { request } from '../utils/request'

interface UserInfo {
  id: string
  nickname: string
  avatar: string
  points: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  async function login(code: string, nickname?: string, avatar?: string) {
    try {
      const res: any = await request({
        url: '/user/login',
        method: 'POST',
        data: { code, nickname, avatar },
        needAuth: false,
      })

      token.value = res.token
      userInfo.value = res.user

      // 保存 token
      uni.setStorageSync('token', res.token)

      return res
    } catch (error) {
      throw error
    }
  }

  // 拉取用户信息
  async function fetchUserInfo() {
    try {
      const res: any = await request({
        url: '/user/profile',
        method: 'GET',
      })

      userInfo.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  // 更新用户信息
  async function updateProfile(data: { nickname?: string; avatar?: string }) {
    try {
      const res: any = await request({
        url: '/user/profile',
        method: 'PUT',
        data,
      })

      userInfo.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  // 退出登录
  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    fetchUserInfo,
    updateProfile,
    logout,
  }
})