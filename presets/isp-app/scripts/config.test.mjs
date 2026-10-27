import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeBasePath } from './config.mjs'

test('base path supports root and normalizes a subdirectory', () => {
  assert.equal(normalizeBasePath('/'), '/')
  assert.equal(normalizeBasePath('/admin'), '/admin/')
  assert.equal(normalizeBasePath('/team/admin/'), '/team/admin/')
  for (const path of ['admin', '//admin', '/a/../b', '/a?b', '/a b']) {
    assert.throws(() => normalizeBasePath(path))
  }
})
