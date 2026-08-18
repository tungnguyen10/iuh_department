import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('publicUrl bases internal links and preserves external protocols', async () => {
  const { publicUrl } = await import('../src/shared/js/utils.js')

  assert.equal(publicUrl('/news.html', '/faculty/'), '/faculty/news.html')
  assert.equal(publicUrl('/', '/faculty/'), '/faculty/')
  assert.equal(publicUrl('//cdn.example.test/page', '/faculty/'), '//cdn.example.test/page')
  assert.equal(publicUrl('mailto:help@iuh.edu.vn', '/faculty/'), 'mailto:help@iuh.edu.vn')
  assert.equal(publicUrl('#section', '/faculty/'), '#section')
})

test('search modal normalizes and escapes every configured href', async () => {
  const source = await readFile(new URL('../src/shared/components/search/search-modal.js', import.meta.url), 'utf8')

  assert.match(source, /escapeHtml\(publicUrl\(item\.href/)
  assert.match(source, /escapeHtml\(publicUrl\(result\.url/)
})
