import { collection, getDocs } from "firebase/firestore"
import { Fragment, useEffect, useState } from "react"
import { db } from "src/firebase"
import { Document } from "src/Types/document.type"
import DocumentItem from "./Components/DocumentItem"

export default function ManageDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "documents"))
        const documentsData: Document[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          console.log(data)
          return {
            id: doc.id,
            author: data.author,
            isPremium: data.isPremium,
            title: data.title,
            publishDate: data.publishDate.toDate()
          }
        })
        setDocuments(documentsData)
        setLoading(false)
      } catch (error) {
        console.error("Lỗi khi lấy tài liệu:", error)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])
  if (loading) return <p>Đang tải tài liệu...</p>
  return (
    <div className="">
      <h2 className="mt-10 text-2xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text text-center">
        Danh sách tài liệu
      </h2>
      <div className="mt-4">
        <div className="bg-[#f2f2f2] grid grid-cols-6 items-center gap-2 py-3 border border-[#dedede] px-4 rounded-tl-xl rounded-tr-xl">
          <div className="col-span-1 text-[14px] font-semibold">Id</div>
          <div className="col-span-1 text-[14px] font-semibold">Tác giả</div>
          <div className="col-span-1 text-[14px] font-semibold">Tên tài liệu</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Loại sách</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Ngày xuất bản</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Hành động</div>
        </div>
        <div>
          {documents.length > 0 ? (
            documents?.map((item) => (
              <Fragment key={item.id}>
                <DocumentItem item={item} />
              </Fragment>
            ))
          ) : (
            <div className="text-center mt-4">Không tìm thấy kết quả</div>
          )}
        </div>
        {/* <div>
          {userId !== null ? (
            <Fragment>
              <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
              <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                  <X color="gray" size={22} />
                </button>
                <form className="bg-white dark:bg-darkPrimary rounded-xl w-[900px]">
                  <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin người dùng</h3>
                  <div className="w-full h-[1px] bg-[#dadada]"></div>
                  <div className="p-4 pt-0">
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="grid grid-cols-12 flex-wrap gap-4">
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
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Họ tên"
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
                            name="date_of_birth"
                            control={control}
                            render={({ field }) => {
                              return (
                                <DateSelect
                                  value={dateOfBirth}
                                  onChange={field.onChange}
                                  errorMessage={errors.date_of_birth?.message}
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
                            classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                            className="relative flex-1"
                            nameInput="Địa chỉ"
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
                        <div className="mb-2">Avatar</div>
                        <img
                          src={previewImage || avatarWatch}
                          className="h-28 w-28 rounded-full mx-auto"
                          alt="avatar default"
                        />
                        <InputFileImage onChange={handleChangeImage} />
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
        </div> */}
      </div>
    </div>
  )
}
