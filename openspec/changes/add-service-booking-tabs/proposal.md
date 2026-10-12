## Why

Phòng Tổ chức – Hành chính nhận ba loại đăng ký dịch vụ nội bộ: phòng họp, phòng nghỉ nhà khách, và xe công đi công tác. Hiện site chỉ có `/room-booking.html` phục vụ phòng họp; hai nghiệp vụ còn lại không có đầu mối trên web. Dựng ba trang rời sẽ nhân ba phần khung (hero, card tài khoản, lịch sử đăng ký) vốn giống hệt nhau, nên gộp thành một trang "Đăng ký dịch vụ" ba tab là lựa chọn gọn nhất.

## What Changes

- Đổi tên `pages/room-booking.html` → `pages/service-booking.html`, route công khai thành `/service-booking.html`.
- Trang mới dùng `.tabs-container` của shared tabs với ba tab: Phòng họp (`meeting-room`), Phòng nghỉ (`guest-room`), Xe ô tô (`vehicle`).
- Form phòng họp giữ nguyên toàn bộ `data-name` hiện có, chỉ chuyển vào tab đầu tiên.
- Thêm hai form tĩnh mới: lưu trú nhà khách (theo đêm, có check-in/check-out) và xe công đi công tác (tuyến, ngày giờ đi/về).
- Card tài khoản và danh sách "Đăng ký gần đây của tôi" nằm ngoài vùng tab, dùng chung cho cả ba; danh sách gần đây trộn cả ba loại dịch vụ và gắn badge loại.
- Khối "Lưu ý khi đăng ký" chuyển từ sidebar vào từng tab vì mỗi dịch vụ có quy định riêng.
- Thêm `src/shared/assets/svgs/icon-car.svg`.
- Cập nhật `data/search-data.json` và CTA trong `components/home/room-booking/rooms-carousel.html` trỏ sang route mới.
- Không thêm backend, không validate JS, không kiểm tra trùng lịch — toàn bộ vẫn là UI tĩnh như trang hiện tại.

## Capabilities

### New Capabilities

- `service-booking-tabs`: Một trang đăng ký dịch vụ gộp ba nghiệp vụ của Phòng Tổ chức – Hành chính sau một bộ tab dùng chung, với sidebar tài khoản dùng chung và quy định riêng theo từng dịch vụ.

### Modified Capabilities

- `shared-form-primitives`: không đổi contract, chỉ thêm nơi tiêu thụ. Hai form mới phải dựng hoàn toàn bằng `field.html`, `choice.html`, `button.html` hiện có — không thêm biến thể hay class mới.

## Impact

- Affected source:
  - `src/faculties/organization-administration/pages/room-booking.html` → `pages/service-booking.html`
  - `src/faculties/organization-administration/data/search-data.json`
  - `src/faculties/organization-administration/components/home/room-booking/rooms-carousel.html`
  - `src/shared/assets/svgs/icon-car.svg` (mới)
- Affected build/tooling:
  - Số trang output của faculty vẫn là 13 nên `tests/site-chrome-build.test.js` không đổi.
  - `scripts/svg-assets.js` sẽ fail build nếu `icon-car.svg` được tham chiếu mà chưa tồn tại.
  - Không cần đăng ký runtime module: shared tabs đã khai báo sẵn selector `.tabs-container` trong `src/shared/shared.config.js`.
- Affected documentation:
  - Không có. Kiến trúc và quy ước không đổi.
- Verification:
  - `npm test` pass toàn bộ.
  - `FACULTY=organization-administration npx vite build` thành công, `dist_iuh/` có `service-booking.html` và đúng 13 file HTML.
  - Chuyển qua lại ba tab chỉ hiển thị đúng một panel; sidebar không lặp lại.
  - Mọi `id` trong trang là duy nhất sau khi ba form cùng tồn tại trong DOM.
  - Search modal và CTA trang chủ trỏ đúng `/service-booking.html`.
