<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSocialStore } from '@/stores/social'

const userStore = useUserStore()
const socialStore = useSocialStore()

const activeTab = ref(0)
const tabs = ['推荐', '学习', '健身', '生活', '全部']
const loading = ref(false)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  if (!userStore.isLoggedIn) return

  loading.value = true
  try {
    await socialStore.fetchPosts()
  } finally {
    loading.value = false
  }
}

uni.onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

function onTabChange(index: number) {
  activeTab.value = index
  loadData()
}

function onLike(postId: string) {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  socialStore.toggleLike(postId)
}

function goPublish() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.showToast({ title: '发布功能开发中', icon: 'none' })
}
</script>

<template>
  <view class="container">
    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn" class="not-logged-in">
      <text class="tip">登录后查看打卡圈动态</text>
      <button class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/login' })">
        去登录
      </button>
    </view>

    <!-- 空状态 -->
    <view v-else-if="socialStore.posts.length === 0 && !loading" class="empty">
      <text class="empty-text">暂无动态</text>
      <text class="empty-subtext">快来分享你的打卡吧</text>
    </view>

    <!-- Tab栏 -->
    <scroll-view v-else scroll-x class="tabs" :scroll-left="activeTab * 120">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: index === activeTab }"
        @click="onTabChange(index)"
      >
        {{ tab }}
      </view>
    </scroll-view>

    <!-- 动态列表 -->
    <scroll-view v-else scroll-y class="posts-list">
      <view
        v-for="post in socialStore.posts"
        :key="post.id"
        class="post-card"
      >
        <view class="post-header">
          <image class="avatar" :src="post.user.avatar" mode="aspectFill" />
          <view class="user-info">
            <text class="nickname">{{ post.user.nickname }}</text>
            <text class="time">{{ formatTime(post.createdAt) }}</text>
          </view>
        </view>

        <view class="post-content">
          <text class="text">{{ post.content }}</text>
        </view>

        <view class="post-actions">
          <view class="action-item" @click="onLike(post.id)">
            <text :class="['icon', post.isLiked ? 'liked' : '']">
              {{ post.isLiked ? '❤️' : '🤍' }}
            </text>
            <text class="count">{{ post.likeCount }}</text>
          </view>
          <view class="action-item">
            <text class="icon">💬</text>
            <text class="count">{{ post.comments?.length || 0 }}</text>
          </view>
          <view class="action-item">
            <text class="icon">🔗</text>
            <text class="count">分享</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view v-if="userStore.isLoggedIn" class="fab" @click="goPublish">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  background: #F8F9FA;
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
    font-size: 28rpx;
    color: #B2BEC3;
  }
}

.tabs {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #FFFFFF;
  white-space: nowrap;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #E0E0E0;

  .tab-item {
    display: inline-block;
    padding: 12rpx 32rpx;
    margin: 0 12rpx;
    font-size: 28rpx;
    color: #636E72;
    border-radius: 32rpx;
    transition: all 0.3s;

    &.active {
      color: #6C5CE7;
      background: rgba(108, 92, 231, 0.1);
      font-weight: 600;
    }
  }
}

.posts-list {
  padding: 20rpx;
  height: calc(100vh - 80rpx);
}

.post-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .post-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .avatar {
      width: 72rpx;
      height: 72rpx;
      border-radius: 36rpx;
      margin-right: 20rpx;
    }

    .user-info {
      flex: 1;

      .nickname {
        font-size: 28rpx;
        font-weight: 600;
        color: #2D3436;
        display: block;
        margin-bottom: 4rpx;
      }

      .time {
        font-size: 24rpx;
        color: #B2BEC3;
        display: block;
      }
    }
  }

  .post-content {
    margin-bottom: 24rpx;

    .text {
      font-size: 28rpx;
      color: #2D3436;
      line-height: 1.6;
    }
  }

  .post-actions {
    display: flex;
    border-top: 1rpx solid #F0F0F0;
    padding-top: 20rpx;

    .action-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        font-size: 36rpx;
        margin-right: 8rpx;

        &.liked {
          transform: scale(1.2);
        }
      }

      .count {
        font-size: 24rpx;
        color: #636E72;
      }
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