<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIncentiveStore } from '@/stores/incentive'

const incentiveStore = useIncentiveStore()

const pointsRecords = ref<any[]>([])
const currentPoints = ref(0)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  const userStore = useUserStore()
  currentPoints.value = userStore.userInfo?.points || 0

  try {
    uni.showLoading({ title: '加载中...' })
    await incentiveStore.fetchPointsRecords()
    pointsRecords.value = incentiveStore.pointsRecords
  } finally {
    uni.hideLoading()
  }
}

uni.onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})
</script>

<template>
  <view class="container">
    <!-- 积分卡片 -->
    <view class="points-card">
      <text class="points-label">我的积分</text>
      <text class="points-value">{{ currentPoints }}</text>
      <text class="points-tip">每日打卡+5积分</text>
    </view>

    <!-- 积分明细 -->
    <view class="records-list" v-if="pointsRecords.length > 0">
      <text class="section-title">积分明细</text>

      <view
        v-for="record in pointsRecords"
        :key="record.id"
        class="record-item"
      >
        <view class="record-left">
          <text class="record-reason">{{ record.reason }}</text>
          <text class="record-time">{{ formatTime(record.createdAt) }}</text>
        </view>
        <view class="record-right">
          <text class="record-amount" :class="{ deduct: record.amount < 0 }">
            {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
          </text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <text class="empty-text">暂无积分记录</text>
      <text class="empty-subtext">开始打卡赚取积分吧</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  padding: 20rpx 30rpx;
}

.points-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #FDCB6E 0%, #FFEAA7 100%);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;

  .points-label {
    font-size: 28rpx;
    color: rgba(0, 0, 0, 0.6);
    margin-bottom: 20rpx;
  }

  .points-value {
    font-size: 88rpx;
    font-weight: bold;
    color: #2D3436;
    margin-bottom: 16rpx;
  }

  .points-tip {
    font-size: 24rpx;
    color: rgba(0, 0, 0, 0.5);
  }
}

.records-list {
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #636E72;
    display: block;
    margin-bottom: 20rpx;
  }
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .record-left {
    .record-reason {
      font-size: 28rpx;
      color: #2D3436;
      display: block;
      margin-bottom: 8rpx;
    }

    .record-time {
      font-size: 24rpx;
      color: #B2BEC3;
      display: block;
    }
  }

  .record-right {
    .record-amount {
      font-size: 36rpx;
      font-weight: bold;
      color: #00B894;

      &.deduct {
        color: #FF7675;
      }
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;

  .empty-text {
    font-size: 32rpx;
    color: #B2BEC3;
    margin-bottom: 16rpx;
  }

  .empty-subtext {
    font-size: 24rpx;
    color: #B2BEC3;
  }
}
</style>