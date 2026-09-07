import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import {
  filterDocumentRecords,
  normalizeDocumentSearch,
} from '../src/faculties/organization-administration/components/documents/document-library.js'

const moduleUrl = new URL(
  '../src/faculties/organization-administration/components/documents/document-library.js',
  import.meta.url,
)
const facultyRoot = new URL('../src/faculties/organization-administration/', import.meta.url)
const readFacultyFile = (path) => readFile(new URL(path, facultyRoot), 'utf8')
const sharedRoot = new URL('../src/shared/', import.meta.url)
const readSharedFile = (path) => readFile(new URL(path, sharedRoot), 'utf8')

test('document library exposes filtering and DOM initialization entry points', async () => {
  const source = await readFile(moduleUrl, 'utf8').catch(() => '')

  assert.match(source, /export const filterDocumentRecords/)
  assert.match(source, /export const initDocumentLibrary/)
})

const records = [
  {
    id: 'vb-01',
    search: 'Quy trình tiếp nhận và phát hành văn bản điện tử QT 01 2026 TCHC IUH',
    type: 'document',
    area: 'records-archives',
    year: '2025',
  },
  {
    id: 'bm-01',
    search: 'Phiếu đề nghị cử viên chức đi đào tạo bồi dưỡng',
    type: 'form',
    area: 'organization-personnel',
    year: '2026',
  },
  {
    id: 'vb-02',
    search: 'Hướng dẫn nâng bậc lương thường xuyên',
    type: 'document',
    area: 'policy-emulation',
    year: '2024',
  },
]

test('normalizeDocumentSearch makes Vietnamese text searchable without accents', () => {
  assert.equal(normalizeDocumentSearch('  Văn bản Điện tử  '), 'van ban dien tu')
  assert.equal(normalizeDocumentSearch('Đề nghị'), 'de nghi')
})

test('filterDocumentRecords matches accent-insensitive queries', () => {
  assert.deepEqual(
    filterDocumentRecords(records, { query: 'van ban dien tu' }).map(({ id }) => id),
    ['vb-01'],
  )
})

test('filterDocumentRecords matches visible identifiers with punctuation', () => {
  assert.deepEqual(
    filterDocumentRecords(records, { query: 'QT-01/2026/TCHC' }).map(({ id }) => id),
    ['vb-01'],
  )
})

test('filterDocumentRecords applies type, area, and year together', () => {
  assert.deepEqual(
    filterDocumentRecords(records, {
      type: 'form',
      area: 'organization-personnel',
      year: '2026',
    }).map(({ id }) => id),
    ['bm-01'],
  )
})

test('filterDocumentRecords treats all and blank filters as unrestricted', () => {
  assert.deepEqual(
    filterDocumentRecords(records, { type: 'all', area: '', year: '' }).map(({ id }) => id),
    ['vb-01', 'bm-01', 'vb-02'],
  )
})

test('filterDocumentRecords returns an empty list when no record matches', () => {
  assert.deepEqual(filterDocumentRecords(records, { query: 'không tồn tại' }), [])
})

test('document listing exposes twelve searchable records and accessible filters', async () => {
  const page = await readFacultyFile('pages/documents-forms.html')

  assert.match(page, /data-document-library/)
  assert.match(page, /data-document-query/)
  assert.match(page, /data-document-area-filter/)
  assert.match(page, /data-document-year-filter/)
  assert.match(page, /data-document-count[^>]*aria-live="polite"/)
  assert.match(page, /data-document-empty[^>]*hidden/)
  assert.equal((page.match(/components\/documents\/document-item\.html/g) ?? []).length, 12)
  assert.equal((page.match(/data-url="\/document-detail\.html"/g) ?? []).length, 6)
  assert.equal((page.match(/document-item\.html" data-variant="2"/g) ?? []).length, 6)
  assert.doesNotMatch(page, /href=["']#["']/)
})

test('each downloadable form points to its own faculty PDF asset', async () => {
  const page = await readFacultyFile('pages/documents-forms.html')
  const formDownloads = [...page.matchAll(/document-item\.html" data-variant="2"[^>]+data-url="([^"]+)"/g)]
    .map(([, href]) => href)

  assert.equal(formDownloads.length, 6)
  assert.equal(new Set(formDownloads).size, 6)
  assert.ok(formDownloads.every((href) => href.startsWith('/assets/documents/bm-')))

  for (const href of formDownloads) {
    const asset = await readFacultyFile(`assets/documents/${href.split('/').at(-1)}`)
    assert.ok(asset.startsWith('%PDF-'))
  }
})

test('document detail prioritizes metadata, PDF reading, and related documents', async () => {
  const page = await readFacultyFile('pages/document-detail.html')

  assert.match(page, /data-parent-page1="Văn bản – Biểu mẫu" data-parent-link1="\/documents-forms\.html"/)
  assert.match(page, /id="pdf-object"/)
  assert.match(page, /id="pdf-viewer"/)
  assert.match(page, /id="pdf-loading"/)
  assert.match(page, /id="pdf-fallback"/)
  assert.match(page, /\/assets\/documents\/thong-bao-1856-2025\.pdf/)
  assert.match(page, /data-text="Tải xuống"/)
  assert.match(page, /data-text="Mở toàn màn hình"/)
  assert.match(page, /Văn bản liên quan/)
  assert.doesNotMatch(page, /@shared\/components\/sidebar\/(news|announcements|videos)\.html/)
})

test('document pages compose every compatible shared UI primitive', async () => {
  const listing = await readFacultyFile('pages/documents-forms.html')
  const detail = await readFacultyFile('pages/document-detail.html')

  assert.equal((listing.match(/@shared\/components\/form\/field\.html/g) ?? []).length, 3)
  assert.equal((listing.match(/components\/documents\/document-item\.html/g) ?? []).length, 12)
  assert.match(listing, /@shared\/components\/button\/button\.html/)
  assert.doesNotMatch(listing, /<(?:input|select)\b/)

  assert.match(detail, /@shared\/components\/button\/button\.html/)
  assert.match(detail, /@shared\/components\/button\/button-download\.html/)
  assert.equal((detail.match(/@shared\/components\/common\/section-title\.html/g) ?? []).length, 4)
  assert.doesNotMatch(detail, /<h2 id="document-viewer-heading"/)
  assert.doesNotMatch(detail, /<h2 class="mt-1 font-inter text-lg font-bold text-title">Thông tin phát hành<\/h2>/)
  assert.equal((detail.match(/@shared\/components\/form\/display-row\.html/g) ?? []).length, 6)
  assert.equal((detail.match(/components\/documents\/related-document-card\.html/g) ?? []).length, 3)
})

test('shared link buttons forward native attributes for new-tab document actions', async () => {
  const button = await readSharedFile('components/button/button.html')

  assert.equal((button.match(/<a href="\{\{url\}\}" \{\{download\}\} \{\{attrs\}\}/g) ?? []).length, 7)
  assert.doesNotMatch(button, /alt="(?:arrow|icon)"/)
})
