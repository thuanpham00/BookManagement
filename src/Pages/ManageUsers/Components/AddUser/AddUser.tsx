import { X } from "lucide-react"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Fragment } from "react/jsx-runtime"
import DateSelect from "src/Components/DateSelect"
import Input from "src/Components/Input"
import { schemaAddUser, SchemaUserAddType } from "src/Helpers/rule"
import AvatarDefault from "src/Assets/img/avatar-default.jpg"

import InputFileImage from "src/Components/InputFileImage"
import Button from "src/Components/Button"
import { auth, db, storage } from "src/firebase"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { ref, uploadBytes } from "firebase/storage"
import { addDoc, collection, Timestamp } from "firebase/firestore"
import { yupResolver } from "@hookform/resolvers/yup"
import { toast } from "react-toastify"

type FormDataAdd = Pick<
  SchemaUserAddType,
  "email" | "address" | "avatar" | "createdAt" | "dateOfBirth" | "fullName" | "password"
>

const formDataAdd = schemaAddUser.pick(["fullName", "email", "address", "password"])

export default function AddUser({
  setIsAdd,
  fetchUsers
}: {
  setIsAdd: React.Dispatch<React.SetStateAction<boolean>>
  fetchUsers: () => Promise<void>
}) {
  const {
    handleSubmit: handleSubmitAdd,
    register: registerAdd,
    reset,
    control: controlAdd,
    formState: { errors }
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataAdd) })

  const handleExitsModalAdd = () => {
    setIsAdd(false)
  }

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  const handleAddUser = handleSubmitAdd(async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email as string, data.password as string)
      const user = userCredential.user

      let avatarUrl = AvatarDefault
      const specificDate = new Date()
      const timestamp = Timestamp.fromDate(specificDate)
      if (file) {
        const storageRef = ref(storage, `avatar/${file.name}`)
        await uploadBytes(storageRef, file)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        avatarUrl = storageRef.fullPath
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          fullName: data.fullName,
          email: data.email,
          address: data.address,
          dateOfBirth: data.dateOfBirth || new Date(),
          avatar: avatarUrl,
          createdAt: timestamp
        })
      } else {
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          fullName: data.fullName,
          email: data.email,
          address: data.address,
          dateOfBirth: data.dateOfBirth || new Date(),
          createdAt: timestamp
        })
      }
      // Chuyển đổi ngày giờ thành Timestamp
      fetchUsers()
      reset()
      setFile(undefined)
      setIsAdd(false)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email đã được sử dụng. Vui lòng chọn email khác.", {
          autoClose: 1500
        })
      }
      console.error("Lỗi khi thêm người dùng:", error)
    }
  })

  return (
    <Fragment>
      <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
      <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button onClick={handleExitsModalAdd} className="absolute right-2 top-1">
          <X color="gray" size={22} />
        </button>
        <form onSubmit={handleAddUser} className="bg-white dark:bg-darkPrimary rounded-xl w-[900px]">
          <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin người dùng</h3>
          <div className="w-full h-[1px] bg-[#dadada]"></div>
          <div className="p-4 pt-0">
            <div className="mt-4 grid grid-cols-12 flex-wrap gap-4">
              <div className="col-span-6">
                <Input
                  name="fullName"
                  register={registerAdd}
                  placeholder="Nhập họ tên"
                  messageErrorInput={errors.fullName?.message}
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                  className="relative flex-1"
                  nameInput="Họ tên người dùng"
                />
              </div>
              <div className="col-span-6">
                <Input
                  name="email"
                  register={registerAdd}
                  placeholder="Nhập email"
                  messageErrorInput={errors.email?.message}
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                  className="relative flex-1"
                  nameInput="Email"
                />
              </div>
              <div className="col-span-6">
                <Input
                  type="password"
                  name="password"
                  register={registerAdd}
                  placeholder="Nhập mật khẩu"
                  messageErrorInput={errors.password?.message}
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                  className="relative flex-1"
                  nameInput="Mật khẩu"
                />
              </div>
              <div className="col-span-6">
                <Input
                  name="address"
                  register={registerAdd}
                  placeholder="Nhập địa chỉ"
                  messageErrorInput={errors.address?.message}
                  classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                  className="relative flex-1"
                  nameInput="Địa chỉ"
                />
              </div>
              <div className="col-span-6">
                <Controller
                  name="dateOfBirth"
                  control={controlAdd}
                  render={({ field }) => {
                    return (
                      <DateSelect
                        googleId=""
                        value={field.value}
                        onChange={field.onChange}
                        errorMessage={errors.dateOfBirth?.message}
                      />
                    )
                  }}
                />
              </div>
            </div>
            <div className="mb-2 mt-4">Avatar</div>
            <img
              src={previewImage || AvatarDefault}
              className="h-28 w-28 rounded-full mx-auto"
              alt="avatar default"
              referrerPolicy="no-referrer"
            />
            <InputFileImage onChange={handleChangeImage} />
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                nameButton="Thêm người dùng"
                classNameButton="w-[150px] py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
              />
            </div>
          </div>
        </form>
      </div>
    </Fragment>
  )
}
