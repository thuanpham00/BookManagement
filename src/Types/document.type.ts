export type Document = {
  publishDate: string
  id: string // ID từ Firestore nếu cần lưu lại
  author: string
  isPremium: boolean
  title: string
  coverImage?: string
  description?: string
  fileUrl?: string
  genreIds?: string[] // mảng chứa ID của các thể loại
  language?: string
  pageCount?: number
  viewCount?: number
}
