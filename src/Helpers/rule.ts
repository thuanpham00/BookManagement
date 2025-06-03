import * as yup from "yup"

export const schemaUser = yup.object({
  id: yup.string(),
  fullName: yup.string(),
  email: yup.string(),
  accountType: yup.string(),
  fcmToken: yup.string(),
  address: yup.string(),
  dateOfBirth: yup.date().max(new Date(), "Hãy chọn một ngày trong quá khứ!"),
  createdAt: yup.string(),
  lastLogin: yup.string(),
  avatar: yup.string(),
  googleId: yup.string()
})

export type SchemaUserType = yup.InferType<typeof schemaUser>

export const schemaCategory = yup.object({
  id: yup.string(),
  name: yup.string().required("Tên danh mục bắt buộc!"),
  description: yup.string().required("Mô tả danh mục bắt buộc!"),
  documentCount: yup.number()
})

export type SchemaCategoryType = yup.InferType<typeof schemaCategory>

export const schemaAddCategory = schemaCategory.pick(["name", "description", "documentCount"])

export type SchemaCategoryAddType = yup.InferType<typeof schemaAddCategory>

export const schemaAddUser = yup.object({
  address: yup.string().required("Địa chỉ bắt buộc!"),
  avatar: yup.string(),
  email: yup.string().required("Email bắt buộc!"),
  fullName: yup.string().required("Tên người dùng bắt buộc!"),
  createdAt: yup.string(),
  dateOfBirth: yup.date().max(new Date(), "Hãy chọn một ngày trong quá khứ!"),
  password: yup.string().required("Mật khẩu bắt buộc!")
})

export type SchemaUserAddType = yup.InferType<typeof schemaAddUser>
