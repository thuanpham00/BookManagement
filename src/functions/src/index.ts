/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions" // Import Firebase Functions SDK
import * as admin from "firebase-admin" // Import Firebase Admin SDK

// Khởi tạo Firebase Admin SDK
admin.initializeApp()

export const sendNotification = functions.https.onCall(async (data: any) => {
  // Kiểm tra dữ liệu đầu vào
  if (!data || typeof data !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Dữ liệu đầu vào không hợp lệ")
  }

  const { tokens, message } = data

  if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "Danh sách tokens không hợp lệ hoặc trống")
  }
  if (!message || typeof message !== "string") {
    throw new functions.https.HttpsError("invalid-argument", "Message phải là một chuỗi không rỗng")
  }

  const multicastMessage: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: "Thông báo",
      body: message
    }
  }

  try {
    const response = await admin.messaging().sendEachForMulticast(multicastMessage)

    // Kiểm tra kết quả gửi
    console.log("Thành công:", response.successCount, "thất bại:", response.failureCount)
    if (response.failureCount > 0) {
      console.log("Chi tiết lỗi:", response.responses)
    }

    return { success: true }
  } catch (error) {
    console.error("Lỗi khi gửi thông báo:", error)
    throw new functions.https.HttpsError("unknown", "Gửi thông báo thất bại")
  }
})
