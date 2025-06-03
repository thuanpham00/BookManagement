import { lazy, Suspense } from "react"
import { useRoutes } from "react-router-dom"
import MainLayoutAdmin from "src/Layouts/MainLayout"

const ManageUsers = lazy(() => import("src/Pages/ManageUsers/ManageUsers"))
const ManageCategories = lazy(() => import("src/Pages/ManageCategories/ManageCategories"))
const ManageDocuments = lazy(() => import("src/Pages/ManageDocuments/ManageDocuments"))
const ManageNotifications = lazy(() => import("src/Pages/ManageNotifications/ManageNotifications"))
const ManageTypeAccount = lazy(() => import("src/Pages/ManageTypeAccount/ManageTypeAccount"))

export default function useRouter() {
  const useRouterElement = useRoutes([
    {
      path: "",
      element: <MainLayoutAdmin />,
      children: [
        {
          path: "/",
          element: (
            <Suspense>
              <ManageUsers />
            </Suspense>
          )
        },
        {
          path: "admin/users",
          element: (
            <Suspense>
              <ManageUsers />
            </Suspense>
          )
        },
        {
          path: "admin/categories",
          element: (
            <Suspense>
              <ManageCategories />
            </Suspense>
          )
        },
        {
          path: "admin/documents",
          element: (
            <Suspense>
              <ManageDocuments />
            </Suspense>
          )
        },
        {
          path: "admin/notifications",
          element: (
            <Suspense>
              <ManageNotifications />
            </Suspense>
          )
        },
        {
          path: "admin/type-account",
          element: (
            <Suspense>
              <ManageTypeAccount />
            </Suspense>
          )
        }
      ]
    }
  ])
  return useRouterElement
}
