const functions = require("firebase-functions")
const admin = require("firebase-admin")

admin.initializeApp()

exports.sendNotification = functions.https.onCall(async (data: any, context: any) => {
  // Nếu dữ liệu nằm trong data.data
  const payload = data.data ? data.data : data
  const { tokens, notification } = payload
  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Danh sách tokens không hợp lệ hoặc trống")
  }
  if (!notification || typeof notification.body !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Notification phải có body là chuỗi")
  }

  const multicastMessage = {
    tokens,
    notification
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(multicastMessage)
    return {
      successCount: response.successCount,
      failureCount: response.failureCount
    }
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Lỗi gửi thông báo")
  }
})

exports.adminResetPassword = functions.https.onCall(async (data: any, context: any) => {
  // Nếu dữ liệu nằm trong data.data
  const payload = data.data ? data.data : data
  const { uid, newPassword, secret } = payload
  console.log(uid)

  if (secret !== "thuanpham99@") {
    throw new functions.https.HttpsError("permission-denied", "Bạn không có quyền.")
  }

  try {
    const userRecord = await admin.auth().updateUser(uid, {
      password: newPassword
    })
    return { success: true, uid: userRecord.uid }
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Lỗi gửi thông báo")
  }
})
