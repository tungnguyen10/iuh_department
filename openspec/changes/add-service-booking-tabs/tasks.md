## 1. Khung trang và tab

- [x] 1.1 Đổi tên `src/faculties/organization-administration/pages/room-booking.html` → `pages/service-booking.html`.
- [x] 1.2 Cập nhật khối `<!-- LAYOUT: ... -->`: title "Đăng ký dịch vụ", description/keywords bao cả ba dịch vụ, url `https://iuh.edu.vn/service-booking`.
- [x] 1.3 Breadcrumb `data-current-page="Đăng ký dịch vụ"`; hero `<h1>Đăng ký dịch vụ</h1>` và mô tả bao ba dịch vụ; CTA đổi text thành "Xem lịch sử dụng phòng", giữ `data-url="/#weekly-schedule"`.
- [x] 1.4 Dựng `.tabs-container` với `.tabs-nav` ba nút `.tab-btn[data-tab]` (`meeting-room` | `guest-room` | `vehicle`), copy bộ class từ `pages/functions-duties.html`; nút đầu có `.active`.
- [x] 1.5 Trong `.tabs-container`, mở lưới `lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]` với `.tabs-content` ở cột trái (`lg:order-1`) và `<aside>` ở cột phải (`lg:order-2 lg:sticky lg:top-24`).
- [x] 1.6 Chuyển card form phòng họp vào `.tab-panel[data-tab-panel="meeting-room"]`, giữ nguyên mọi `data-name` và include `section-title.html" data-title="Thông tin đăng ký"`.
- [x] 1.7 Chuyển khối "Lưu ý khi đăng ký" từ `<aside>` xuống cuối panel phòng họp.
- [x] 1.8 Sidebar giữ card tài khoản (4 × `display-row.html` variant 2 + nút Đăng xuất) và danh sách "Đăng ký gần đây của tôi"; mỗi item thêm badge loại dịch vụ và trộn đủ ba loại.

## 2. Tab Phòng nghỉ

- [x] 2.1 Tạo `.tab-panel.hidden[data-tab-panel="guest-room"]` cùng card wrapper, icon `icon-door.svg`, `section-title.html" data-title="Thông tin lưu trú"`.
- [x] 2.2 Thêm field (id tiền tố `guest-`): `guest_room_type` (select), `guest_name` (text), `guest_document` (text), `guest_organization` (text), `check_in` (date), `check_out` (date), `guest_count` (number, min=1), `host_unit` (text), `stay_purpose` (textarea), `breakfast` (checkbox).
- [x] 2.3 Nút submit `button.html` variant 7, `data-text="Gửi đăng ký"`, `data-class="w-full"`.
- [x] 2.4 Khối "Lưu ý khi đăng ký" riêng: đặt trước 48 giờ, xuất trình giấy tờ khi nhận phòng, giờ nhận/trả phòng.

## 3. Tab Xe ô tô

- [x] 3.1 Tạo `.tab-panel.hidden[data-tab-panel="vehicle"]` cùng card wrapper, icon `icon-car.svg`, `section-title.html" data-title="Thông tin chuyến đi"`.
- [x] 3.2 Thêm field (id tiền tố `vehicle-`): `vehicle_type` (select), `depart_date` (date), `depart_time` (time), `return_date` (date), `return_time` (time), `pickup_point` (select), `destination` (text), `passengers` (number, min=1), `trip_leader` (text), `trip_purpose` (textarea), `overnight` (checkbox).
- [x] 3.3 Nút submit `button.html` variant 7, `data-text="Gửi đăng ký"`, `data-class="w-full"`.
- [x] 3.4 Khối "Lưu ý khi đăng ký" riêng: đặt trước 72 giờ, cần lãnh đạo đơn vị phê duyệt, chi phí cầu đường và lưu trú tài xế.

## 4. Asset và liên kết

- [x] 4.1 Tạo `src/shared/assets/svgs/icon-car.svg` (24×24, `stroke="currentColor"`, khớp quy ước các `icon-*.svg` hiện có).
- [x] 4.2 Cập nhật entry id 22 trong `data/search-data.json`: title "Đăng ký dịch vụ", excerpt bao ba dịch vụ, url `/service-booking.html`.
- [x] 4.3 Cập nhật CTA trong `components/home/room-booking/rooms-carousel.html` sang `data-url="/service-booking.html"`.
- [x] 4.4 Cập nhật `pages/login.html`: `<form action>` trỏ sang `/service-booking.html`.

## 5. Test

- [x] 5.1 `tests/organization-administration-faculty.test.js`: đổi `expectedPages` sang `'service-booking.html'`.
- [x] 5.2 Cập nhật assertion CTA carousel sang URL mới.
- [x] 5.3 Đổi test trang sang đọc `pages/service-booking.html`, cập nhật title/breadcrumb/h1, giữ nguyên assertion về `data-name` tab phòng họp, sidebar, 4 display-row, nút Đăng xuất, cấm `<form>`/`<script>`.
- [x] 5.4 Thêm assertion: ba `.tab-btn[data-tab]`, ba `.tab-panel[data-tab-panel]`, đúng ba nút submit variant 7, có `data-name` của các field mới, vẫn không có `full_name`/`phone`/`unit`.
- [x] 5.5 Chạy `npm test` và `FACULTY=organization-administration npx vite build`; kiểm tra `id` trùng và hành vi chuyển tab trên dev server.
