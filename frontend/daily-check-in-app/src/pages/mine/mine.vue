<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchUserInfo()
  }
})

// 功能列表
const menuList = [
  { icon: '📅', title: '打卡记录', url: '/pages/checkin/records/records' },
  { icon: '🏆', title: '我的成就', url: '/pages/incentive/medals/medals' },
  { icon: '👥', title: '好友排行', url: '' },
  { icon: '🔔', title: '提醒设置', url: '' },
]

function goPage(url: string) {
  if (!url) {
    uni.showToast({ title: '功能开发中', icon: 'none' })
    return
  }
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url })
}

function goPoints() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url: '/pages/incentive/points/points' })
}

function goMedals() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.navigateTo({ url: '/pages/incentive/medals/medals' })
}
</script>

<template>
  <view class="container">
    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn" class="not-logged-in">
      <text class="tip">请先登录</text>
      <button class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/login' })">
        去登录
      </button>
    </view>

    <!-- 已登录 -->
    <view v-else>
      <!-- 个人信息卡片 -->
      <view class="profile-card">
        <image class="avatar" :src="userStore.userInfo?.avatar" mode="aspectFill" />
        <view class="user-info">
          <text class="nickname">{{ userStore.userInfo?.nickname }}</text>
          <view class="stats">
            <text class="stat-item">积分: {{ userStore.userInfo?.points }}</text>
          </view>
        </view>
      </view>

      <!-- 积分卡片 -->
      <view class="points-card" @click="goPoints">
        <text class="points-label">我的积分</text>
        <text class="points-value">{{ userStore.userInfo?.points || 0 }}</text>
        <text class="arrow">›</text>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view
          v-for="(item, index) in menuList"
          :key="index"
          class="menu-item"
          @click="goPage(item.url)"
        >
          <text class="menu-icon">{{ item.icon }}</text>
          <text class="menu-title">{{ item.title }}</text>
          <text class="arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  padding: 20rpx;
}

.not-logged-in {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;

  .tip {
    font-size: 32rpx;
    color: #636E72;
    margin-bottom: 40rpx;
  }

  .login-btn {
    width: 300rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
    color: #FFFFFF;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;
  }
}

.profile-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    margin-right: 30rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.3);
  }

  .user-info {
    flex: 1;

    .nickname {
      font-size: 36rpx;
      font-weight: 600;
      color: #FFFFFF;
      display: block;
      margin-bottom: 12rpx;
    }

    .stats {
      .stat-item {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }
}

.points-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .points-label {
    font-size: 32rpx;
    font-weight: 600;
    color: #2D3436;
  }

  .points-value {
    font-size: 48rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #FDCB6E 0%, #FFEAA7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .arrow {
    font-size: 48rpx;
    color: #B2BEC3;
  }
}

.menu-section {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 0 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #F0F0F0;

    &:last-child {
      border-bottom: none;
    }

    .menu-icon {
      font-size: 40rpx;
      margin-right: 24rpx;
    }

    .menu-title {
      flex: 1;
      font-size: 28rpx;
      color: #2D3436;
    }

    .arrow {
      font-size: 32rpx;
      color: #B2BEC3;
    }
  }
}
</style>