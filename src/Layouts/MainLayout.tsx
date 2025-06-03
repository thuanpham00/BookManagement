import { memo } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "src/Components/Sidebar"

function MainLayoutInner() {
  return (
    <div className="flex">
      <div className="w-[17%] opacity-1 transition-all ease-in">
        <Sidebar />
      </div>
      <div className="w-[83%] dark:bg-darkSecond">
        <div className="px-4 py-2">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

const MainLayout = memo(MainLayoutInner)
export default MainLayout
