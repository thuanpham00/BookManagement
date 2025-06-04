import { useRef } from "react"
import { toast } from "react-toastify"
import Button from "../Button"

export const config = {
  maxSizeUploadImage: 1048576 // 1mb = 1.048.576 byte
}

export default function InputFileImage({
  onChange,
  file = false
}: {
  onChange?: (file?: File) => void
  file?: boolean
}) {
  const refInput = useRef<HTMLInputElement>(null)
  const handleInputFile = () => {
    refInput.current?.click()
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileFormLocal = event.target.files?.[0]
    if (file) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      onChange && onChange(fileFormLocal)
    } else {
      if (
        fileFormLocal &&
        (fileFormLocal?.size >= config.maxSizeUploadImage || !fileFormLocal?.type.includes("image"))
      ) {
        toast.error("File vượt quá kích thước và không đúng định dạng ", {
          autoClose: 1500
        })
      } else {
        toast.success("File upload thành công", {
          autoClose: 1500
        })
        // Tức là component con đang "gửi dữ liệu" lên component cha qua props.onChange
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onChange && onChange(fileFormLocal)
      }
    }
  }

  return (
    <div className="text-center">
      <input
        onChange={onFileChange}
        onClick={(event) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(event.target as any).value = null
        }}
        ref={refInput}
        type="file"
        className="hidden"
        accept={file ? ".pdf" : ".jpg,.jpeg,.png"}
      />
      <Button
        type="button"
        onClick={handleInputFile}
        nameButton="Chọn file"
        classNameButton="px-4 py-2 bg-blue-500 mt-2 text-white font-semibold rounded-sm hover:bg-blue-500/80 duration-200"
      />
    </div>
  )
}
