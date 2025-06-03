import { Pencil, Trash2 } from "lucide-react"
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
import { formatDate } from "src/Helpers/common"
import { Document } from "src/Types/document.type"

export default function DocumentItem({
  item
  // handleEditItem
}: {
  item: Document
  // handleEditItem: (id: string) => void
}) {
  // const handleEditUserItem = (id: string) => {
  //   handleEditItem(id)
  // }
  console.log(item.isPremium)
  return (
    <div
      className="bg-white grid grid-cols-6 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 last:rounded-bl-xl last:rounded-br-xl"
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
        <button>
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
              <AlertDialogAction className="bg-red-500 hover:bg-red-600">Xóa</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
