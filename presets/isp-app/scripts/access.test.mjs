import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  hasPermissions,
  isSession,
  safeReturnPath
} from '../src/utils/access.ts'
import { parseListParams } from '../src/utils/listParams.ts'

test('permissions distinguish public sections, any and all', () => {
  assert.equal(hasPermissions([], []), true)
  assert.equal(hasPermissions([], 'edit'), false)
  assert.equal(hasPermissions(['view'], ['view', 'edit']), true)
  assert.equal(hasPermissions(['view'], ['view', 'edit'], 'all'), false)
})

test('session headers and return routes cannot inject headers or external navigation', () => {
  assert.equal(isSession({ headerName: 'x-auth-user', token: 'example' }), true)
  for (const value of [
    null,
    {},
    { headerName: 'Cookie', token: 'example' },
    { headerName: 'x-application-token', token: 'example' },
    { headerName: 'x-auth-user', token: 'one\r\ntwo' }
  ])
    assert.equal(isSession(value), false)
  assert.equal(safeReturnPath('/items?page=2'), '/items?page=2')
  for (const path of [
    'https://outside.test',
    '//outside.test',
    '/\\outside.test',
    null
  ])
    assert.equal(safeReturnPath(path), '/')
})

test('list URL values normalize invalid pages, filters and sort order', () => {
  assert.deepEqual(
    parseListParams(new URLSearchParams('page=-1&status=wrong&order=invalid')),
    { search: '', status: '', page: 1, pageSize: 10, order: 'asc' }
  )
  assert.deepEqual(
    parseListParams(
      new URLSearchParams('page=2&status=archived&search=Test&order=desc')
    ),
    { search: 'Test', status: 'archived', page: 2, pageSize: 10, order: 'desc' }
  )
})
