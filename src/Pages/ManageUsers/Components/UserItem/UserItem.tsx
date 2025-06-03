import { Pencil } from "lucide-react"
import { formatDate } from "src/Helpers/common"
import { User } from "src/Types/user.type"

export default function UserItem({
  item,
  handleEditItem
}: {
  item: User
  handleEditItem: (id: string) => void
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
}) {
  const handleEditUserItem = (id: string) => {
    handleEditItem(id)
  }

  return (
    <div
      className="bg-white dark:bg-darkPrimary grid grid-cols-12 items-center gap-2 py-3 cursor-pointer border-t-0 border border-[#dedede] dark:border-darkBorder px-4 last:rounded-bl-xl last:rounded-br-xl"
      key={item.id}
    >
      <div className="col-span-2 flex items-center justify-between">
        <div className="truncate w-[75%] text-blue-500 font-semibold">{item.id}</div>
      </div>
      <div className="col-span-2">{item.fullName}</div>
      <div className="col-span-2 break-words">{item.email}</div>
      <div className="col-span-1 text-center">{item.accountType}</div>
      <div className="col-span-2 text-center">{item.address}</div>
      <div className="col-span-1">{item.dateOfBirth ? formatDate(item.dateOfBirth as string) : ""}</div>
      <div className="col-span-1">{formatDate(item.lastLogin as string)}</div>
      <div className="col-span-1 flex items-center justify-center gap-2">
        <button onClick={() => handleEditUserItem(item.id)}>
          <Pencil color="orange" size={18} />
        </button>
      </div>
    </div>
  )
}
