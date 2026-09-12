import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveNewsDetailSlug } from '../src/shared/components/news/news-detail.js'

const slugs = ['latest-news', 'appointment', 'older-news']

test('news detail defaults to the newest item when slug is omitted', () => {
  assert.equal(resolveNewsDetailSlug(slugs, ''), 'latest-news')
})

test('news detail resolves a requested item without a runtime fetch', () => {
  assert.equal(resolveNewsDetailSlug(slugs, '?slug=appointment'), 'appointment')
})

test('news detail rejects unknown slugs and empty collections', () => {
  assert.equal(resolveNewsDetailSlug(slugs, '?slug=missing'), null)
  assert.equal(resolveNewsDetailSlug([], '?slug=appointment'), null)
})
