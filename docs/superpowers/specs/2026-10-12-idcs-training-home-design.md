# IDCS training homepage section design

## Goal

Help a business visitor request registration for the existing “Nâng cao năng suất & cải tiến quy trình sản xuất” course while keeping the other three training directions discoverable.

## Audience and offer

The primary audience is a production manager or engineer planning short training for a company team. The featured program covers identifying waste, standardizing work, and measuring the result of an improvement. Existing published details are five sessions, delivery at the company, and an audience of managers and production engineers. These are indicative and must not be presented as a fixed class schedule or confirmed enrollment.

## Layout and content

- Keep the shared section heading and short introduction.
- Give the section a restrained pale-yellow background between the adjacent light-gray sections. Put the featured course in a dark-blue two-column panel with the existing training photograph, the exact course name, three concrete learning topics, program facts, and one dominant registration request button.
- Place the three other programs in compact, full-width rows beneath the featured course. Keep their facts close to the title with no empty card body. The rows link to the training page for further reading and do not compete with the main button.
- Explain near the offer that content, duration, and the class date are confirmed with the business before delivery.
- On small screens, show the course copy and registration button before the photograph, then the other programs.

## Action

The main button opens an email draft addressed to `idcs@iuh.edu.vn` with the course name in its subject. Its label is “Gửi yêu cầu đăng ký khóa”. This is a request, not a completed registration. Use a secondary link to `/training.html#programs` to inspect all programs. Avoid the illustrative `/contact.html` form as the registration destination.

## Visual system and components

Use the IDCS blue, yellow, white, Inter, and Roboto styles already in the repository. Compose the shared `section-title` and `button` primitives with the faculty `course-card` template. Keep existing card variants used by the training page intact. Use the pale-yellow section as a visual break in the homepage's light-gray sequence, with the dark-blue panel carrying the sales hierarchy. The available `idcs-training.jpg` shows an IUH professional event rather than a class, so label it accurately as professional activity. Do not invent tuition, start dates, certifications, testimonials, or outcome metrics.

## Homepage review follow-up

The existing homepage carousel repeated a dormitory advertisement three times before the IDCS content. Replace it with three distinct IDCS offer slides for training, technical services, and technology transfer. Reuse the existing shared button primitive, link each slide to its homepage section, and keep the real IUH photographs accurately labelled. Use a light-blue carousel before the dark-blue IDCS hero to separate their roles. Keep the carousel arrows clear of mobile copy.

## Verification

The production build must resolve all includes and placeholders. The featured button must contain the intended `mailto:` address and course subject. Check desktop and mobile screenshots for hierarchy, readable metadata, a visible main action, and no horizontal overflow. Run the existing IDCS tests and a production build.
