import { ref } from 'pinia'
import { defineStore } from 'pinia'
import { request } from '../utils/request'

interface Post {
  id: string
  userId: string
  content: string
  images: string | null
  tags: string | null
  likeCount: number
  isLiked: boolean
  createdAt: string
  user: {
    id: string
    nickname: string
    avatar: string
  }
}

interface Team {
  id: string
  name: string
  description: string | null
  target: string | null
  maxMembers: number
  status: string
  captain: {
    id: string
    nickname: string
    avatar: string
  }
  members: any[]
}

export const useSocialStore = defineStore('social', () => {
  const posts = ref<Post[]>([])
  const myTeams = ref<Team[]>([])
  const joinedTeams = ref<Team[]>([])
  const leaderboard = ref<any[]>([])
  const loading = ref(false)

  // 获取动态列表
  async function fetchPosts(tag?: string) {
    loading.value = true
    try {
      const res: any = await request({
        url: `/social/posts${tag ? `?tag=${tag}` : ''}`,
        method: 'GET',
      })
      posts.value = res
      return res
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 发布动态
  async function createPost(data: { content: string; images?: string; tags?: string; itemId?: string }) {
    try {
      const res: any = await request({
        url: '/social/posts',
        method: 'POST',
        data,
      })
      posts.value.unshift(res)
      return res
    } catch (error) {
      throw error
    }
  }

  // 点赞
  async function toggleLike(postId: string) {
    try {
      const res: any = await request({
        url: `/social/posts/${postId}/like`,
        method: 'POST',
      })

      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.isLiked = res.isLiked
        post.likeCount = res.isLiked ? post.likeCount + 1 : post.likeCount - 1
      }

      return res
    } catch (error) {
      throw error
    }
  }

  // 评论
  async function comment(postId: string, content: string) {
    try {
      const res: any = await request({
        url: `/social/posts/${postId}/comments`,
        method: 'POST',
        data: { content },
      })
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取队伍列表
  async function fetchTeams() {
    try {
      const res: any = await request({
        url: '/social/teams',
        method: 'GET',
      })
      myTeams.value = res.myTeams || []
      joinedTeams.value = res.joinedTeams || []
      return res
    } catch (error) {
      throw error
    }
  }

  // 创建队伍
  async function createTeam(data: { name: string; description?: string; target?: string }) {
    try {
      const res: any = await request({
        url: '/social/teams',
        method: 'POST',
        data,
      })
      myTeams.value.push(res)
      return res
    } catch (error) {
      throw error
    }
  }

  // 加入队伍
  async function joinTeam(teamId: string) {
    try {
      const res: any = await request({
        url: `/social/teams/${teamId}/join`,
        method: 'POST',
      })
      const team = await fetchTeamById(teamId)
      if (team) {
        joinedTeams.value.push(team)
      }
      return res
    } catch (error) {
      throw error
    }
  }

  // 获取排行榜
  async function fetchLeaderboard() {
    try {
      const res: any = await request({
        url: '/social/leaderboard',
        method: 'GET',
      })
      leaderboard.value = res
      return res
    } catch (error) {
      throw error
    }
  }

  async function fetchTeamById(teamId: string) {
    try {
      const res: any = await request({
        url: `/social/teams/${teamId}`,
        method: 'GET',
      })
      return res
    } catch (error) {
      return null
    }
  }

  return {
    posts,
    myTeams,
    joinedTeams,
    leaderboard,
    loading,
    fetchPosts,
    createPost,
    toggleLike,
    comment,
    fetchTeams,
    createTeam,
    joinTeam,
    fetchLeaderboard,
  }
})