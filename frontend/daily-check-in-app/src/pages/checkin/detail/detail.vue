<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCheckInStore } from '@/stores/checkin'

const checkinStore = useCheckInStore()

const itemId = ref('')
const recordList = ref<any[]>([])
const stats = ref<any>({})

onMounted(async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  itemId.value = currentPage.options?.id

  if (itemId.value) {
    await loadData()
  }
})

async function loadData() {
  try {
    uni.showLoading({ title: '加载中...' })
    await Promise.all([
      checkinStore.fetchRecords(itemId.value),
    ])
    recordList.value = checkinStore.records
  } finally {
    uni.hideLoading()
  }
}

// 下拉刷新
uni.onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

// 提交打卡
async function handleCheckIn() {
  try {
    uni.showLoading({ title: '打卡中...' })
    await checkinStore.submitCheckIn(itemId.value)
    uni.showToast({ title: '打卡成功+5积分', icon: 'success' })
    await loadData()
  } catch (error: any) {
    uni.showToast({ title: error.message || '打卡失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 补签
function handleMakeup(date: string) {
  uni.showModal({
    title: '补签',
    content: '补签需要消耗10积分，确定吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '补签中...' })
          await checkinStore.makeupCheckIn(itemId.value, date)
          uni.showToast({ title: '补签成功', icon: 'success' })
          await loadData()
        } catch (error: any) {
          uni.showToast({ title: error.message || '补签失败', icon: 'none' })
        } finally {
          uni.hideLoading()
        }
      }
    },
  })
}

// 格式化日期
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `${diffDays}天前`

  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 格式化时间
function formatTime(dateStr: string) {
  const date = new Date(dateStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <view class="container">
    <!-- 统计信息 -->
    <view class="stats-card">
      <view class="stat-item">
        <text class="stat-value">{{ recordList.length }}</text>
        <text class="stat-label">累计打卡</text>
      </view>
    </view>

    <!-- 打卡记录列表 -->
    <view class="record-list" v-if="recordList.length > 0">
      <text class="section-title">打卡记录</text>

      <view
        v-for="record in recordList"
        :key="record.id"
        class="record-item"
      >
        <view class="record-left">
          <text class="record-date">{{ formatDate(record.date) }}</text>
          <text class="record-time">{{ formatTime(record.createdAt) }}</text>
        </view>
        <view class="record-right">
          <text class="record-status" :class="{ makeup: record.status === 'makeup' }">
            {{ record.status === 'makeup' ? '补签' : '正常' }}
          </text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <text class="empty-text">暂无打卡记录</text>
      <text class="empty-subtext">点击下方按钮开始打卡</text>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button class="checkin-btn" @click="handleCheckIn">
        <text class="btn-icon">✓</text>
        <text class="btn-text">立即打卡</text>
      </button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  padding: 20rpx 30rpx;
}

.stats-card {
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-value {
      font-size: 56rpx;
      font-weight: bold;
      color: #FFFFFF;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}

.record-list {
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
    .record-date {
      font-size: 32rpx;
      font-weight: 600;
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
    .record-status {
      font-size: 24rpx;
      color: #00B894;
      background: rgba(0, 184, 148, 0.1);
      padding: 8rpx 20rpx;
      border-radius: 20rpx;

      &.makeup {
        color: #FDCB6E;
        background: rgba(253, 203, 110, 0.1);
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

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background: #FFFFFF;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  .checkin-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
    border-radius: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(108, 92, 231, 0.4);

    .btn-icon {
      font-size: 36rpx;
      color: #FFFFFF;
      margin-right: 12rpx;
    }

    .btn-text {
      font-size: 32rpx;
      color: #FFFFFF;
      font-weight: 600;
    }

    &::after {
      border: none;
    }
  }
}
</style>