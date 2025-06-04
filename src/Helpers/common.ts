export function formatDate(input: string) {
  // Chuyển đổi chuỗi thành Date object

  const date = new Date(input)

  // Lấy từng phần tử thời gian
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0") // tháng bắt đầu từ 0
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

export function formatDateTimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`
}
