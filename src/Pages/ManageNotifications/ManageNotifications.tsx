/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  scheduledAt?: Date | null
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
    type: "system",
    scheduledAt: "" // Thêm trường thời gian hẹn giờ
  })
  const [sending, setSending] = useState(false)

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
            type: data.type || "system",
            scheduledAt: data.scheduledAt
              ? data.scheduledAt.toDate
                ? data.scheduledAt.toDate()
                : new Date(data.scheduledAt)
              : null
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
      type: "system",
      scheduledAt: ""
    })
  }

  const handleEditClick = (notification: Notification) => {
    setSelectedNotification(notification)
    setFormData({
      title: notification.title,
      message: notification.message,
      read: notification.read,
      type: notification.type,
      scheduledAt: notification.scheduledAt
        ? (() => {
            // scheduledAt là Date, cần chuyển về local string cho input
            // Đảm bảo hiển thị đúng local time
            const date = new Date(notification.scheduledAt)
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, "0")
            const day = String(date.getDate()).padStart(2, "0")
            const hours = String(date.getHours()).padStart(2, "0")
            const minutes = String(date.getMinutes()).padStart(2, "0")
            return `${year}-${month}-${day}T${hours}:${minutes}`
          })()
        : ""
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

  const [loading2, setLoading2] = useState<boolean>(false)
  const loadingToastId = "loading-toast"

  const handleSubmit = async () => {
    // Validate dữ liệu trước khi xử lý
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Vui lòng nhập đầy đủ tên và nội dung thông báo!")
      return
    }
    if (formData.scheduledAt) {
      const scheduledDate = new Date(formData.scheduledAt)
      if (scheduledDate <= new Date()) {
        toast.error("Thời gian hẹn giờ phải lớn hơn thời điểm hiện tại!")
        return
      }
    }
    setLoading2(true)
    toast.loading("Vui lòng đợi trong giây lát", {
      toastId: loadingToastId
    })

    try {
      if (formData.type === "system") {
        setTypeNotification("[Thông báo hệ thống] ")
      } else if (formData.type === "user") {
        setTypeNotification("[Thông báo người dùng] ")
      } else {
        setTypeNotification("[Thông báo cảnh báo] ")
      }

      if (isCreating) {
        const newNotification: any = {
          title: formData.title,
          message: formData.message,
          timestamp: new Date(),
          read: false,
          type: formData.type
        }
        if (formData.scheduledAt) {
          newNotification.scheduledAt = new Date(formData.scheduledAt)
        }
        const docRef = await addDoc(collection(db, "notifications"), newNotification)
        setNotifications([{ id: docRef.id, ...newNotification }, ...notifications])
        toast.success("Thêm thông báo thành công!", { autoClose: 1500 })
        toast.dismiss(loadingToastId)
      } else if (selectedNotification) {
        const notificationRef = doc(db, "notifications", selectedNotification.id)
        const updateData: any = {
          title: formData.title,
          message: formData.message,
          read: formData.read,
          type: formData.type,
          timestamp: new Date()
        }
        if (formData.scheduledAt) {
          updateData.scheduledAt = new Date(formData.scheduledAt)
        } else {
          updateData.scheduledAt = null
        }
        await updateDoc(notificationRef, updateData)
        setNotifications(
          notifications.map((notif) =>
            notif.id === selectedNotification.id
              ? {
                  ...notif,
                  ...formData,
                  timestamp: new Date(),
                  scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt) : null
                }
              : notif
          )
        )
        toast.success("Cập nhật thông báo thành công!", { autoClose: 1500 })
        toast.dismiss(loadingToastId)
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
    } finally {
      setLoading2(false)
    }
  }

  useEffect(() => {
    // Khi notifications thay đổi, đặt timer cho các thông báo hẹn giờ chưa gửi
    const now = new Date()
    const timers: NodeJS.Timeout[] = []
    notifications.forEach((notif) => {
      if (notif.scheduledAt && !notif.read) {
        const scheduledTime = notif.scheduledAt instanceof Date ? notif.scheduledAt : new Date(notif.scheduledAt)
        const delay = scheduledTime.getTime() - now.getTime()
        if (delay > 0) {
          const timer = setTimeout(async () => {
            // Gửi thông báo khi đến thời điểm
            setSelectedNotification(notif)
            setFormData({
              title: notif.title,
              message: notif.message,
              read: true,
              type: notif.type,
              scheduledAt: notif.scheduledAt ? new Date(notif.scheduledAt).toISOString().slice(0, 16) : ""
            })
            await handleSendNotificationAuto(notif)
          }, delay)
          timers.push(timer)
        }
      }
    })
    return () => {
      timers.forEach(clearTimeout)
    }
  }, [notifications])

  // Hàm gửi thông báo tự động và cập nhật trạng thái
  const handleSendNotificationAuto = async (notif: Notification) => {
    const tokens = (await getFcmTokens()).filter((t: any) => typeof t === "string" && t.length > 0)
    const typePrefix =
      notif.type === "system"
        ? "[Thông báo hệ thống] "
        : notif.type === "user"
          ? "[Thông báo người dùng] "
          : "[Thông báo cảnh báo] "
    const payload = {
      tokens,
      notification: {
        title: typePrefix + notif.title,
        body: notif.message
      }
    }
    await sendNotification(payload)
    // Cập nhật trạng thái read: true
    await updateDoc(doc(db, "notifications", notif.id), { read: true })
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)))
    toast.success(`Đã gửi thông báo hẹn giờ: ${notif.title}`, { autoClose: 1500 })
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

  const canSendNowWhenCreate = isCreating && formData.title.trim() && formData.message.trim() && !formData.scheduledAt

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
                {[
                  "ID",
                  "Tên thông báo",
                  "Nội dung",
                  "Loại thông báo",
                  "Ngày cập nhật",
                  "Thời gian gửi dự kiến",
                  "Trạng thái",
                  "Hành động"
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
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
                  <td className="px-3 py-4 text-gray-600">
                    {notification.scheduledAt ? new Date(notification.scheduledAt).toLocaleString() : "-"}
                  </td>
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
                    disabled={formData.read}
                  />
                </div>

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi dự kiến</div>
                  <input
                    type="datetime-local"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                    disabled={formData.read}
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
              <div className={`mt-6 flex ${isCreating ? "justify-between" : "justify-between"} items-end`}>
                <div className="flex-1 flex items-end">
                  {/* Nút gửi ngay khi tạo mới, chỉ hiện khi có title, message và không có scheduledAt */}
                  {canSendNowWhenCreate && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!formData.title.trim() || !formData.message.trim()) {
                          toast.error("Vui lòng nhập đầy đủ tên và nội dung thông báo!")
                          return
                        }
                        setSending(true)
                        const tokens = (await getFcmTokens()).filter((t: any) => typeof t === "string" && t.length > 0)
                        const payload = {
                          tokens,
                          notification: {
                            title: formData.title,
                            body: formData.message
                          }
                        }
                        try {
                          // Tạo thông báo trước khi gửi
                          const newNotification: any = {
                            title: formData.title,
                            message: formData.message,
                            timestamp: new Date(),
                            read: false,
                            type: formData.type
                          }
                          const docRef = await addDoc(collection(db, "notifications"), newNotification)
                          await sendNotification(payload)
                          await updateDoc(doc(db, "notifications", docRef.id), { read: true })
                          setNotifications([{ id: docRef.id, ...newNotification, read: true }, ...notifications])
                          toast.success("Đã gửi thông báo thành công!", {
                            autoClose: 1500,
                            onClose: () => {
                              setIsModalOpen(false)
                              setIsCreating(false)
                              setSelectedNotification(null)
                              resetForm()
                            }
                          })
                        } catch (error: any) {
                          toast.error("Gửi thông báo thất bại!")
                        } finally {
                          setSending(false)
                        }
                      }}
                      className={`mt-4 bg-[#4f772d] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:opacity-50 transition-all font-semibold ${sending ? "opacity-60 cursor-not-allowed" : ""}`}
                      disabled={sending}
                      style={{ minWidth: 180 }}
                    >
                      {sending ? (
                        <span className="animate-spin mr-2">
                          <Send />
                        </span>
                      ) : (
                        <Send />
                      )}
                      <span>{sending ? "Đang gửi..." : "Gửi thông báo ngay"}</span>
                    </button>
                  )}
                </div>
                <div className="flex-1 flex justify-end items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={loading2 || formData.read}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
                  >
                    {isCreating ? "Thêm thông báo" : "Cập nhật thông báo"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
