<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useCheckInStore } from '@/stores/checkin'

const userStore = useUserStore()
const checkinStore = useCheckInStore()

const loading = ref(false)

// 下拉刷新
onMounted(async () => {
  await loadData()
})

async function loadData() {
  if (!userStore.isLoggedIn) return

  loading.value = true
  try {
    await Promise.all([
      checkinStore.fetchItems(),
      checkinStore.fetchStats(),
    ])
  } finally {
    loading.value = false
  }
}

// 刷新
uni.onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

// 创建打卡项
function goCreate() {
  if (!userStore.isLoggedIn) {
    navigateToLogin()
    return
  }
  uni.navigateTo({ url: '/pages/checkin/create/create' })
}

// 提交打卡
async function handleSubmitCheckIn(itemId: string) {
  if (!userStore.isLoggedIn) {
    navigateToLogin()
    return
  }
  try {
    uni.showLoading({ title: '打卡中...' })
    await checkinStore.submitCheckIn(itemId)
    uni.showToast({ title: '打卡成功+5积分', icon: 'success' })
    await loadData()
  } catch (error) {
    uni.showToast({ title: '打卡失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 查看详情
function goDetail(itemId: string) {
  uni.navigateTo({
    url: `/pages/checkin/detail/detail?id=${itemId}`
  })
}

function navigateToLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}
</script>

<template>
  <view class="container">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLoggedIn" class="not-logged-in">
      <text class="tip">请先登录</text>
      <button class="login-btn" @click="navigateToLogin">去登录</button>
    </view>

    <!-- 已登录状态 -->
    <template v-else>
      <!-- 统计卡片 -->
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-value">{{ checkinStore.stats.todayRecords || 0 }}</text>
          <text class="stat-label">今日打卡</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ checkinStore.stats.totalRecords || 0 }}</text>
          <text class="stat-label">累计打卡</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ userStore.userInfo?.points || 0 }}</text>
          <text class="stat-label">积分</text>
        </view>
      </view>

      <!-- 打卡项列表 -->
      <view class="checkin-list">
        <view v-if="checkinStore.items.length === 0 && !loading" class="empty">
          <text class="empty-text">还没有打卡项</text>
          <button class="create-btn" @click="goCreate">创建第一个打卡项</button>
        </view>

        <view
          v-for="item in checkinStore.items"
          :key="item.id"
          class="checkin-item"
          @click="goDetail(item.id)"
        >
          <view class="item-icon">
            <text class="iconfont">{{ getIcon(item.type) }}</text>
          </view>
          <view class="item-content">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-target">{{ item.dailyTarget || '每日打卡' }}</text>
          </view>
          <view class="item-action">
            <text class="status-text">待打卡</text>
          </view>
        </view>
      </view>

      <!-- 底部新增按钮 -->
      <view class="fab" @click="goCreate">
        <text class="fab-icon">+</text>
      </view>
    </template>
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

.stats-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
  border-radius: 24rpx;
  padding: 40rpx 0;
  margin-bottom: 30rpx;

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      font-size: 48rpx;
      font-weight: bold;
      color: #FFFFFF;
    }

    .stat-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
      margin-top: 8rpx;
    }
  }

  .stat-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}

.checkin-list {
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 200rpx 0;

    .empty-text {
      font-size: 28rpx;
      color: #B2BEC3;
      margin-bottom: 40rpx;
    }

    .create-btn {
      width: 400rpx;
      height: 88rpx;
      background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
      color: #FFFFFF;
      border-radius: 44rpx;
      font-size: 30rpx;
      border: none;
    }
  }
}

.checkin-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .item-icon {
    width: 88rpx;
    height: 88rpx;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;

    .iconfont {
      font-size: 44rpx;
      color: #FFFFFF;
    }
  }

  .item-content {
    flex: 1;

    .item-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #2D3436;
      display: block;
      margin-bottom: 8rpx;
    }

    .item-target {
      font-size: 24rpx;
      color: #636E72;
      display: block;
    }
  }

  .item-action {
    .status-text {
      font-size: 28rpx;
      color: #6C5CE7;
    }
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 150rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 56rpx;
  background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
  box-shadow: 0 8rpx 24rpx rgba(108, 92, 231, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .fab-icon {
    font-size: 60rpx;
    color: #FFFFFF;
    line-height: 1;
  }
}
</style>