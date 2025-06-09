import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { db } from "src/firebase"
import { motion, AnimatePresence } from "framer-motion"
import { Pencil, Plus, Trash } from "lucide-react"
import { toast } from "react-toastify"

interface AccountType {
  id: string
  name: string
  description: string
  price: number
  canAccessPremium: boolean
  maxOfflineDownloads: number
  benefits: string[]
}

export default function ManageTypeAccount() {
  const [accountTypes, setAccountTypes] = useState<AccountType[]>([])
  const [selectedType, setSelectedType] = useState<AccountType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Omit<AccountType, "id">>({
    name: "",
    description: "",
    price: 0,
    canAccessPremium: false,
    maxOfflineDownloads: 0,
    benefits: []
  })

  useEffect(() => {
    const fetchAccountTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "accountTypes"))
        const types: AccountType[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "",
            description: data.description || "",
            price: data.price || 0,
            canAccessPremium: data.canAccessPremium || false,
            maxOfflineDownloads: data.maxOfflineDownloads || 0,
            benefits: data.benefits || []
          }
        })
        setAccountTypes(types)
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu accountTypes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccountTypes()
  }, [])

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      canAccessPremium: false,
      maxOfflineDownloads: 0,
      benefits: []
    })
  }

  const handleEditClick = (type: AccountType) => {
    setSelectedType(type)
    setFormData({
      name: type.name,
      description: type.description,
      price: type.price,
      canAccessPremium: type.canAccessPremium,
      maxOfflineDownloads: type.maxOfflineDownloads,
      benefits: type.benefits
    })
    setIsCreating(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (typeName: string) => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const isTypeUsed = usersSnapshot.docs.some((doc) => doc.data().accountType === typeName)

      if (isTypeUsed) {
        alert("Không thể xóa vì loại tài khoản này đang được sử dụng bởi người dùng.")
        return
      }

      if (confirm("Bạn có chắc chắn muốn xóa loại tài khoản này?")) {
        const typeDoc = accountTypes.find((t) => t.name === typeName)
        if (typeDoc?.id) {
          await deleteDoc(doc(db, "accountTypes", typeDoc.id))
          setAccountTypes(accountTypes.filter((t) => t.id !== typeDoc.id))
        }
      }
    } catch (error) {
      console.error("Lỗi khi xóa loại tài khoản:", error)
    }
  }

  const [loading2, setLoading2] = useState<boolean>(false)
  const loadingToastId = "loading-toast"

  const handleSubmit = async () => {
    setLoading2(true)
    toast.loading("Vui lòng đợi trong giây lát", {
      toastId: loadingToastId
    })

    try {
      const data = { ...formData }

      if (isCreating) {
        const docRef = await addDoc(collection(db, "accountTypes"), data)
        setAccountTypes([{ id: docRef.id, ...data }, ...accountTypes])
        toast.success("Thêm loại tài khoản thành công!", { autoClose: 1500 })
        toast.dismiss(loadingToastId)
      } else if (selectedType) {
        const docRef = doc(db, "accountTypes", selectedType.id)
        await updateDoc(docRef, data)
        setAccountTypes(accountTypes.map((type) => (type.id === selectedType.id ? { ...type, ...data } : type)))
        toast.success("Cập nhật loại tài khoản thành công!", { autoClose: 1500 })
        toast.dismiss(loadingToastId)
      }

      setIsModalOpen(false)
      setIsCreating(false)
      setSelectedType(null)
      resetForm()
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
    } finally {
      setLoading2(false)
    }
  }

  const formatCurrency = (value: number | string): string => {
    const num = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value

    return new Intl.NumberFormat("vi-VN").format(num)
  }

  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/\./g, ""))
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
          Quản lý loại tài khoản
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
          <Plus /> Thêm loại tài khoản
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
                {["ID", "Trạng thái", "Mô tả", "Giá", "Premium", "Tải offline", "Hành động"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accountTypes.map((type, index) => (
                <motion.tr
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-blue-800">{type.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{type.name}</td>
                  <td className="px-6 py-4 text-gray-600">{type.description}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(type.price)} VNĐ</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${type.canAccessPremium ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {type.canAccessPremium ? "Có" : "Không"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{type.maxOfflineDownloads}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditClick(type)}
                        className="text-yellow-500 hover:text-yellow-700"
                      >
                        <Pencil size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(type.name)}
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
                  {isCreating ? "Thêm loại tài khoản" : "Cập nhật loại tài khoản"}
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
                      value={selectedType?.id}
                      disabled
                    />
                  </div>
                )}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Tên loại tài khoản</div>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Tên loại tài khoản"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Mô tả</div>
                  <input
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Mô tả chi tiết"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Giá (VNĐ)</div>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Giá"
                    value={formatCurrency(formData.price.toString())}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, "")
                      if (rawValue === "") {
                        setFormData({ ...formData, price: 0 })
                      } else {
                        const parsedValue = parseCurrency(rawValue)
                        setFormData({ ...formData, price: parsedValue })
                      }
                    }}
                    onBlur={(e) => {
                      const rawValue = e.target.value.replace(/\./g, "")
                      if (rawValue === "") {
                        setFormData({ ...formData, price: 0 })
                      } else {
                        const parsedValue = parseFloat(rawValue)
                        setFormData({ ...formData, price: parsedValue })
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Tải offline tối đa</div>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Số lượng tải offline"
                    value={formData.maxOfflineDownloads}
                    onChange={(e) => setFormData({ ...formData, maxOfflineDownloads: +e.target.value })}
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                    checked={formData.canAccessPremium}
                    onChange={(e) => setFormData({ ...formData, canAccessPremium: e.target.checked })}
                  />
                  <div className="text-sm font-medium text-gray-700">Quyền truy cập Premium</div>
                </div>
                <div className="col-span-2">
                  <div className="block text-sm font-medium text-gray-700 mb-2">Lợi ích</div>
                  <div className="space-y-3">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          value={benefit}
                          placeholder={`Lợi ích ${index + 1}`}
                          onChange={(e) => {
                            const updated = [...formData.benefits]
                            updated[index] = e.target.value
                            setFormData({ ...formData, benefits: updated })
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                          onClick={() => {
                            const updated = [...formData.benefits]
                            updated.splice(index, 1)
                            setFormData({ ...formData, benefits: updated })
                          }}
                        >
                          ✕
                        </motion.button>
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className="text-sm px-4 py-2 border border-dashed border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-all"
                      onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ""] })}
                    >
                      + Thêm lợi ích
                    </motion.button>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={loading2 ? true : false}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  {isCreating ? "Tạo" : "Cập nhật"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
