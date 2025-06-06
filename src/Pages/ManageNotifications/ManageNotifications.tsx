import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Plus, Send, Trash } from "lucide-react"
import { db, functions } from "src/firebase"
import { httpsCallable } from "firebase/functions"
import { toast } from "react-toastify"
interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  type: string
}

export default function ManageNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    read: false,
    type: "system"
  })

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "notifications"))
        const notificationsData: Notification[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title || "",
            message: data.message || "",
            timestamp: data.timestamp?.toDate?.() || new Date(),
            read: data.read || false,
            type: data.type || "system"
          }
        })
        setNotifications(notificationsData)
      } catch (error) {
        console.error("Lỗi khi lấy thông báo:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      read: false,
      type: "system"
    })
  }

  const handleEditClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      read: notification.read,
      type: notification.type
    })
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      if (confirm("Bạn có chắc chắn muốn xóa thông báo này?")) {
        await deleteDoc(doc(db, "notifications", id))
        setNotifications(notifications.filter((n) => n.id !== id))
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error)
    }
  }

  // Lấy danh sách FCM tokens từ Firestore
  const getFcmTokens = async () => {
    const querySnapshot = await getDocs(collection(db, "users"))
    const tokens = querySnapshot.docs.map((doc) => doc.data().fcmToken).filter((token) => token)
    return tokens
  }

  // Gửi thông báo qua Cloud Function
  const sendNotification = httpsCallable(functions, "sendNotification")
  const [typeNotification, setTypeNotification] = useState("")

  const handleSubmit = async () => {
    try {
      if (formData.type === "system") {
        setTypeNotification("[Thông báo hệ thống] ")
      } else if (formData.type === "user") {
        setTypeNotification("[Thông báo người dùng] ")
      } else {
        setTypeNotification("[Thông báo cảnh báo] ")
      }

      if (isCreating) {
        const newNotification = {
          title: formData.title,
          message: formData.message,
          timestamp: new Date(),
          read: false,
          type: formData.type
        }
        const docRef = await addDoc(collection(db, "notifications"), newNotification)
        setNotifications([{ id: docRef.id, ...newNotification }, ...notifications])
      } else if (selectedNotification) {
        const notificationRef = doc(db, "notifications", selectedNotification.id)
        await updateDoc(notificationRef, {
          title: formData.title,
          message: formData.message,
          read: formData.read,
          type: formData.type,
          timestamp: new Date()
        })
        setNotifications(
          notifications.map((notif) =>
            notif.id === selectedNotification.id ? { ...notif, ...formData, timestamp: new Date() } : notif
          )
        )
      }

      setIsModalOpen(false)
      setIsCreating(false)
      setSelectedNotification(null)
      resetForm()
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo:", error)
      if (error instanceof Error) {
        console.error("Error message:", error.message)
      }
    }
  }

  const handleSendNotification = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tokens = (await getFcmTokens()).filter((t: any) => typeof t === "string" && t.length > 0)

    const payload = {
      tokens,
      notification: {
        title: typeNotification + formData.title,
        body: formData.message
      }
    }
    formData.read = true
    const result = await sendNotification(payload)
    console.log(result)
    toast.success("Đã gửi thông báo thành công xuống các thiết bị!", { autoClose: 1500 })
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Quản lý thông báo
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
          onClick={() => {
            setIsCreating(true)
            resetForm()
            setIsModalOpen(true)
          }}
        >
          <Plus /> Thêm thông báo
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                {["ID", "Tên thông báo", "Nội dung", "Loại thông báo", "Ngày cập nhật", "Trạng thái", "Hành động"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification, index) => (
                <motion.tr
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-4 font-medium text-blue-800">{notification.id}</td>
                  <td className="px-3 py-4 text-gray-800">{notification.title}</td>
                  <td className="px-3 py-4 text-gray-600">{notification.message}</td>
                  <td className="px-3 py-4 text-gray-600">{notification.type}</td>
                  <td className="px-3 py-4 text-gray-600">{notification.timestamp.toLocaleString()}</td>
                  <td className="px-3 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${notification.read ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {notification.read ? "Đã gửi" : "Chưa gửi"}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClick(notification)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        <Pencil color="orange" size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={18} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-2xl w-11/12 max-w-4xl shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isCreating ? "Thêm thông báo" : "Cập nhật thông báo"}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </motion.button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {!isCreating && (
                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">ID</div>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                      value={selectedNotification?.id}
                      disabled
                    />
                  </div>
                )}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Tên thông báo</div>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tên thông báo"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</div>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="system">Hệ thống</option>
                    <option value="user">Người dùng</option>
                    <option value="alert">Cảnh báo</option>
                  </select>
                </div>

                {!isCreating && (
                  <div>
                    <div className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</div>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={formData.read ? "read" : "unread"}
                      onChange={(e) => setFormData({ ...formData, read: e.target.value === "read" })}
                      disabled
                    >
                      <option value="unread">Chưa đọc</option>
                      <option value="read">Đã đọc</option>
                    </select>
                  </div>
                )}

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Nội dung</div>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Nội dung thông báo"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                {!isCreating && (
                  <>
                    <div>
                      <div className="block text-sm font-medium text-gray-700 mb-2">Thời gian cập nhật</div>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                        value={selectedNotification?.timestamp.toLocaleString()}
                        disabled
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-between">
                {!isCreating && (
                  <button
                    type="button"
                    onClick={handleSendNotification}
                    className="mt-4 bg-[#4f772d] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2  hover:opacity-50 transition-all font-semibold"
                  >
                    <Send />
                    <span>Gửi thông báo xuống người dùng</span>
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
                >
                  {isCreating ? "Thêm thông báo" : "Cập nhật thông báo"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
