import { addDoc, collection, doc, DocumentData, getDoc, getDocs, updateDoc } from "firebase/firestore"
import { Fragment, useCallback, useEffect, useState } from "react"
import { db } from "src/firebase"
import { Category } from "src/Types/category.type"
import CategoryItem from "./Components/CategoryItem"
import { useForm } from "react-hook-form"
import { schemaAddCategory, SchemaCategoryAddType, SchemaCategoryType } from "src/Helpers/rule"
import Input from "src/Components/Input"
import { X } from "lucide-react"
import Button from "src/Components/Button"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"

type FormDataUpdate = Pick<SchemaCategoryType, "id" | "name" | "description" | "documentCount">

const formDataUpdate = schemaAddCategory.pick(["name", "description"])

type FormDataAdd = Pick<SchemaCategoryAddType, "name" | "description" | "documentCount">

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "genres"))
        const categoriesData: Category[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name,
            description: data.description,
            documentCount: data.documentCount
          }
        })
        setCategories(categoriesData)
        setLoading(false)
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error)
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const [categoryId, setCategoryId] = useState<string | null>(null)
  const handleEditItem = useCallback((id: string) => {
    setCategoryId(id)
  }, [])
  const handleExitsEditItem = () => {
    setCategoryId(null)
  }

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit
  } = useForm<FormDataUpdate>({ resolver: yupResolver(formDataUpdate) })

  useEffect(() => {
    if (categoryId) {
      const fetchCategoryId = async () => {
        const docRef = doc(db, "genres", categoryId)
        const docSnap = await getDoc(docRef)
        const data = docSnap.data() as DocumentData
        console.log(data)
        setValue("id", categoryId)
        setValue("name", data?.name || "")
        setValue("description", data?.description || "")
        setValue("documentCount", data?.documentCount || 0)
      }
      fetchCategoryId()
    }
  }, [categoryId, setValue])

  const handleUpdateCategory = handleSubmit(async (data) => {
    if (!data.id) return
    try {
      const docRef = doc(db, "genres", data.id)
      await updateDoc(docRef, {
        name: data.name,
        description: data.description
      })
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === data.id
            ? {
                ...cat,
                name: data.name ?? "", // fallback nếu undefined
                description: data.description ?? ""
              }
            : cat
        )
      )
      handleExitsEditItem()
      toast.success("Cập nhật thể loại thành công!", { autoClose: 1500 })
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error)
      toast.error("Đã xảy ra lỗi khi cập nhật thể loại!", { autoClose: 1500 })
    }
  })

  const [isAdd, setIsAdd] = useState<boolean>(false)

  const handleExitsModalAdd = () => {
    setIsAdd(false)
  }

  const {
    handleSubmit: handleSubmitAdd,
    register: registerAdd,
    reset,
    formState: { errors: errorsAdd }
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataUpdate) })

  const handleAddCategory = handleSubmitAdd(async (data) => {
    try {
      const docRef = await addDoc(collection(db, "genres"), {
        name: data.name,
        description: data.description,
        documentCount: 0
      })

      const newCategoryWithId: Category = {
        id: docRef.id,
        name: data.name as string,
        description: data.description as string,
        documentCount: 0
      }

      setCategories((prev) => [...prev, newCategoryWithId])
      reset() // Reset form sau khi thêm
      setIsAdd(false)
      toast.success("Thêm thể loại thành công!", { autoClose: 1500 })
    } catch (error) {
      console.error("Lỗi khi thêm thể loại:", error)
    }
  })

  if (loading) return <p>Đang tải thể loại...</p>
  return (
    <div className="">
      <h2 className="mt-10 text-2xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text text-center">
        Danh sách thể loại
      </h2>
      <div className="flex justify-end">
        <button
          onClick={() => setIsAdd((prev) => !prev)}
          className="p-4 py-2 bg-blue-500 hover:bg-blue-400 duration-200 rounded-md text-white font-medium"
        >
          Thêm thể loại
        </button>
      </div>
      <div className="mt-4">
        <div className="bg-[#f2f2f2] grid grid-cols-5 items-center gap-2 py-3 border border-[#dedede] px-4 rounded-tl-xl rounded-tr-xl">
          <div className="col-span-1 text-[14px] font-semibold">Id</div>
          <div className="col-span-1 text-[14px] font-semibold">Tên thể loại</div>
          <div className="col-span-1 text-[14px] font-semibold">Mô tả</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Số lượng tài liệu</div>
          <div className="col-span-1 text-[14px] text-center font-semibold">Hành động</div>
        </div>
        <div>
          {categories.length > 0 ? (
            categories?.map((item) => (
              <Fragment key={item.id}>
                <CategoryItem item={item} handleEditItem={handleEditItem} setCategories={setCategories} />
              </Fragment>
            ))
          ) : (
            <div className="text-center mt-4">Không tìm thấy kết quả</div>
          )}
        </div>
        <div>
          {categoryId !== null ? (
            <Fragment>
              <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
              <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                  <X color="gray" size={22} />
                </button>
                <form onSubmit={handleUpdateCategory} className="bg-white dark:bg-darkPrimary rounded-xl w-[900px]">
                  <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin thể loại</h3>
                  <div className="w-full h-[1px] bg-[#dadada]"></div>
                  <div className="p-4 pt-0">
                    <div className="mt-4 grid grid-cols-12 flex-wrap gap-4">
                      <div className="col-span-6">
                        <Input
                          name="id"
                          register={register}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Mã thể loại"
                          disabled
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          name="name"
                          register={register}
                          placeholder="Nhập họ tên"
                          messageErrorInput={errors.name?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Tên thể loại"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          name="description"
                          register={register}
                          placeholder="Nhập mô tả"
                          messageErrorInput={errors.description?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Mô tả"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          name="documentCount"
                          register={register}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Số lượng tài liệu"
                          disabled
                        />
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

        <div>
          {isAdd ? (
            <Fragment>
              <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
              <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <button onClick={handleExitsModalAdd} className="absolute right-2 top-1">
                  <X color="gray" size={22} />
                </button>
                <form onSubmit={handleAddCategory} className="bg-white dark:bg-darkPrimary rounded-xl w-[900px]">
                  <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin thể loại</h3>
                  <div className="w-full h-[1px] bg-[#dadada]"></div>
                  <div className="p-4 pt-0">
                    <div className="mt-4 grid grid-cols-12 flex-wrap gap-4">
                      <div className="col-span-6">
                        <Input
                          name="name"
                          register={registerAdd}
                          placeholder="Nhập họ tên"
                          messageErrorInput={errorsAdd.name?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Tên thể loại"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          name="description"
                          register={registerAdd}
                          placeholder="Nhập mô tả"
                          messageErrorInput={errorsAdd.description?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Mô tả"
                        />
                      </div>
                      <div className="col-span-6">
                        <Input
                          name="documentCount"
                          register={registerAdd}
                          messageErrorInput={errorsAdd.documentCount?.message}
                          classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                          className="relative flex-1"
                          nameInput="Số lượng tài liệu"
                          disabled
                          value={0}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        type="submit"
                        nameButton="Thêm thể loại"
                        classNameButton="w-[150px] py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
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
      </div>
    </div>
  )
}
