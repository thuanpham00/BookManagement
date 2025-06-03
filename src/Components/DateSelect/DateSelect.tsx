import { range } from "lodash"
import { useEffect, useState } from "react"

interface Props {
  value?: Date
  onChange?: (value: Date) => void
  errorMessage?: string
  googleId: string
}

// Schema xác định kiểu dữ liệu (ở đây là Date) → field.onChange mong chờ kiểu Date.
export default function DateSelect({ onChange, errorMessage, value, googleId }: Props) {
  const [date, setDate] = useState({
    day: value?.getDate(),
    month: value?.getMonth(),
    year: value?.getFullYear()
  })

  useEffect(() => {
    if (value) {
      setDate({
        day: value?.getDate(),
        month: value?.getMonth(),
        year: value?.getFullYear()
      })
    }
  }, [value])

  const handleChangeDate = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value: numberFormSelect, name } = event.target
    const newDate = {
      day: value?.getDate() || 1,
      month: value?.getMonth() || 0,
      year: value?.getFullYear() || 1990,
      [name]: Number(numberFormSelect) // ghi đè lại giá trị day, month, year và gán mới vào
    }
    setDate(newDate)
    /**
     *  Cú pháp [name]: value giúp cập nhật động các thuộc tính của object.
    ✅ Ghi đè giá trị của day, month, hoặc year mà không ảnh hưởng đến các giá trị còn lại.
     */

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    onChange && onChange(new Date(newDate.year, newDate.month, newDate.day))
  }

  return (
    <div className="flex flex-wrap flex-col">
      <div className="">Ngày sinh</div>
      <div className="mt-1">
        <div className="flex items-center gap-2">
          <select
            disabled={googleId !== "" ? true : false}
            onChange={handleChangeDate}
            value={value?.getDate() || date.day}
            name="day"
            className={`h-10 flex-1 ${googleId !== "" ? "bg-[#f2f2f2]" : "bg-white"} dark:bg-darkPrimary rounded-sm border border-black/10 dark:border-darkBorder cursor-pointer text-[#000] dark:text-white`}
          >
            <option disabled>Ngày</option>
            {range(1, 32).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            disabled={googleId !== "" ? true : false}
            onChange={handleChangeDate}
            value={value?.getMonth() || date.month}
            name="month"
            className={`h-10 flex-1 ${googleId !== "" ? "bg-[#f2f2f2]" : "bg-white"} dark:bg-darkPrimary rounded-sm border border-black/10 dark:border-darkBorder cursor-pointer text-[#000] dark:text-white`}
          >
            <option disabled>Tháng</option>
            {range(0, 12).map((item) => (
              <option key={item} value={item}>
                {item + 1}
              </option>
            ))}
          </select>

          <select
            disabled={googleId !== "" ? true : false}
            onChange={handleChangeDate}
            value={value?.getFullYear() || date.year}
            name="year"
            className={`h-10 flex-1 ${googleId !== "" ? "bg-[#f2f2f2]" : "bg-white"} dark:bg-darkPrimary rounded-sm border border-black/10 dark:border-darkBorder cursor-pointer text-[#000] dark:text-white`}
          >
            <option disabled>Năm</option>
            {range(1990, 2050).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="text-red-500 text-[13px] font-semibold min-h-[1.25rem] block">{errorMessage}</div>
      </div>
    </div>
  )
}
