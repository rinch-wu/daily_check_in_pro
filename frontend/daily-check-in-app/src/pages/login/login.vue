<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
let userInfo: any = {}

// 检查登录状态
onMounted(async () => {
  await checkLoginStatus()
})

// 拉取用户信息（如果需要）
async function checkLoginStatus() {
  if (userStore.isLoggedIn) {
    uni.switchTab({ url: '/pages/index/index' })
    return
  }
}

// 微信登录
async function handleWechatLogin() {
  try {
    uni.showLoading({ title: '登录中...' })

    // 获取微信登录code
    const loginRes: any = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      })
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    // 调用后端登录接口
    const res: any = await request({
      url: '/user/login',
      method: 'POST',
      data: { code: loginRes.code },
      needAuth: false,
    })

    // 保存token和用户信息
    uni.setStorageSync('token', res.token)
    userStore.token = res.token
    userStore.userInfo = res.user

    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })

    // 跳转首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({
      title: error.message || '登录失败，请重试',
      icon: 'none',
      duration: 2000,
    })
  }
}

// 获取用户头像昵称（微信小程序）
async function getUserProfile() {
  try {
    const profileRes: any = await new Promise((resolve, reject) => {
      uni.getUserProfile({
        desc: '用于完善用户资料',
        success: resolve,
        fail: reject,
      })
    })

    userInfo = {
      nickname: profileRes.userInfo.nickName,
      avatar: profileRes.userInfo.avatarUrl,
    }

    await handleWechatLogin()
  } catch (error: any) {
    // 用户拒绝授权，使用默认信息登录
    userInfo = {
      nickname: '微信用户',
      avatar: 'https://via.placeholder.com/100',
    }
    await handleWechatLogin()
  }
}

// 直接调用微信登录（简化版）
async function login() {
  try {
    uni.showLoading({ title: '登录中...' })

    const loginRes: any = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject,
      })
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    const res: any = await request({
      url: '/user/login',
      method: 'POST',
      data: { code: loginRes.code },
      needAuth: false,
    })

    uni.setStorageSync('token', res.token)
    userStore.token = res.token
    userStore.userInfo = res.user

    uni.hideLoading()
    uni.showToast({ title: '登录成功', icon: 'success' })

    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 1500)
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({
      title: '登录失败',
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="container">
    <!-- Logo区域 -->
    <view class="logo-section">
      <text class="logo-icon">📅</text>
      <text class="app-name">每日打卡Pro</text>
      <text class="app-slogan">让坚持成为习惯</text>
    </view>

    <!-- 登录按钮 -->
    <view class="login-section">
      <button class="login-btn" @click="login">
        <text class="wechat-icon">微信登录</text>
      </button>
      <text class="agreement-text">
        登录即表示同意《用户协议》和《隐私政策》
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;

  .logo-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

  .app-name {
    font-size: 56rpx;
    font-weight: bold;
    color: #FFFFFF;
    margin-bottom: 16rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.8);
  }
}

.login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  .login-btn {
    width: 600rpx;
    height: 96rpx;
    background: #FFFFFF;
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);

    .wechat-icon {
      font-size: 32rpx;
      color: #2D3436;
      font-weight: 600;
    }

    &::after {
      border: none;
    }
  }

  .agreement-text {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 40rpx;
    text-align: center;
  }
}
</style>