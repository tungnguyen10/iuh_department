## Context

`pages/room-booking.html` (118 dòng) là một trang tĩnh: hero xanh, lưới hai cột gồm card form bên trái và `<aside>` tài khoản bên phải, kết thúc bằng include partners. Không có `<form>`, không có `<script>`, không có validate — toàn bộ chỉ là markup dựng từ shared primitives. Hai nghiệp vụ mới (phòng nghỉ nhà khách, xe công đi công tác) chia sẻ đúng khung đó: cùng người đăng ký, cùng card tài khoản, cùng kiểu "điền form rồi gửi".

Repo đã có shared tabs (`src/shared/components/tabs/tabs.js`) được đăng ký sẵn trong `src/shared/shared.config.js` với selector `.tabs-container`, và đã được dùng thực tế ở `pages/functions-duties.html` (5 tab) cùng `dormitory-management/pages/tra-cuu.html` (5 tab).

Ràng buộc quan trọng từ test hiện có (`tests/organization-administration-faculty.test.js`): trang này bị cấm chứa `<form>`, `<script>`, hoặc tham chiếu `weekly-calendar.html`; và bị cấm có `data-name="full_name" | "phone" | "unit"` vì ba thông tin đó thuộc về sidebar tài khoản.

## Goals / Non-Goals

**Goals**

- Một route duy nhất phục vụ cả ba nghiệp vụ đăng ký.
- Không nhân bản khung trang: hero, card tài khoản, lịch sử đăng ký chỉ tồn tại một lần.
- Tái sử dụng 100% primitive hiện có; không thêm component, variant, hay file SCSS mới.
- Không làm hỏng form phòng họp đang có — mọi `data-name` giữ nguyên.

**Non-Goals**

- Submit, lưu trữ, hay bất kỳ backend nào.
- Validate client-side, kiểm tra trùng lịch, hay state duyệt/chờ duyệt.
- Lịch khả dụng riêng cho phòng nghỉ và xe.
- Áp dụng cho faculty khác.

## Decisions

### D1 — Đổi tên route thành `/service-booking.html`

Giữ `/room-booking.html` cho một trang có ba tab sẽ làm URL lệch nội dung. Vì đổi tên không làm thay đổi *số lượng* trang (vẫn 13), `tests/site-chrome-build.test.js` không cần sửa; chỉ cần đổi một chuỗi trong `expectedPages` và cập nhật hai nơi trỏ tới URL cũ (search-data, CTA trang chủ).

*Alternative đã cân nhắc*: giữ nguyên URL cũ để khỏi phải sửa gì. Rẻ hơn nhưng để lại một URL nói dối về nội dung của nó, và chi phí đổi tên ở đây chỉ là ba dòng.

### D2 — Sidebar nằm ngoài `.tabs-content`

`tabs.js` dò panel bằng `this.element.querySelectorAll('.tab-panel[data-tab-panel]')` — phạm vi là `.tabs-container`, không bắt buộc panel phải là con trực tiếp. Nhờ vậy có thể đặt `.tabs-nav` ở trên, rồi mở một lưới hai cột trong đó cột trái là `.tabs-content` và cột phải là `<aside>`. Sidebar nằm trong `.tabs-container` nhưng ngoài mọi panel nên không bị ẩn/hiện theo tab.

*Alternative đã cân nhắc*: đặt cả lưới hai cột vào trong từng panel. Bị loại vì phải lặp card tài khoản ba lần.

### D3 — "Lưu ý khi đăng ký" chuyển vào từng tab

Ba dịch vụ có quy định khác nhau (24h với phòng họp, 48h và xuất trình giấy tờ với nhà khách, 72h và cần lãnh đạo duyệt với xe công). Để khối này ở sidebar dùng chung sẽ hiển thị quy định sai cho hai tab sau. Đặt nó ở cuối mỗi card form giữ đúng ngữ cảnh.

### D4 — Không deep-link tới tab ở phiên bản này

`functions-duties.html` deep-link bằng một `<script>` inline đọc `location.hash`. Trang này bị test cấm `<script>`. Thay vì nới assertion đó, chấp nhận tab mặc định là Phòng họp. Nếu sau này cần deep-link, cách đúng là nâng cấp `tabs.js` để tự xử lý hash cho mọi `.tabs-container` — vừa dùng chung được, vừa cho phép `functions-duties.html` bỏ script inline.

### D5 — Tên field tách theo tiền tố, tránh ba tên bị cấm

Ba form cùng tồn tại trong DOM nên `id` phải duy nhất: tiền tố `booking-`, `guest-`, `vehicle-`. Về `data-name`:

- Tab phòng họp giữ nguyên `room`, `date`, `start_time`, `end_time`, `purpose`, `chair`, `attendees`, `projector`.
- Tab phòng nghỉ dùng `guest_name` (không phải `full_name`) và `host_unit` (không phải `unit`) để không vi phạm assertion "ba thông tin này thuộc sidebar".
- Tab xe dùng `trip_leader` thay vì `chair` vì `chair` đã thuộc tab phòng họp.

### D6 — Markup tab viết tay bằng Tailwind inline

Không tạo component include cho tab-nav. Lý do: `functions-duties.html` đã thiết lập tiền lệ markup viết tay cho tab, và `tabs.js` thao tác trực tiếp lên class (`text-gray`, `border-transparent`, `border-primary-dark-blue`) nên một lớp trừu tượng ở giữa chỉ làm khó truy vết. Copy đúng bộ class của `functions-duties.html` để hai trang trông như một.

### D7 — Thêm `icon-car.svg`, tái dùng icon có sẵn cho hai tab còn lại

Kho SVG hiện có `icon-calendar-check.svg` (phòng họp) và `icon-door.svg` (phòng nghỉ) nhưng không có icon xe. Thêm đúng một file mới, theo đúng quy ước 24×24 / `stroke="currentColor"` của các `icon-*.svg` khác, vì `scripts/svg-assets.js` sẽ fail build nếu tham chiếu tới SVG không tồn tại.

## Risks / Trade-offs

- **Ba form trong một DOM** làm trang dài hơn và dễ trùng `id`. Giảm thiểu bằng quy ước tiền tố ở D5 và một bước verify đếm `id` trùng.
- **Đổi URL** phá liên kết ngoài tới `/room-booking.html` nếu có. Chấp nhận được vì site chưa phát hành công khai.
- **`tabs.js` không có điều hướng bằng phím mũi tên** và không gắn `role="tablist"`. Đây là thiếu sót sẵn có của component dùng chung, không phát sinh từ change này; sửa nó là một change riêng ảnh hưởng tới mọi trang đang dùng tab.
- **Panel ẩn bằng class `hidden`** nên nội dung hai tab sau vẫn nằm trong DOM và vẫn được screen reader duyệt qua nếu người dùng không dùng tab — hệ quả của primitive hiện có, giữ nguyên để không lệch với `functions-duties.html`.
