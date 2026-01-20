import { ref } from 'pinia'
import { defineStore } from 'pinia'
import { request } from '../utils/request'

interface CheckInItem {
  id: string
  name: string
  type: 'count' | 'timing' | 'proof'
  dailyTarget: string | null
  cycle: string
  reminderTime: string | null
  isHidden: boolean
  createdAt: string
}

interface CheckInRecord {
  id: string
  itemId: string
  date: string
  note: string | null
  status: 'normal' | 'makeup'
  createdAt: string
}

export const useCheckInStore = defineStore('checkin', () => {
  const items = ref<CheckInItem[]>([])
  const records = ref<CheckInRecord[]>([])
  const stats = ref<any>({})
  const loading = ref(false)

  // 获取打卡项列表
  async function fetchItems() {
    loading.value = true
    try {
      const res: any = await request({
        url: '/checkin/items',
        method: 'GET',
      })
      items.value = res
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 创建打卡项
  async function createItem(data: Partial<CheckInItem>) {
    try {
      const res: any = await request({
        url: '/checkin/items',
        method: 'POST',
        data,
      })
      items.value.push(res)
      return res
    } catch (error) {
      throw error
    }
  }

  // 提交打卡
  async function submitCheckIn(itemId: string, note?: string) {
    try {
      const res: any = await request({
        url: `/checkin/records?itemId=${itemId}`,
        method: 'POST',
        data: { note },
      })

      // 更新今日打卡状态
      const item = items.value.find(i => i.id === itemId)
      if (item) {
        item.lastCheckIn = new Date().toISOString()
      }

      return res
    } catch (error) {
      throw error
    }
  }

  // 补签
  async function makeupCheckIn(itemId: string, date: string) {
    try {
      const res: any = await request({
        url: `/checkin/records/makeup?itemId=${itemId}&date=${date}`,
        method: 'POST',
      })
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取打卡记录
  async function fetchRecords(itemId?: string) {
    try {
      const res: any = await request({
        url: `/checkin/records${itemId ? `?itemId=${itemId}` : ''}`,
        method: 'GET',
      })
      records.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取统计
  async function fetchStats() {
    try {
      const res: any = await request({
        url: '/checkin/stats',
        method: 'GET',
      })
      stats.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  return {
    items,
    records,
    stats,
    loading,
    fetchItems,
    createItem,
    submitCheckIn,
    makeupCheckIn,
    fetchRecords,
    fetchStats,
  }
})