const functions = require("firebase-functions")
const admin = require("firebase-admin")
const cors = require("cors")({ origin: true })

admin.initializeApp()

exports.sendNotification = functions.https.onRequest((req: any, res: any) => {
  return cors(req, res, async () => {
    const { tokens, message } = req.body
    console.log(tokens)
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).send("Danh sách tokens không hợp lệ hoặc trống")
    }

    if (!message || typeof message !== "string") {
      return res.status(400).send("Message phải là chuỗi không rỗng")
    }

    const multicastMessage = {
      tokens,
      notification: {
        title: "Thông báo",
        body: message
      }
    }

    try {
      const response = await admin.messaging().sendEachForMulticast(multicastMessage)
      res.json({
        successCount: response.successCount,
        failureCount: response.failureCount
      })
    } catch (error) {
      console.error("Lỗi gửi thông báo:", error)
      res.status(500).send("Lỗi gửi thông báo")
    }
  })
})
