<script setup lang="ts">
import { ref } from 'vue'
import { useCheckInStore } from '@/stores/checkin'

const checkinStore = useCheckInStore()

// 表单数据
const formData = ref({
  name: '',
  type: 'count',
  dailyTarget: '',
  cycle: 'daily',
  reminderTime: '',
  reminderText: '',
})

// 打卡类型选项
const typeOptions = [
  { label: '计数', value: 'count' },
  { label: '计时', value: 'timing' },
  { label: '完成', value: 'proof' },
]

// 周期选项
const cycleOptions = [
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '自定义', value: 'custom' },
]

// 选择类型
function selectType(value: string) {
  formData.value.type = value
}

// 选择周期
function selectCycle(value: string) {
  formData.value.cycle = value
}

// 选择提醒时间
function selectTime() {
  uni.showActionSheet({
    itemList: ['08:00', '09:00', '18:00', '20:00', '21:00', '自定义'],
    success: (res) => {
      if (res.tapIndex === 5) {
        // 自定义时间
        uni.showModal({
          title: '设置提醒时间',
          editable: true,
          placeholderText: 'HH:mm',
          success: (modalRes) => {
            if (modalRes.confirm && modalRes.content) {
              formData.value.reminderTime = modalRes.content
            }
          },
        })
      } else {
        formData.value.reminderTime = ['08:00', '09:00', '18:00', '20:00', '21:00'][res.tapIndex]
      }
    },
  })
}

// 提交创建
async function handleSubmit() {
  if (!formData.value.name) {
    uni.showToast({ title: '请输入打卡名称', icon: 'none' })
    return
  }

  try {
    uni.showLoading({ title: '创建中...' })

    await checkinStore.createItem({
      name: formData.value.name,
      type: formData.value.type as any,
      dailyTarget: formData.value.dailyTarget || undefined,
      cycle: formData.value.cycle as any,
      reminderTime: formData.value.reminderTime || undefined,
      reminderText: formData.value.reminderText || undefined,
    })

    uni.hideLoading()
    uni.showToast({ title: '创建成功', icon: 'success' })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '创建失败', icon: 'none' })
  }
}

// 取消
function handleCancel() {
  uni.navigateBack()
}
</script>

<template>
  <view class="container">
    <view class="form">
      <!-- 打卡名称 -->
      <view class="form-item">
        <text class="label">打卡名称</text>
        <input
          v-model="formData.name"
          class="input"
          placeholder="请输入打卡名称"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 打卡类型 -->
      <view class="form-item">
        <text class="label">打卡类型</text>
        <view class="options">
          <text
            v-for="option in typeOptions"
            :key="option.value"
            class="option"
            :class="{ active: formData.type === option.value }"
            @click="selectType(option.value)"
          >
            {{ option.label }}
          </text>
        </view>
      </view>

      <!-- 每日目标 -->
      <view class="form-item">
        <text class="label">每日目标</text>
        <input
          v-model="formData.dailyTarget"
          class="input"
          placeholder="例如：50个/天"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 打卡周期 -->
      <view class="form-item">
        <text class="label">打卡周期</text>
        <view class="options">
          <text
            v-for="option in cycleOptions"
            :key="option.value"
            class="option"
            :class="{ active: formData.cycle === option.value }"
            @click="selectCycle(option.value)"
          >
            {{ option.label }}
          </text>
        </view>
      </view>

      <!-- 提醒时间 -->
      <view class="form-item" @click="selectTime">
        <text class="label">提醒时间</text>
        <view class="input-wrapper">
          <text class="input-value">{{ formData.reminderTime || '不设置' }}</text>
          <text class="arrow">›</text>
        </view>
      </view>

      <!-- 提醒文案 -->
      <view class="form-item">
        <text class="label">提醒文案</text>
        <input
          v-model="formData.reminderText"
          class="input"
          placeholder="例如：该打卡啦！"
          placeholder-class="input-placeholder"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <button class="btn cancel-btn" @click="handleCancel">取消</button>
      <button class="btn confirm-btn" @click="handleSubmit">确认</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  min-height: 100vh;
  padding: 20rpx 30rpx;
  background: #F8F9FA;
}

.form {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;

  .form-item {
    margin-bottom: 40rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      font-size: 28rpx;
      font-weight: 600;
      color: #2D3436;
      display: block;
      margin-bottom: 20rpx;
    }

    .input {
      width: 100%;
      height: 88rpx;
      background: #F8F9FA;
      border-radius: 12rpx;
      padding: 0 30rpx;
      font-size: 28rpx;
      color: #2D3436;
    }

    .input-placeholder {
      color: #B2BEC3;
    }

    .options {
      display: flex;
      gap: 20rpx;

      .option {
        flex: 1;
        height: 72rpx;
        border: 2rpx solid #E0E0E0;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #636E72;
        transition: all 0.3s;

        &.active {
          background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
          color: #FFFFFF;
          border-color: transparent;
        }
      }
    }

    .input-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 88rpx;
      background: #F8F9FA;
      border-radius: 12rpx;
      padding: 0 30rpx;

      .input-value {
        font-size: 28rpx;
        color: #2D3436;
      }

      .arrow {
        font-size: 40rpx;
        color: #B2BEC3;
      }
    }
  }
}

.footer {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;

  .btn {
    flex: 1;
    height: 88rpx;
    border-radius: 44rpx;
    font-size: 30rpx;
    border: none;

    &::after {
      border: none;
    }
  }

  .cancel-btn {
    background: #F8F9FA;
    color: #636E72;
  }

  .confirm-btn {
    background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%);
    color: #FFFFFF;
  }
}
</style>