/* eslint-disable @typescript-eslint/no-explicit-any */
import { collection, doc, DocumentData, getDoc, getDocs, updateDoc } from "firebase/firestore"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { db, storage } from "src/firebase"
import { User } from "src/Types/user.type"
import UserItem from "./Components/UserItem"
import { X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import { SchemaUserType } from "src/Helpers/rule"
import DateSelect from "src/Components/DateSelect"
import { formatDate } from "src/Helpers/common"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import InputFileImage from "src/Components/InputFileImage"
import AvatarDefault from "src/Assets/img/avatar-default.jpg"
import IconGoogle from "src/Assets/img/iconGoogle.png"
import Icon2 from "src/Assets/img/icon.png"
import { toast } from "react-toastify"
import AddUser from "./Components/AddUser"

type FormDataUpdate = Pick<
  SchemaUserType,
  | "id"
  | "fullName"
  | "email"
  | "accountType"
  | "fcmToken"
  | "address"
  | "dateOfBirth"
  | "createdAt"
  | "lastLogin"
  | "avatar"
  | "googleId"
>

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData: User[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          fullName: data.fullName || "",
          email: data.email || "",
          accountType: data.accountType || "",
          address: data.address || "",
          dateOfBirth: data.dateOfBirth?.toDate?.(),
          lastLogin: data.lastLogin?.toDate?.() || new Date()
        }
      })
      setUsers(usersData)
      setLoading(false)
    } catch (error) {
      console.error("Lỗi khi lấy người dùng:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const [userId, setUserId] = useState<string | null>(null)
  const handleEditItem = useCallback((id: string) => {
    setUserId(id)
  }, [])
  const handleExitsEditItem = () => {
    setUserId(null)
  }

  const {
    register,
    formState: { errors },
    setValue,
    control,
    watch,
    handleSubmit
  } = useForm<FormDataUpdate>({
    defaultValues: {
      id: "",
      fullName: "",
      email: "",
      accountType: "",
      fcmToken: "",
      address: "",
      dateOfBirth: new Date(),
      avatar: "",
      googleId: "",
      createdAt: "",
      lastLogin: ""
    }
  })

  useEffect(() => {
    if (userId) {
      const fetchUserId = async () => {
        const docRef = doc(db, "users", userId)
        const docSnap = await getDoc(docRef)
        const data = docSnap.data() as DocumentData
        let avatarUrl = ""
        try {
          if (data.avatar) {
            if (data.avatar.startsWith("https://")) {
              avatarUrl = data.avatar // dùng luôn nếu là URL
            } else {
              avatarUrl = await getDownloadURL(ref(storage, data.avatar)) // lấy từ Firebase Storage
            }
          } else {
            avatarUrl = AvatarDefault
          }
        } catch (error: any) {
          console.warn("Không tìm thấy ảnh:", error)
        }
        setValue("id", userId)
        setValue("fullName", data?.fullName || "")
        setValue("email", data?.email || "")
        setValue("accountType", data?.accountType || "")
        setValue("fcmToken", data?.fcmToken || "")
        setValue("address", data?.address || "")

        setValue("dateOfBirth", data?.dateOfBirth?.toDate ? new Date(data.dateOfBirth.toDate()) : new Date(1990, 0, 1))
        setValue("createdAt", formatDate(data?.createdAt.toDate()))

        if (data.lastLogin) {
          setValue("lastLogin", formatDate(data?.lastLogin.toDate()))
        } else {
          setValue("lastLogin", "")
        }
        setValue("avatar", avatarUrl)

        if (data.googleId) {
          setValue("googleId", data.googleId)
        } else {
          setValue("googleId", "") // hoặc null nếu muốn dùng undefined checking
        }
      }
      fetchUserId()
    }
  }, [userId, setValue])

  const [file, setFile] = useState<File>()

  const previewImage = useMemo(() => {
    return file ? URL.createObjectURL(file) : ""
  }, [file])

  const handleChangeImage = (file?: File) => {
    setFile(file)
  }

  const handleUpdateUser = handleSubmit(async (data) => {
    if (!data.id) return

    try {
      let avatarPath = data.avatar

      if (file) {
        const fileRef = ref(storage, `avatar/${file.name}`)
        await uploadBytes(fileRef, file)
        avatarPath = fileRef.fullPath // lưu đường dẫn thay vì file
      }

      const docRef = doc(db, "users", data.id)
      await updateDoc(docRef, {
        fullName: data.fullName,
        address: data.address,
        dateOfBirth: data.dateOfBirth,
        avatar: avatarPath
      })

      setUsers((prev) =>
        prev.map((cat) =>
          cat.id === data.id
            ? {
                ...cat,
                fullName: data.fullName ?? "",
                address: data.address,
                dateOfBirth: data.dateOfBirth?.toISOString(),
                avatar: avatarPath
              }
            : cat
        )
      )

      handleExitsEditItem()
      toast.success("Cập nhật người dùng thành công!", { autoClose: 1500 })
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      toast.error("Đã xảy ra lỗi khi cập nhật người dùng!", { autoClose: 1500 })
    }
  })

  const dateOfBirth = watch("dateOfBirth")
  const avatarWatch = watch("avatar")
  const googleId = watch("googleId")

  const [isAdd, setIsAdd] = useState<boolean>(false)

  if (loading) return <p>Đang tải người dùng...</p>
  return (
    <div className="">
      <h2 className="mt-10 text-2xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text text-center">
        Danh sách người dùng
      </h2>
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdd((prev) => !prev)}
          className="p-4 py-2 bg-blue-500 hover:bg-blue-400 duration-200 rounded-md text-white font-medium"
        >
          Thêm người dùng
        </button>
      </div>
      <div className="mt-4">
        <div className="bg-[#f2f2f2] grid grid-cols-12 items-center gap-2 py-3 border border-[#dedede] px-4 rounded-tl-xl rounded-tr-xl">
          <div className="col-span-2 text-[14px] font-semibold">Id</div>
          <div className="col-span-2 text-[14px] font-semibold">Họ Tên</div>
          <div className="col-span-2 text-[14px] font-semibold">Email</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Loại tài khoản</div>
          <div className="col-span-2 text-[14px] text-center font-semibold">Địa chỉ</div>
          <div className="col-span-1 text-[14px] font-semibold">Ngày sinh</div>
          <div className="col-span-1 text-[14px] font-semibold">Lần cuối đăng nhập</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Hành động</div>
        </div>
        <div>
          {users.length > 0 ? (
            users?.map((item) => (
              <Fragment key={item.id}>
                <UserItem item={item} handleEditItem={handleEditItem} setUsers={setUsers} />
              </Fragment>
            ))
          ) : (
            <div className="text-center mt-4">Không tìm thấy kết quả</div>
          )}
        </div>
        <div>
          {userId !== null ? (
            <Fragment>
              <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
              <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                  <X color="gray" size={22} />
                </button>
                <form onSubmit={handleUpdateUser} className="bg-white dark:bg-darkPrimary rounded-xl w-[1000px]">
                  <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin người dùng</h3>
                  <div className="w-full h-[1px] bg-[#dadada]"></div>
                  <div className="p-4 pt-0">
                    <div className="mt-4 flex justify-between gap-4">
                      <div className="grid grid-cols-12 flex-wrap gap-4 w-[70%]">
                        <div className="col-span-3">
                          <Input
                            name="id"
                            register={register}
                            messageErrorInput={errors.id?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Mã người dùng"
                            disabled
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            name="fullName"
                            register={register}
                            placeholder="Nhập họ tên"
                            messageErrorInput={errors.fullName?.message}
                            classNameInput={`mt-1 p-2 w-full border border-[#dedede] ${googleId !== "" ? "bg-[#f2f2f2]" : "bg-white"} focus:border-blue-500 focus:ring-2 outline-none rounded-md`}
                            className="relative flex-1"
                            nameInput="Họ tên"
                            disabled={googleId !== "" ? true : false}
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            name="email"
                            register={register}
                            placeholder="Nhập họ tên"
                            messageErrorInput={errors.email?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Email"
                            disabled
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            name="accountType"
                            register={register}
                            messageErrorInput={errors.accountType?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Loại tài khoản"
                            disabled
                          />
                        </div>
                        <div className="col-span-6">
                          <Controller
                            name="dateOfBirth"
                            control={control}
                            render={({ field }) => {
                              return (
                                <DateSelect
                                  googleId={googleId as string}
                                  value={dateOfBirth}
                                  onChange={field.onChange}
                                  errorMessage={errors.dateOfBirth?.message}
                                />
                              )
                            }}
                          />
                        </div>
                        <div className="col-span-12">
                          <Input
                            name="address"
                            register={register}
                            messageErrorInput={errors.address?.message}
                            classNameInput={`mt-1 p-2 w-full border border-[#dedede] ${googleId !== "" ? "bg-[#f2f2f2]" : "bg-white"} focus:border-blue-500 focus:ring-2 outline-none rounded-md`}
                            className="relative flex-1"
                            nameInput="Địa chỉ"
                            disabled={googleId !== "" ? true : false}
                          />
                        </div>
                        <div className="col-span-12">
                          <Input
                            name="fcmToken"
                            register={register}
                            messageErrorInput={errors.fcmToken?.message}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="FCM-Token"
                            disabled
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            name="createdAt"
                            register={register}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Ngày tạo"
                            disabled
                          />
                        </div>
                        <div className="col-span-6">
                          <Input
                            name="lastLogin"
                            register={register}
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Lần cuối đăng nhập"
                            disabled
                          />
                        </div>
                      </div>
                      <div className="w-[1px] h-[340px] bg-black/20"></div>
                      <div className="text-center">
                        <div className="p-2 px-4 bg-white inline-block  text-black border-blue-500 border rounded-md">
                          {googleId !== "" ? (
                            <div className="flex items-center gap-1">
                              <img src={IconGoogle} alt="Icon" className="w-6 h-6" />
                              <span> Tài khoản google</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <img src={Icon2} alt="Icon" className="w-6 h-6" />
                              <span>Tài khoản</span>
                            </div>
                          )}
                        </div>
                        <div className="mb-2 mt-4">Avatar</div>
                        <img
                          src={previewImage || avatarWatch}
                          className="h-28 w-28 rounded-full mx-auto"
                          alt="avatar default"
                          referrerPolicy="no-referrer"
                        />
                        {googleId !== "" ? (
                          <div>
                            <span className="block mt-2 text-[13px]">
                              Maximum file size is 1 MB Format: .JPEG, .PNG
                            </span>
                            <Button
                              type="button"
                              nameButton="Chọn file"
                              classNameButton="px-4 py-2 bg-blue-500 mt-2 text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                              disabled
                            />
                          </div>
                        ) : (
                          <InputFileImage onChange={handleChangeImage} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        type="submit"
                        nameButton="Cập nhật"
                        classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </Fragment>
          ) : (
            ""
          )}
        </div>

        <div>{isAdd ? <AddUser setIsAdd={setIsAdd} fetchUsers={fetchUsers} /> : ""}</div>
      </div>
    </div>
  )
}
