import { deleteDoc, doc } from "firebase/firestore"
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
import { formatDate } from "src/Helpers/common"
import { Document } from "src/Types/document.type"

export default function DocumentItem({
  item,
  handleEditItem,
  setDocuments
}: {
  item: Document
  handleEditItem: (id: string) => void
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>
}) {
  const handleEditUserItem = (id: string) => {
    handleEditItem(id)
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDoc(doc(db, "documents", documentId))
      // Xoá khỏi state sau khi xoá Firebase thành công
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
      toast.success("Xóa tài liệu thành công", { autoClose: 1500 })
    } catch (error) {
      console.error("Lỗi khi xoá tài liệu:", error)
    }
  }

  return (
    <div
      className="bg-white grid grid-cols-6 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4"
      key={item.id}
    >
      <div className="col-span-1 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500 font-semibold">{item.id}</div>
      </div>
      <div className="col-span-1">{item.author}</div>
      <div className="col-span-1 break-words">{item.title}</div>
      <div className="col-span-1 text-center text-red-500 font-semibold">
        {item.isPremium === true ? "premium" : "normal"}
      </div>
      <div className="col-span-1 text-center">{item.publishDate ? formatDate(item.publishDate as string) : ""}</div>
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
              <AlertDialogAction onClick={() => handleDeleteDocument(item.id)} className="bg-red-500 hover:bg-red-600">
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
