/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  increment,
  Timestamp,
  updateDoc,
  writeBatch
} from "firebase/firestore"
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { db, storage } from "src/firebase"
import { Document } from "src/Types/document.type"
import DocumentItem from "./Components/DocumentItem"
import Input from "src/Components/Input"
import Button from "src/Components/Button"
import { Controller, useForm } from "react-hook-form"
import { Plus, X } from "lucide-react"
import { schemaDocument, SchemaDocumentType } from "src/Helpers/rule"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import InputFileImage from "src/Components/InputFileImage"
import Select from "react-select"
import { toast } from "react-toastify"
import { yupResolver } from "@hookform/resolvers/yup"
import { formatDateTimeLocal } from "src/Helpers/common"
import { motion } from "framer-motion"
import AddDocument from "./Components/AddDocument"

type FormDataUpdate = Pick<
  SchemaDocumentType,
  | "author"
  | "coverImage"
  | "description"
  | "fileUrl"
  | "genreIds"
  | "id"
  | "isPremium"
  | "language"
  | "pageCount"
  | "publishDate"
  | "title"
  | "viewCount"
>

const formDataUpdate = schemaDocument.pick([
  "author",
  "coverImage",
  "description",
  "fileUrl",
  "genreIds",
  "id",
  "isPremium",
  "language",
  "pageCount",
  "publishDate",
  "title",
  "viewCount"
])

export default function ManageDocuments() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [allGenres, setAllGenres] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchAllGenres = async () => {
      const snapshot = await getDocs(collection(db, "genres"))
      const genres = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name
      }))
      setAllGenres(genres)
    }

    fetchAllGenres()
  }, [])

  const genreOptions = allGenres.map((genre) => ({
    value: genre.id,
    label: genre.name
  }))

  const fetchDocuments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "documents"))
      const documentsData: Document[] = querySnapshot.docs.map((doc) => {
        const data = doc.data()
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

  useEffect(() => {
    fetchDocuments()
  }, [])

  const [documentId, setDocumentId] = useState<string | null>(null)

  const handleEditItem = useCallback((id: string) => {
    setDocumentId(id)
  }, [])

  const handleExitsEditItem = () => {
    setDocumentId(null)
    setFileImage(null)
    setFilePDF(null)
  }

  const {
    register,
    formState: { errors },
    setValue,
    control,
    watch,
    handleSubmit
  } = useForm<FormDataUpdate>({ resolver: yupResolver(formDataUpdate) })

  const fetchGenresId = async (genreIds: string[]) => {
    const genrePromises = genreIds.map(async (genreId) => {
      const docRef = doc(db, "genres", genreId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    })

    const genres = await Promise.all(genrePromises)
    return genres.filter((genre) => genre !== null)
  }

  useEffect(() => {
    if (documentId) {
      const fetchUserId = async () => {
        const docRef = doc(db, "documents", documentId)
        const docSnap = await getDoc(docRef)
        const data = docSnap.data() as DocumentData

        setValue("id", documentId)
        setValue("author", data?.author || "")
        setValue("title", data?.title || "")
        setValue("isPremium", data?.isPremium === true ? "1" : "0")
        setValue("language", data?.language || "")
        setValue("pageCount", data?.pageCount || 0)
        setValue("viewCount", data?.viewCount || 0)
        setValue("description", data?.description || "")

        const date = data.publishDate.toDate?.() || new Date(data.publishDate)
        setValue("publishDate", formatDateTimeLocal(date))
        let coverImage = ""
        try {
          if (data.coverImage) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            coverImage = await getDownloadURL(ref(storage, data.coverImage)) // đường dẫn firebase hiển thị
          }
        } catch (error: unknown) {
          console.warn("Không tìm thấy ảnh:", error)
        }
        setValue("coverImage", coverImage)

        let fileUrl = ""
        try {
          if (data.fileUrl) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            fileUrl = await getDownloadURL(ref(storage, data.fileUrl))
          }
        } catch (error: unknown) {
          console.warn("Không tìm thấy ảnh:", error)
        }
        setValue("fileUrl", fileUrl)

        // Lấy chi tiết từng genre
        const genreDetails = await fetchGenresId(data.genreIds)
        setValue("genreIds", genreDetails)
      }
      fetchUserId()
    }
  }, [documentId, setValue])

  // xử lý state với file ảnh
  const [fileImage, setFileImage] = useState<File | null>()

  const previewImage = useMemo(() => {
    return fileImage ? URL.createObjectURL(fileImage) : ""
  }, [fileImage])

  const handleChangeImage = (file?: File) => {
    setFileImage(file)
  }

  // xử lý state với file pdf
  const [filePDF, setFilePDF] = useState<File | null>()

  const previewFilePDF = useMemo(() => {
    return filePDF ? URL.createObjectURL(filePDF) : ""
  }, [filePDF])

  const handleChangeFile = (file?: File) => {
    setFilePDF(file)
  }

  const coverImageWatch = watch("coverImage")
  const fileUrlWatch = watch("fileUrl")

  // xử lý tên file
  const decodedUrl = decodeURIComponent((fileUrlWatch as string) || previewFilePDF)
  const fileName = useMemo(() => {
    if (filePDF) return filePDF.name
    if (decodedUrl) {
      const parts = decodedUrl.split("/")
      const lastPart = parts[parts.length - 1]
      return lastPart.split("?")[0]
    }
    return ""
  }, [filePDF, decodedUrl])

  const onSubmit = async (data: FormDataUpdate) => {
    if (!documentId) return

    try {
      const documentRef = doc(db, "documents", documentId)

      // 1. Lấy dữ liệu cũ
      const oldSnap = await getDoc(documentRef)
      const oldData = oldSnap.data()
      const oldGenreIds: string[] = oldData?.genreIds || []

      // 3. Chuẩn bị genre mới
      const newGenreIds: string[] = (data.genreIds as any).map((g: any) => g.id)
      const addedGenres = newGenreIds.filter((id) => !oldGenreIds.includes(id))
      const removedGenres = oldGenreIds.filter((id) => !newGenreIds.includes(id))

      // 5. Cập nhật documentCount trong genres
      const batch = writeBatch(db)

      addedGenres.forEach((id) => {
        const genreRef = doc(db, "genres", id)
        batch.update(genreRef, { documentCount: increment(1) })
      })

      removedGenres.forEach((id) => {
        const genreRef = doc(db, "genres", id)
        batch.update(genreRef, { documentCount: increment(-1) })
      })

      // Chuẩn bị dữ liệu cập nhật
      const updatedData: any = {
        author: data.author,
        description: data.description,
        genreIds: newGenreIds,
        isPremium: data.isPremium === "1" ? true : false,
        language: data.language,
        pageCount: Number(data.pageCount),
        publishDate: Timestamp.fromDate(new Date(data.publishDate as string)),
        title: data.title,
        viewCount: data.viewCount
      }

      // Cập nhật file ảnh bìa nếu có
      let coverImagePath = data.coverImage // data.coverImage lúc này là link URL
      if (fileImage) {
        const imageRef = ref(storage, `biasach/${fileImage.name}`)
        await uploadBytes(imageRef, fileImage)
        coverImagePath = imageRef.fullPath // đường dẫn thư mục
        updatedData.coverImage = coverImagePath
      }

      // Cập nhật file PDF nếu có
      let fileUrlPath = data.fileUrl
      if (filePDF) {
        const fileRef = ref(storage, `books/${filePDF.name}`)
        await uploadBytes(fileRef, filePDF)
        fileUrlPath = fileRef.fullPath // đường dẫn thư mục
        updatedData.fileUrl = fileUrlPath
      }

      // Cập nhật Firestore
      await updateDoc(documentRef, updatedData)
      await batch.commit()
      fetchDocuments()
      toast.success("Cập nhật tài liệu thành công", { autoClose: 1500 })
      handleExitsEditItem()
    } catch (error) {
      console.error("Lỗi khi cập nhật tài liệu:", error)
      toast.error("Cập nhật tài liệu thất bại")
    }
  }

  const [isAdd, setIsAdd] = useState<boolean>(false)

  if (loading) return <p>Đang tải tài liệu...</p>
  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Quản lý tài liệu
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
          onClick={() => setIsAdd((prev) => !prev)}
        >
          <Plus /> Thêm mới
        </motion.button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="mt-2">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 grid grid-cols-6 items-center gap-2 py-3 border border-[#dedede] px-4 rounded-tl-xl rounded-tr-xl">
            <div className="col-span-1 text-[14px] py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Id
            </div>
            <div className="col-span-1 text-[14px] py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Tác giả
            </div>
            <div className="col-span-1 text-[14px] py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Tên tài liệu
            </div>
            <div className="col-span-1 text-[14px] text-center py-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Loại sách
            </div>
            <div className="col-span-1 text-[14px] text-center py-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Ngày xuất bản
            </div>
            <div className="col-span-1 text-[14px] text-center py-2 text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Hành động
            </div>
          </div>
          <div>
            {documents.length > 0 ? (
              documents?.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <DocumentItem item={item} handleEditItem={handleEditItem} setDocuments={setDocuments} />
                </motion.div>
              ))
            ) : (
              <div className="text-center mt-4">Không tìm thấy kết quả</div>
            )}
          </div>
          <div>
            {documentId !== null ? (
              <Fragment>
                <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
                <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <button onClick={handleExitsEditItem} className="absolute right-2 top-1">
                    <X color="gray" size={22} />
                  </button>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white dark:bg-darkPrimary rounded-xl w-[1200px]"
                  >
                    <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin người dùng</h3>
                    <div className="w-full h-[1px] bg-[#dadada]"></div>
                    <div className="p-4 pt-0">
                      <div className="mt-4 flex items-start justify-between gap-4">
                        <div className="grid grid-cols-12 flex-wrap gap-4 w-[70%]">
                          <div className="col-span-3">
                            <Input
                              name="id"
                              register={register}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Mã tài liệu"
                              disabled
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              name="author"
                              register={register}
                              placeholder="Nhập tên tác giả"
                              messageErrorInput={errors.author?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-white dark:bg-darkPrimary focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Tên tác giả"
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              name="title"
                              register={register}
                              placeholder="Nhập tựa đề"
                              messageErrorInput={errors.title?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Title"
                            />
                          </div>
                          <div className="col-span-6">
                            <span className="mb-1]">Trạng thái</span>
                            <Controller
                              name="isPremium"
                              control={control}
                              render={({ field }) => {
                                return (
                                  <select
                                    value={field.value}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                    }
                                    className="p-2 border border-gray-300 dark:border-darkBorder bg-[#fff] dark:bg-black w-full mt-2 rounded-md"
                                  >
                                    <option value="" disabled>
                                      -- Chọn trạng thái --
                                    </option>
                                    <option value="1">Premium</option>
                                    <option value="0">Normal</option>
                                  </select>
                                )
                              }}
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              name="language"
                              register={register}
                              messageErrorInput={errors.language?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Ngôn ngữ"
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              name="pageCount"
                              register={register}
                              messageErrorInput={errors.pageCount?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Số trang"
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              name="viewCount"
                              register={register}
                              messageErrorInput={errors.viewCount?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#f2f2f2] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Lượt xem"
                              disabled
                            />
                          </div>
                          <div className="col-span-12">
                            <Input
                              name="description"
                              register={register}
                              messageErrorInput={errors.description?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Mô tả"
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              name="publishDate"
                              register={register}
                              messageErrorInput={errors.publishDate?.message}
                              classNameInput="mt-1 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
                              className="relative flex-1"
                              nameInput="Ngày xuất bản"
                              type="datetime-local"
                            />
                          </div>
                          <div className="col-span-6">
                            <span className="mb-1 block">Thể loại tài liệu</span>
                            <Controller
                              control={control} // từ useForm()
                              name="genreIds" // tên trường trong form
                              render={({ field }) => (
                                <Select
                                  isMulti // chọn nhiều
                                  options={genreOptions} // danh sách thể loại
                                  placeholder="Chọn thể loại..."
                                  value={
                                    field.value?.map((g: any) => ({
                                      value: g.id,
                                      label: g.name
                                    })) || []
                                  }
                                  onChange={(selected) => {
                                    const newGenres = selected.map((item) => ({
                                      id: item.value,
                                      name: item.label
                                    }))
                                    field.onChange(newGenres) // gửi lại về react-hook-form
                                  }}
                                  className="basic-multi-select"
                                  classNamePrefix="select"
                                  styles={{
                                    menuList: (provided) => ({
                                      ...provided,
                                      maxHeight: 100, // chiều cao tối đa của danh sách dropdown (px)
                                      overflowY: "auto"
                                    })
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                        <div className="w-[30%] text-center">
                          <div className="mb-2">Ảnh bìa</div>
                          <img
                            src={previewImage || coverImageWatch}
                            className="h-[230px] w-[170px] mx-auto rounded-sm"
                            alt="avatar default"
                          />
                          <InputFileImage onChange={handleChangeImage} />

                          <div className="mb-2 mt-10">File</div>
                          <a
                            href={previewFilePDF || fileUrlWatch}
                            target="_blank"
                            className="mt-2 inline-flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-[#dedede] duration-200"
                            rel="noreferrer"
                          >
                            {fileName}
                          </a>
                          <InputFileImage file={true} onChange={handleChangeFile} />
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button
                          type="submit"
                          nameButton="Cập nhật tài liệu"
                          classNameButton="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-indigo-600 transition-all font-semibold"
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

          <div>{isAdd ? <AddDocument setIsAdd={setIsAdd} fetchDocuments={fetchDocuments} /> : ""}</div>
        </div>
      </motion.div>
    </div>
  )
}
