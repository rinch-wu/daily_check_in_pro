import { ref } from 'pinia'
import { defineStore } from 'pinia'
import request from '@/utils/request'

interface IncentiveMedal {
  id: string
  name: string
  description: string
  icon: string
  rarity: string
  earnedAt: string
}

interface PointsRecordItem {
  id: string
  type: string
  amount: number
  reason: string
  createdAt: string
}

export const useIncentiveStore = defineStore('incentive', () => {
  const medals = ref<IncentiveMedal[]>([])
  const pointsRecords = ref<PointsRecordItem[]>([])

  async function fetchPointsRecords() {
    const res: any = await request({
      url: '/incentive/points/records',
      method: 'GET',
    })
    pointsRecords.value = res || []
    return res
  }

  async function fetchMedals() {
    const res: any = await request({
      url: '/incentive/medals',
      method: 'GET',
    })
    medals.value = res || []
    return res
  }

  return {
    medals,
    pointsRecords,
    fetchPointsRecords,
    fetchMedals,
  }
})