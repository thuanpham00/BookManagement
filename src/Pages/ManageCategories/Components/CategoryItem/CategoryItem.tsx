import { collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "src/Components/ui/alert-dialog"
import { db } from "src/firebase"
import { Category } from "src/Types/category.type"

export default function CategoryItem({
  item,
  handleEditItem,
  setCategories
}: {
  item: Category
  handleEditItem: (id: string) => void
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>
}) {
  const handleEditUserItem = (id: string) => {
    handleEditItem(id)
  }

  const canDeleteGenre = async (categoryId: string): Promise<boolean> => {
    const docsRef = collection(db, "documents")
    const q = query(docsRef, where("genreIds", "array-contains", categoryId))

    const querySnapshot = await getDocs(q)
    return querySnapshot.empty // true nếu không có tài liệu nào dùng genre này
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const canDelete = await canDeleteGenre(categoryId)

      if (!canDelete) {
        toast.error("Không thể xóa thể loại này vì đang được sử dụng trong tài liệu.", { autoClose: 1500 })
        return
      }

      await deleteDoc(doc(db, "genres", categoryId))
      // Xoá khỏi state sau khi xoá Firebase thành công
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      toast.success("Xóa thể loại thành công", { autoClose: 1500 })
    } catch (error) {
      console.error("Lỗi khi xoá thể loại:", error)
    }
  }

  return (
    <div
      className="bg-white grid grid-cols-5 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4"
      key={item.id}
    >
      <div className="col-span-1 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500 font-semibold">{item.id}</div>
      </div>
      <div className="col-span-1">{item.name}</div>
      <div className="col-span-1 break-words">{item.description}</div>
      <div className="col-span-1 text-center">{item.documentCount}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditUserItem(item.id)}>
          <Pencil color="orange" size={18} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger>
            <Trash2 color="red" size={18} />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
              <AlertDialogDescription>
                Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn dữ liệu của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteCategory(item.id)} className="bg-red-500 hover:bg-red-600">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
