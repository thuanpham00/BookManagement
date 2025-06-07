# Phân tích chi tiết ứng dụng Readify

## 1. Công nghệ sử dụng
- **Flutter**: Phát triển ứng dụng đa nền tảng (Android, iOS, Web, Windows).
- **Firebase**: Xác thực (Auth), lưu trữ dữ liệu (Firestore), lưu trữ file (Storage), thông báo đẩy (Messaging).
- **Provider**: Quản lý trạng thái.
- **GoRouter**: Điều hướng giữa các màn hình.
- **SharedPreferences**: Lưu trữ cục bộ (thông tin đăng nhập, thẻ thanh toán).
- **Syncfusion PDF Viewer**: Đọc file PDF.
- **Flutter Local Notifications**: Thông báo cục bộ.
- **Google Fonts**: Tùy chỉnh font chữ giao diện.

## 2. Kiến trúc tổng thể
- **Phân tầng theo tính năng (feature-based)**: Mỗi nhóm chức năng lớn nằm trong thư mục riêng (`features/binh`, `features/khanh`, `features/thanh`, `features/thuan`).
- **Core Layer**: Chứa các thành phần dùng chung như theme, service Firebase, navigation, notification provider.
- **Assets**: Lưu trữ hình ảnh, file PDF, icon.
- **Routing**: Cấu hình tập trung trong `lib/core/utils/navigation/app_router.dart` với GoRouter.

## 3. Chức năng chính
### a. Đăng nhập, đăng ký, quên mật khẩu
- Xác thực qua email/password với Firebase Auth.
- Lưu thông tin đăng nhập nếu chọn "Ghi nhớ".
- Hỗ trợ lấy lại mật khẩu qua email.

### b. Trang chủ (Home)
- Hiển thị sách nổi bật, sách mới, sách đọc nhiều, sách đề xuất.
- Carousel sách yêu thích.
- Dữ liệu lấy từ Firestore, hình ảnh từ Storage.

### c. Tìm kiếm & Khám phá
- Tìm kiếm sách theo tên, thể loại.
- Hiển thị danh sách thể loại, sách theo thể loại.
- Giao diện lọc, gợi ý từ khóa.

### d. Chi tiết sách & Đọc sách
- Xem chi tiết sách, mô tả, thể loại, trạng thái premium.
- Đọc sách PDF trực tiếp trong app.
- Đánh dấu trang, lưu tiến trình đọc, thêm/xóa sách khỏi thư viện cá nhân.
- Chỉ tài khoản premium mới đọc được sách premium.

### e. Thư viện cá nhân (My Collection)
- Quản lý sách đã lưu, đang đọc, lịch sử đọc, sách yêu thích.
- Lưu trạng thái đọc, bookmark, tiến trình.

### f. Quản lý tài khoản & cài đặt
- Xem/sửa thông tin cá nhân, đổi mật khẩu.
- Đăng ký gói premium, quản lý thẻ thanh toán.
- Hiển thị thông báo (push, local notification).

### g. Thanh toán & Premium
- Đăng ký gói premium, chọn gói, nhập thông tin thẻ.
- Lưu thẻ, chọn thẻ khi thanh toán, xác nhận thanh toán thành công.

## 4. Logic & luồng hoạt động
- **Khởi động**: Hiển thị splash, kiểm tra đăng nhập, chuyển hướng phù hợp.
- **Navigation**: GoRouter với ShellRoute cho các tab chính (Home, Search, MyCollection, Setting).
- **Tương tác Firebase**: Dữ liệu người dùng, sách, thể loại, tiến trình đọc, trạng thái premium... lưu trên Firestore. Hình ảnh, file PDF lưu trên Storage.
- **Thông báo**: Nhận push notification từ Firebase Messaging, hiển thị local notification khi có sự kiện quan trọng.
- **Quản lý trạng thái**: Provider dùng cho notification, local notification plugin inject qua Provider.
- **Lưu trữ cục bộ**: SharedPreferences dùng cho thông tin đăng nhập, thẻ thanh toán, ghi nhớ trạng thái.

## 5. Luồng người dùng
1. Đăng nhập/đăng ký → vào trang chủ.
2. Duyệt/tìm kiếm sách → xem chi tiết → đọc sách (nếu đủ quyền).
3. Thêm sách vào thư viện, đánh dấu trang, lưu tiến trình.
4. Quản lý tài khoản, đổi mật khẩu, cập nhật thông tin.
5. Đăng ký premium, thanh toán, nhận thông báo xác nhận.
6. Nhận thông báo về các sự kiện liên quan tài khoản/sách.

## 6. Điểm nổi bật
- Ứng dụng đa nền tảng, UI hiện đại, responsive.
- Tích hợp sâu với hệ sinh thái Firebase.
- Hỗ trợ premium, thanh toán, quản lý thẻ.
- Quản lý tiến trình đọc, bookmark, cá nhân hóa trải nghiệm.
- Hệ thống thông báo đa dạng (push, local).
