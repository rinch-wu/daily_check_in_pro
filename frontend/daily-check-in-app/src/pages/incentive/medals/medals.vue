<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIncentiveStore } from '@/stores/incentive'

const incentiveStore = useIncentiveStore()
const medals = ref<any[]>([])

onMounted(async () => {
  await loadData()
})

async function loadData() {
  try {
    uni.showLoading({ title: '加载中...' })
    await incentiveStore.fetchMedals()
    medals.value = incentiveStore.medals
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
    <view class="medal-list" v-if="medals.length > 0">
      <view
        v-for="medal in medals"
        :key="medal.id"
        class="medal-item"
        :class="{ legendary: medal.rarity === 'legendary', rare: medal.rarity === 'rare' }"
      >
        <view class="medal-icon">{{ medal.icon }}</view>
        <view class="medal-info">
          <text class="medal-name">{{ medal.name }}</text>
          <text class="medal-desc">{{ medal.description }}</text>
          <text class="medal-date">获得于 {{ formatDate(medal.earnedAt) }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <text class="empty-icon">🏆</text>
      <text class="empty-text">还没有勋章</text>
      <text class="empty-subtext">坚持打卡解锁勋章吧</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  padding: 20rpx 30rpx;
}

.medal-list {
  .medal-item {
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    border-left: 8rpx solid #B2BEC3;

    &.rare {
      border-left-color: #6C5CE7;
      background: linear-gradient(135deg, #FFFFFF 0%, rgba(108, 92, 231, 0.05) 100%);
    }

    &.legendary {
      border-left-color: #FDCB6E;
      background: linear-gradient(135deg, #FFFFFF 0%, rgba(253, 203, 110, 0.1) 100%);
    }

    .medal-icon {
      font-size: 72rpx;
      margin-right: 24rpx;
    }

    .medal-info {
      flex: 1;

      .medal-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #2D3436;
        display: block;
        margin-bottom: 8rpx;
      }

      .medal-desc {
        font-size: 26rpx;
        color: #636E72;
        display: block;
        margin-bottom: 8rpx;
      }

      .medal-date {
        font-size: 22rpx;
        color: #B2BEC3;
        display: block;
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

  .empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
  }

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