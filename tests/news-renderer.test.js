import assert from 'node:assert/strict'
import test from 'node:test'
import { createNewsRenderer } from '../src/shared/components/news/news-renderer.js'

const items = [
  {
    slug: 'general-news',
    kind: 'news',
    title: 'Tin chung',
    excerpt: 'Nội dung tin chung',
    date: '05 tháng 9, 2026',
    image: '/assets/images/news-general.jpg',
    sourceName: 'IUH',
    sourceUrl: 'https://iuh.edu.vn/general-news',
    content: [{ type: 'paragraph', text: 'Chi tiết tin chung.' }],
  },
  ...Array.from({ length: 5 }, (_, index) => ({
    slug: `appointment-${index + 1}`,
    kind: 'appointment',
    appointmentType: index === 0 ? 'Bổ nhiệm lại' : 'Điều động và bổ nhiệm',
    title: `Bổ nhiệm ${index + 1}`,
    excerpt: `Nội dung bổ nhiệm ${index + 1}`,
    category: 'Quyết định bổ nhiệm',
    date: `0${index + 1} tháng 1, 2021`,
    image: `/assets/images/appointment-${index + 1}.jpg`,
    sourceName: 'PTCHC IUH',
    sourceUrl: `https://ptchc.iuh.edu.vn/appointment-${index + 1}`,
    content: [{ type: 'paragraph', text: `Chi tiết bổ nhiệm ${index + 1}.` }],
  })),
]

const render = createNewsRenderer({ base: '/', items, sectionMeta: { title: 'Tin tức - Sự kiện' } })

test('appointment marker renders one featured item and three recent items', () => {
  const html = render('<div data-news-appointment-section data-limit="4">Đang tải</div>')

  for (const title of ['Bổ nhiệm 1', 'Bổ nhiệm 2', 'Bổ nhiệm 3', 'Bổ nhiệm 4']) assert.match(html, new RegExp(title))
  assert.doesNotMatch(html, /Bổ nhiệm 5/)
  assert.match(html, /Quyết định gần đây/)
  assert.match(html, /news-detail\.html\?slug=appointment-1/)
})

test('news list includes both general news and appointments with slug-aware links', () => {
  const html = render('<div data-news-list>Đang tải</div>')

  assert.match(html, /Tin chung/)
  assert.match(html, /Bổ nhiệm 1/)
  assert.match(html, /news-detail\.html\?slug=general-news/)
  assert.match(html, /news-detail\.html\?slug=appointment-1/)
})

test('news detail embeds every article and an invalid-slug fallback without fetching JSON', () => {
  const html = render('<div data-news-detail>Đang tải</div>')

  assert.match(html, /data-news-detail-view/)
  assert.equal((html.match(/data-news-detail-article/g) ?? []).length, items.length)
  assert.match(html, /data-news-detail-not-found/)
  assert.match(html, /Không tìm thấy bài viết/)
  assert.match(html, /https:\/\/ptchc\.iuh\.edu\.vn\/appointment-1/)
})
