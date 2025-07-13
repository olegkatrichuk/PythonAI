'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Wrench, MessageSquare, Eye, Search, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface AdminStats {
  total_users: number
  total_tools: number
  total_reviews: number
  total_page_views: number
  total_searches: number
  unique_visitors_today: number
  new_users_today: number
  top_search_queries: { query: string; count: number }[]
  popular_tools: { id: number; slug: string; name: string; views: number }[]
  recent_reviews: any[]
  daily_stats: {
    id: number
    date: string
    page_views: number
    unique_visitors: number
    new_users: number
    searches: number
    tool_views: number
    reviews_count: number
  }[]
}

export default function AdminDashboard() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/login')
      return
    }

    if (user && !user.is_admin) {
      router.push('/')
      return
    }

    if (user && user.is_admin && token) {
      fetchAdminStats()
    }
  }, [user, token, authLoading, router])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      // Жестко задаем URL, так как переменные окружения не подхватываются
      const apiUrl = 'http://localhost:8000'
      console.log('Fetching admin stats from:', `${apiUrl}/api/admin/stats`);
      console.log('Using token:', token);
      const response = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Ошибка получения статистики')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Ошибка:', error)
      setError('Не удалось загрузить статистику')
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600 dark:text-gray-300">{error || 'Не удалось загрузить данные'}</p>
        </div>
      </div>
    )
  }

  const chartData = stats.daily_stats.slice(-7).map(stat => ({
    date: new Date(stat.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    pageViews: stat.page_views,
    uniqueVisitors: stat.unique_visitors,
    newUsers: stat.new_users
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Админ панель</h1>
        
        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_users_today} сегодня
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Инструменты</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tools}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Отзывы</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_reviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_page_views}</div>
              <p className="text-xs text-muted-foreground">
                {stats.unique_visitors_today} уникальных сегодня
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Графики */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Статистика за неделю</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="pageViews" stroke="#8884d8" name="Просмотры" />
                  <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" name="Уникальные посетители" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Топ поисковых запросов</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.top_search_queries.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="query" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Популярные инструменты и последние отзывы */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Популярные инструменты</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.popular_tools.slice(0, 5).map((tool) => (
                  <div key={tool.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-gray-500">/{tool.slug}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{tool.views}</p>
                      <p className="text-sm text-gray-500">просмотров</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Последние отзывы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recent_reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{'⭐'.repeat(review.rating)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {review.text || 'Без комментария'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      от {review.author?.email || 'Аноним'}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}