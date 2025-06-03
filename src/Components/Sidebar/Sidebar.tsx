import { useLocation } from "react-router-dom"
import { Book, Bell, Bookmark, User, ChartBarStacked } from "lucide-react"
import SidebarItem from "../SidebarItem"

const sideBarList = [
  { name: "Quản lý Người dùng", icon: User, path: "/admin/users" },
  { name: "Quản lý Tài liệu", icon: Book, path: "/admin/documents" },
  { name: "Quản lý Thể loại", icon: ChartBarStacked, path: "/admin/categories" },
  { name: "Quản lý Thông báo", icon: Bell, path: "/admin/notifications" },
  { name: "Quản lý Loại tài khoản", icon: Bookmark, path: "/admin/type-account" }
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <div className="sticky top-0 left-0 p-4 bg-[#00509d] h-screen border-r border-[#dedede] shadow-xl">
      <div>
        <div className="flex items-center justify-center gap-1">
          <Book color="white" />
          <span className="text-white text-xl font-semibold text-center">Quản lý tài liệu</span>
        </div>
        <div className="mt-8">
          {sideBarList.map((item, index) => {
            const isActive =
              location.pathname === "/" && item.path === "/admin/users" ? true : location.pathname.startsWith(item.path)

            const IconComponent = item.icon
            return (
              <SidebarItem
                key={index}
                className={`text-[14px] ${
                  isActive
                    ? "text-black font-semibold"
                    : "text-white font-medium hover:text-[#f2f2f2] duration-200 ease-in"
                }`}
                classNameWrapper={`flex items-center gap-2 cursor-pointer mb-4 rounded-${isActive ? "xl" : "sm"} p-2 ${
                  isActive ? "bg-[#f1f1f1] border border-gray-200 shadow-lg" : ""
                }`}
                icon={<IconComponent color={isActive ? "black" : "white"} />}
                nameSideBar={item.name}
                path={item.path}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
