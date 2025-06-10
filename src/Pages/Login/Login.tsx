/* eslint-disable @typescript-eslint/no-explicit-any */
import { yupResolver } from "@hookform/resolvers/yup"
import { useContext } from "react"
import { Helmet } from "react-helmet-async"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import Button from "src/Components/Button"
import Input from "src/Components/Input"
import { AppContext } from "src/Context/authContext"
import { setFlagToLS } from "src/Helpers/auth"
import { schemaAuth, SchemaAuthType } from "src/Helpers/rule"

type FormData = Pick<SchemaAuthType, "email" | "password">
const formData = schemaAuth.pick(["email", "password"])

export default function Login() {
  const { setIsAuthenticated } = useContext(AppContext)
  const {
    formState: { errors },
    register,
    reset,
    handleSubmit
  } = useForm<FormData>({ resolver: yupResolver(formData) })

  const handleSubmitForm = handleSubmit((data) => {
    if (data.email === "admin@gmail.com" && data.password === "admin123@") {
      setIsAuthenticated(true)
      setFlagToLS("true")
    } else {
      toast.error("Thông tin không chính xác!", { autoClose: 1500 })
      reset()
    }
  })

  return (
    <div>
      <Helmet>
        <title>Đăng nhập tài khoản</title>
        <meta name="description" content="Đây là trang đăng nhập người dùng của hệ thống" />
      </Helmet>
      <div className="h-screen flex items-center justify-center">
        <div className="p-6 w-[400px] bg-white rounded-lg shadow-md">
          <div className="flex items-center text-center justify-center mt-2 mb-[10px]">
            <span className="text-4xl">📚</span>
            <span className=" text-2xl font-extrabold text-black/80 tracking-widest drop-shadow-lg">Readify Admin</span>
          </div>
          <h1 className="text-lg font-semibold text-center mt-2 text-[#000] dark:text-[#fff]">
            Đăng nhập trang quản lý
          </h1>
          <form onSubmit={handleSubmitForm} className="mt-2">
            <Input
              name="email"
              register={register}
              placeholder="Nhập email"
              messageErrorInput={errors.email?.message}
              nameInput="Email"
            />
            <Input
              name="password"
              register={register}
              placeholder="Nhập mật khẩu"
              messageErrorInput={errors.password?.message}
              nameInput="Mật khẩu"
              type="password"
              classNameError="text-red-500 text-[13px] font-semibold min-h-[2.25rem] block"
              classNameEye="absolute right-2 top-[40%] -translate-y-1/2"
            />
            <Button
              classNameButton="mt-1 p-4 bg-blue-500 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
              nameButton="Đăng nhập"
              type="submit"
            />
          </form>
        </div>
      </div>
    </div>
  )
}
