import { lazy, Suspense, useContext } from "react"
import { Navigate, Outlet, useRoutes } from "react-router-dom"
import { AppContext } from "src/Context/authContext"
import MainLayoutAdmin from "src/Layouts/MainLayout"
import Dashboard from "src/Pages/Dashboard"

const ManageUsers = lazy(() => import("src/Pages/ManageUsers/ManageUsers"))
const ManageCategories = lazy(() => import("src/Pages/ManageCategories/ManageCategories"))
const ManageDocuments = lazy(() => import("src/Pages/ManageDocuments/ManageDocuments"))
const ManageNotifications = lazy(() => import("src/Pages/ManageNotifications/ManageNotifications"))
const ManageTypeAccount = lazy(() => import("src/Pages/ManageTypeAccount/ManageTypeAccount"))
const Login = lazy(() => import("src/Pages/Login/Login"))

const ProtectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to={"/login"} />
}

const RejectRouter = () => {
  const { isAuthenticated } = useContext(AppContext)
  return !isAuthenticated ? <Outlet /> : <Navigate to={"/admin/users"} />
}

export default function useRouter() {
  const useRouterElement = useRoutes([
    {
      path: "",
      element: <ProtectRouter />,
      children: [
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
            },
            {
              path: "admin/dashboard",
              element: (
                <Suspense>
                  <Dashboard />
                </Suspense>
              )
            }
          ]
        }
      ]
    },
    {
      path: "/login",
      element: <RejectRouter />,
      children: [
        {
          path: "",
          element: (
            <Suspense>
              <Login />
            </Suspense>
          )
        }
      ]
    }
  ])
  return useRouterElement
}
