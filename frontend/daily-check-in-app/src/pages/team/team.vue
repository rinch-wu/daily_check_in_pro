<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSocialStore } from '@/stores/social'

const userStore = useUserStore()
const socialStore = useSocialStore()

const loading = ref(false)

onMounted(async () => {
  await loadData()
})

async function loadData() {
  if (!userStore.isLoggedIn) return

  loading.value = true
  try {
    await socialStore.fetchTeams()
  } finally {
    loading.value = false
  }
}

uni.onPullDownRefresh(async () => {
  await loadData()
  uni.stopPullDownRefresh()
})

function goCreateTeam() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  uni.showToast({ title: '创建队伍功能开发中', icon: 'none' })
}

function joinTeam(teamId: string) {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/login/login' })
    return
  }
  socialStore.joinTeam(teamId)
}
</script>

<template>
  <view class="container">
    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn" class="not-logged-in">
      <text class="tip">登录后加入组队打卡</text>
      <button class="login-btn" @click="() => uni.navigateTo({ url: '/pages/login/login' })">
        去登录
      </button>
    </view>

    <!-- 我的队伍 -->
    <view v-else>
      <view v-if="socialStore.myTeams.length > 0" class="section">
        <text class="section-title">我的队伍</text>
        <view
          v-for="team in socialStore.myTeams"
          :key="team.id"
          class="team-card team-active"
        >
          <view class="team-header">
            <text class="team-name">🏆 {{ team.name }}</text>
            <text class="team-status">进行中</text>
          </view>
          <view v-if="team.target" class="team-target">
            目标: {{ team.target }}
          </view>
          <view class="team-members">
            <text class="members-count">成员: {{ team.members?.length || 0 }}/{{ team.maxMembers }}</text>
          </view>
        </view>
      </view>

      <!-- 加入的队伍 -->
      <view v-if="socialStore.joinedTeams.length > 0" class="section">
        <text class="section-title">加入的队伍</text>
        <view
          v-for="team in socialStore.joinedTeams"
          :key="team.id"
          class="team-card"
        >
          <view class="team-header">
            <text class="team-name">{{ team.name }}</text>
          </view>
          <view v-if="team.description" class="team-desc">
            {{ team.description }}
          </view>
          <view class="team-members">
            <text class="members-count">成员: {{ team.members?.length || 0 }}/{{ team.maxMembers }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="socialStore.myTeams.length === 0 && socialStore.joinedTeams.length === 0 && !loading" class="empty">
        <text class="empty-text">还没有队伍</text>
        <text class="empty-subtext">组队打卡，互相监督</text>
      </view>
    </view>

    <!-- 创建按钮 -->
    <view v-if="userStore.isLoggedIn" class="fab" @click="goCreateTeam">
      <text class="fab-icon">+</text>
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

.section {
  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #636E72;
    display: block;
    margin: 30rpx 0 20rpx;
  }
}

.team-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  &.team-active {
    background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
    color: #FFFFFF;
  }

  .team-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .team-name {
      font-size: 32rpx;
      font-weight: 600;
      color: inherit;
    }

    .team-status {
      font-size: 24rpx;
      background: rgba(0, 0, 0, 0.2);
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
    }
  }

  .team-target {
    font-size: 28rpx;
    opacity: 0.9;
    margin-bottom: 12rpx;
  }

  .team-desc {
    font-size: 28rpx;
    color: #636E72;
    margin-bottom: 12rpx;
  }

  .team-members {
    .members-count {
      font-size: 24rpx;
      opacity: 0.8;
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
    font-size: 28rpx;
    color: #B2BEC3;
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