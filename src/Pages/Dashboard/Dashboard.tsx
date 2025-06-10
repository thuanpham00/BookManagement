import { useEffect, useState } from "react"
import { Bar } from "react-chartjs-2"
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js"
import { collection, getDocs } from "firebase/firestore"
import { db } from "src/firebase"

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function Dashboard() {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    reads: 0,
    accessFrequency: [] as { date: string; count: number }[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Lấy số lượng sách
      const booksSnap = await getDocs(collection(db, "documents"))
      // Lấy số lượng người dùng
      const usersSnap = await getDocs(collection(db, "users"))
      // Lấy tổng số lượt đọc (cộng dồn viewCount của từng document)
      let reads = 0
      booksSnap.forEach((doc) => {
        const data = doc.data()
        reads += typeof data.viewCount === "number" ? data.viewCount : 0
      })
      // Lấy tần suất truy cập gần đây (dựa vào trường lastLogin của users)
      const freqMap: Record<string, number> = {}
      usersSnap.forEach((doc) => {
        const data = doc.data()
        let d: Date | null = null
        if (data.lastLogin?.toDate) d = data.lastLogin.toDate()
        else if (data.lastLogin) d = new Date(data.lastLogin)
        if (d) {
          const dateStr = d.toLocaleDateString()
          freqMap[dateStr] = (freqMap[dateStr] || 0) + 1
        }
      })
      const accessFrequency = Object.entries(freqMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setStats({
        books: booksSnap.size,
        users: usersSnap.size,
        reads,
        accessFrequency
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  if (loading)
    return <div className="flex justify-center items-center h-[60vh] text-xl font-bold">Đang tải thống kê...</div>

  // Dữ liệu biểu đồ
  const barData = {
    labels: stats.accessFrequency.map((d) => d.date),
    datasets: [
      {
        label: "Tần suất truy cập",
        data: stats.accessFrequency.map((d) => d.count),
        backgroundColor: "#38bdf8"
      }
    ]
  }

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <h2 className="text-3xl font-bold text-[#00509d] mb-8 text-center drop-shadow-lg">Thống kê tổng quan hệ thống</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-5xl font-bold text-blue-600 mb-2">{stats.books}</span>
          <span className="text-lg font-semibold text-gray-700">Số lượng sách</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-5xl font-bold text-green-500 mb-2">{stats.users}</span>
          <span className="text-lg font-semibold text-gray-700">Số lượng người dùng</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <span className="text-5xl font-bold text-orange-400 mb-2">{stats.reads}</span>
          <span className="text-lg font-semibold text-gray-700">Số lượt đọc</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div
          className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2 flex flex-col items-center justify-center"
          style={{ height: 420, minHeight: 420 }}
        >
          <h3 className="text-xl font-bold text-blue-700 mb-4">Tần suất truy cập gần đây</h3>
          <Bar
            data={barData}
            options={{ maintainAspectRatio: false, responsive: true, plugins: { legend: { display: false } } }}
            height={380}
          />
        </div>
      </div>
    </div>
  )
}
