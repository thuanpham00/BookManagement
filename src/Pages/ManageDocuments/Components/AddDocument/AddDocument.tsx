import { yupResolver } from "@hookform/resolvers/yup"
import { X } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { Fragment } from "react/jsx-runtime"
import Input from "src/Components/Input"
import { schemaDocument, SchemaDocumentType } from "src/Helpers/rule"
import Select from "react-select"
import InputFileImage from "src/Components/InputFileImage"
import Button from "src/Components/Button"
import { useEffect, useMemo, useState } from "react"
import { addDoc, collection, doc, getDocs, increment, Timestamp, writeBatch } from "firebase/firestore"
import { db, storage } from "src/firebase"
import { ref, uploadBytes } from "firebase/storage"
import { toast } from "react-toastify"

type FormDataAdd = Pick<
  SchemaDocumentType,
  | "author"
  | "coverImage"
  | "description"
  | "fileUrl"
  | "genreIds"
  | "isPremium"
  | "language"
  | "pageCount"
  | "publishDate"
  | "title"
>

const formDataAdd = schemaDocument.pick([
  "author",
  "coverImage",
  "description",
  "fileUrl",
  "genreIds",
  "isPremium",
  "language",
  "pageCount",
  "publishDate",
  "title"
])

export default function AddDocument({
  setIsAdd,
  fetchDocuments
}: {
  setIsAdd: React.Dispatch<React.SetStateAction<boolean>>
  fetchDocuments: () => Promise<void>
}) {
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

  const handleExitsModalAdd = () => {
    setIsAdd(false)
  }

  const [fileImage, setFileImage] = useState<File | null>(null)

  const previewImage = useMemo(() => {
    return fileImage ? URL.createObjectURL(fileImage) : ""
  }, [fileImage])

  const handleChangeImage = (file?: File) => {
    setFileImage(file as File)
  }

  const [filePDF, setFilePDF] = useState<File | null>(null)
  const previewFilePDF = useMemo(() => {
    return filePDF ? URL.createObjectURL(filePDF) : ""
  }, [filePDF])

  const handleChangeFile = (file?: File) => {
    setFilePDF(file as File)
  }

  const {
    handleSubmit,
    register,
    // reset,
    control,
    formState: { errors }
  } = useForm<FormDataAdd>({ resolver: yupResolver(formDataAdd) })

  const handleSubmitAdd = handleSubmit(async (data) => {
    console.log(data)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newGenreIds: string[] = (data.genreIds as any).map((g: any) => g.id)

      let coverImagePath = data.coverImage // data.coverImage lúc này là link URL
      if (fileImage) {
        const imageRef = ref(storage, `biasach/${fileImage.name}`)
        await uploadBytes(imageRef, fileImage)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        coverImagePath = imageRef.fullPath
      }

      let fileUrlPath = data.fileUrl // data.coverImage lúc này là link URL
      if (filePDF) {
        const fileRef = ref(storage, `books/${filePDF.name}`)
        await uploadBytes(fileRef, filePDF)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        fileUrlPath = fileRef.fullPath
      }

      await addDoc(collection(db, "documents"), {
        author: data.author,
        language: data.language,
        title: data.title,
        isPremium: data.isPremium === "1" ? true : false,
        publishDate: Timestamp.fromDate(new Date(data.publishDate as string)),
        viewCount: 0,
        pageCount: data.pageCount,
        genreIds: newGenreIds,
        description: data.description,
        coverImage: coverImagePath,
        fileUrl: fileUrlPath
      })

      const batch = writeBatch(db)
      newGenreIds.forEach((genreId) => {
        const genreRef = doc(db, "genres", genreId)
        batch.update(genreRef, { documentCount: increment(1) })
      })
      await batch.commit()

      fetchDocuments()
      setIsAdd(false)
      setFileImage(null)
      setFilePDF(null)
      toast.success("Thêm tài liệu thành công!", { autoClose: 1500 })
    } catch (error) {
      console.log(error)
    }
  })

  // xử lý tên file
  const decodedUrl = decodeURIComponent(previewFilePDF)
  const fileName = useMemo(() => {
    if (filePDF) return filePDF.name
    if (decodedUrl) {
      const parts = decodedUrl.split("/")
      const lastPart = parts[parts.length - 1]
      return lastPart.split("?")[0]
    }
    return ""
  }, [filePDF, decodedUrl])

  return (
    <Fragment>
      <div className="fixed left-0 top-0 z-10 h-screen w-screen bg-black/60"></div>
      <div className="z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <button onClick={handleExitsModalAdd} className="absolute right-2 top-1">
          <X color="gray" size={22} />
        </button>
        <form onSubmit={handleSubmitAdd} className="bg-white dark:bg-darkPrimary rounded-xl w-[1200px]">
          <h3 className="py-2 px-4 text-[15px] font-medium bg-[#f2f2f2] rounded-md">Thông tin tài liệu</h3>
          <div className="w-full h-[1px] bg-[#dadada]"></div>
          <div className="p-4 pt-0">
            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="grid grid-cols-12 flex-wrap gap-4 w-[70%]">
                <div className="col-span-6">
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
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
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
                    classNameInput="mt-2 p-2 w-full border border-[#dedede] dark:border-darkBorder bg-[#fff] dark:bg-darkSecond focus:border-blue-500 focus:ring-2 outline-none rounded-md"
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
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                      />
                    )}
                  />
                  {errors.genreIds && (
                    <span className="text-red-500 text-[13px] font-semibold mt-1 block">
                      {errors.genreIds.message?.toString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-[30%] text-center">
                <div className="mb-2">Ảnh bìa</div>
                {fileImage === null ? (
                  <div>Chưa có ảnh bìa</div>
                ) : (
                  <img src={previewImage} className="h-[200px] w-[170px] mx-auto rounded-sm" alt="avatar default" />
                )}

                <InputFileImage onChange={handleChangeImage} />
                {fileImage === null ? (
                  <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                    File ảnh bìa bắt buộc!
                  </span>
                ) : (
                  ""
                )}

                <div className="mb-2 mt-10">File</div>
                {filePDF === null ? (
                  <div>Chưa có file tài liệu</div>
                ) : (
                  <a
                    href={previewFilePDF}
                    target="_blank"
                    className="mt-2 inline-flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-[#dedede] duration-200"
                    rel="noreferrer"
                  >
                    {fileName}
                  </a>
                )}
                <InputFileImage file={true} onChange={handleChangeFile} />
                {filePDF === null ? (
                  <span className="mt-1 text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">
                    File tài liệu bắt buộc!
                  </span>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                nameButton="Thêm tài liệu"
                classNameButton="w-[120px] p-4 py-2 bg-blue-500 mt-2 w-full text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
              />
            </div>
          </div>
        </form>
      </div>
    </Fragment>
  )
}
