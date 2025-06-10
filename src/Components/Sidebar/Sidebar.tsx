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
    <div className="sticky top-0 left-0 p-4 bg-gradient-to-b from-[#00509d] to-[#003366] h-screen border-r border-[#dedede] shadow-2xl min-w-[260px] flex flex-col">
      <div className="flex flex-col items-center justify-center gap-3 mb-10">
        <div className="flex items-center gap-6">
          <img src="/vite.svg" alt="Readify Logo" className="w-12 h-12 rounded-full shadow-lg bg-white" />
          <span className="text-3xl font-extrabold text-white tracking-widest drop-shadow-lg" style={{ letterSpacing: 2 }}>Readify Admin</span>
        </div>
      </div>
      <div className="flex-1 mt-4">
        {sideBarList.map((item, index) => {
          const isActive =
            location.pathname === "/" && item.path === "/admin/users" ? true : location.pathname.startsWith(item.path)
          const IconComponent = item.icon
          return (
            <SidebarItem
              key={index}
              className={`text-[15px] ${
                isActive
                  ? "text-[#00509d] font-bold"
                  : "text-white font-medium hover:text-[#e0e0e0] duration-200 ease-in"
              }`}
              classNameWrapper={`flex items-center gap-3 cursor-pointer mb-3 rounded-${isActive ? "2xl" : "lg"} p-3 transition-all ${
                isActive ? "bg-white/90 border border-[#e0e0e0] shadow-md" : "hover:bg-white/10"
              }`}
              icon={<IconComponent color={isActive ? "#00509d" : "white"} size={20} />}
              nameSideBar={item.name}
              path={item.path}
            />
          )
        })}
      </div>
    </div>
  )
}
