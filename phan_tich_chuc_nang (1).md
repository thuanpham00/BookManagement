# Báo Cáo Phát Triển Ứng Dụng Flutter

## 1. Tóm Tắt (Abstract)

Ứng dụng Readify là một ứng dụng đọc sách điện tử đa nền tảng được phát triển bằng Flutter, hướng tới việc cung cấp trải nghiệm đọc sách hiện đại, tiện lợi cho người dùng. Mục tiêu chính là xây dựng một hệ sinh thái đọc sách số với các tính năng như quản lý thư viện cá nhân, đọc sách PDF, đánh dấu trang, tìm kiếm, phân loại sách, và hỗ trợ tài khoản premium. Dự án đã hoàn thiện các chức năng cốt lõi, tích hợp sâu với Firebase, hỗ trợ đa nền tảng (Android, iOS, Web, Windows) và có giao diện hiện đại, thân thiện.

Quy trình triển khai tuân thủ các bước chuyên nghiệp: phân tích yêu cầu, thiết kế UI/UX, phát triển, kiểm thử và đánh giá. Điểm nổi bật là khả năng mở rộng, tích hợp thanh toán, thông báo đẩy, và quản lý trạng thái hiệu quả.

## 2. Giới Thiệu (Introduction)

### Bối cảnh
Readify ra đời nhằm giải quyết nhu cầu đọc sách số ngày càng tăng, giúp người dùng dễ dàng tiếp cận kho sách đa dạng mọi lúc, mọi nơi. Ứng dụng hướng tới việc số hóa trải nghiệm đọc sách truyền thống, đồng thời bổ sung các tiện ích như lưu tiến trình, đánh dấu trang, và cá nhân hóa thư viện.

### Mục tiêu
- Xây dựng ứng dụng đọc sách điện tử đa nền tảng.
- Hỗ trợ quản lý thư viện cá nhân, đọc sách, tìm kiếm, phân loại, và thanh toán premium.
- Đảm bảo trải nghiệm người dùng mượt mà, hiện đại.

### Phạm vi
- Đối tượng: Người dùng yêu thích đọc sách, học sinh, sinh viên, người đi làm.
- Tính năng: Đăng nhập/đăng ký, đọc sách PDF, quản lý thư viện, tìm kiếm, phân loại, đánh dấu trang, thanh toán premium, thông báo.

### Cấu trúc báo cáo
Báo cáo gồm: Tóm tắt, Giới thiệu, Tổng quan công nghệ, Quy trình phát triển, Kết quả & đánh giá, Kết luận & hướng phát triển.

## 3. Tổng Quan Về Công Nghệ (Technology Overview)

- **Flutter**: Framework phát triển ứng dụng đa nền tảng, hiệu suất cao, giao diện đẹp, dễ mở rộng.
- **Firebase**: Xác thực, lưu trữ dữ liệu, lưu trữ file, thông báo đẩy.
- **Provider**: Quản lý trạng thái.
- **GoRouter**: Điều hướng.
- **Syncfusion PDF Viewer**: Đọc file PDF.
- **SharedPreferences**: Lưu trữ cục bộ.
- **Flutter Local Notifications**: Thông báo cục bộ.
- **Google Fonts**: Tùy chỉnh font chữ.

**Kiến trúc ứng dụng**: Phân tầng theo tính năng (feature-based), mỗi nhóm chức năng nằm trong thư mục riêng. Core layer chứa các thành phần dùng chung. Routing tập trung với GoRouter.

## 4. Quy Trình Phát Triển (Development Process)

### 4.1. Phân Tích Yêu Cầu (Requirement Analysis)
- Yêu cầu chức năng: Đăng nhập/đăng ký, đọc sách, quản lý thư viện, tìm kiếm, phân loại, đánh dấu trang, thanh toán premium, thông báo.
- Yêu cầu phi chức năng: Đa nền tảng, hiệu suất cao, bảo mật, giao diện thân thiện.
- Phương pháp: Tham khảo các ứng dụng đọc sách, khảo sát người dùng, phân tích thị trường.
- Kết quả: Danh sách tính năng chính và phụ như trên.

### 4.2. Thiết Kế Giao Diện (UI/UX Design)
- Quy trình: Thiết kế wireframe, prototype trên Figma.
- Nguyên tắc: Material Design, responsive, tối ưu trải nghiệm người dùng.

### 4.3. Phát Triển Ứng Dụng (Application Development)
- Cấu trúc dự án: Phân chia theo feature, core, assets, sử dụng GoRouter cho navigation.
- Các bước triển khai:
  - Thiết lập môi trường (Flutter SDK, IDE).
  - Xây dựng widget giao diện (Stateless/Stateful).
  - Tích hợp Firebase (Auth, Firestore, Storage, Messaging).
  - Quản lý trạng thái với Provider.
  - Xử lý từng tính năng: đăng nhập, đọc sách, quản lý thư viện, thanh toán, thông báo...
- Công cụ hỗ trợ: Git, pub.dev, Figma.

### 4.4. Kiểm Thử (Testing)
- Loại kiểm thử: Unit test, widget test, kiểm thử thủ công trên nhiều nền tảng.
- Công cụ: Flutter test, thiết bị thật, giả lập.
- Kết quả: Ứng dụng ổn định, các tính năng hoạt động đúng.

## 5. Kết Quả và Đánh Giá (Results and Evaluation)
- Ứng dụng hoàn thiện với đầy đủ tính năng cốt lõi.
- Hiệu suất tốt, giao diện đẹp, trải nghiệm mượt mà.
- Đáp ứng mục tiêu ban đầu, nhận phản hồi tích cực từ người dùng thử nghiệm.
- Hạn chế: Một số tính năng nâng cao (AI gợi ý sách, đồng bộ đa thiết bị) chưa triển khai.
- Hiệu suất: Ứng dụng tải nhanh, thao tác mượt, dung lượng hợp lý.

## 6. Kết Luận và Hướng Phát Triển (Conclusion and Future Work)
- Dự án đã hoàn thành các mục tiêu chính, xây dựng được ứng dụng đọc sách số đa nền tảng, hiện đại.
- Hướng phát triển: Bổ sung AI gợi ý sách, đồng bộ tiến trình đọc đa thiết bị, tối ưu hiệu suất, mở rộng kho sách, tích hợp thêm phương thức thanh toán.
- Bài học: Cần lên kế hoạch chi tiết, kiểm thử liên tục, chú trọng trải nghiệm người dùng và khả năng mở rộng ứng dụng.
