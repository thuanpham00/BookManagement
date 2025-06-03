import { collection, getDocs } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "src/firebase"
import { User } from "src/Types/user.type"

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"))
        console.log("Tổng số người dùng:", querySnapshot.docs.length)
        querySnapshot.docs.forEach((doc) => console.log("User doc:", doc.data()))
        const usersData: User[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            accountType: data.accountType || "user",
            address: data.address || "",
            avatar: data.avatar || "",
            createdAt: data.createdAt?.toDate?.() || new Date(),
            dateOfBirth: data.dateOfBirth?.toDate?.() || new Date(),
            email: data.email || "",
            fcmToken: data.fcmToken || "",
            fullName: data.fullName || "",
            googleId: data.googleId || "",
            lastLogin: data.lastLogin?.toDate?.() || new Date()
          }
        })
        setUsers(usersData)
        setLoading(false)
      } catch (error) {
        console.error("Lỗi khi lấy người dùng:", error)
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <p>Đang tải người dùng...</p>
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Danh sách người dùng</h2>
      <table className="table-auto w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Vai trò</th>
            <th className="border px-4 py-2">Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2">{user.accountType}</td>
              <td className="border px-4 py-2">{user.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
