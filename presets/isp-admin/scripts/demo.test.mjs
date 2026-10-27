import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createDemoBackend } from '../demo/backend.mjs'

const login = (backend, email = 'editor@example.test') =>
  backend('/admin/auth/login', { email, password: 'demo' }).data.token

test('CRUD validates input, rejects duplicates, updates and deletes', () => {
  const backend = createDemoBackend()
  const token = login(backend)
  assert.equal(backend('/example/items/list', {}, undefined).status, 401)
  assert.equal(
    backend('/example/items/create', { name: '   ' }, token).status,
    400
  )
  const created = backend('/example/items/create', { name: 'Новая' }, token)
  assert.equal(created.status, 200)
  assert.equal(
    backend('/example/items/create', { name: 'Новая' }, token).status,
    400
  )
  assert.equal(
    backend(
      '/example/items/update',
      { id: created.data.id, name: 'Изменена' },
      token
    ).data.name,
    'Изменена'
  )
  assert.equal(
    backend('/example/items/delete', { id: created.data.id }, token).status,
    200
  )
  assert.equal(backend('/example/items/list', {}, token).data.length, 2)
  backend('/admin/auth/logout', {}, token)
  assert.equal(backend('/example/items/list', {}, token).status, 401)
})

test('viewer and blocked accounts enforce permissions on the backend', () => {
  const backend = createDemoBackend()
  const viewer = login(backend, 'viewer@example.test')
  assert.equal(backend('/example/items/list', {}, viewer).status, 200)
  for (const operation of ['create', 'update', 'delete'])
    assert.equal(
      backend(
        `/example/items/${operation}`,
        { name: 'Запись', id: '1' },
        viewer
      ).status,
      403
    )
  const blocked = login(backend, 'blocked@example.test')
  assert.equal(backend('/example/items/list', {}, blocked).status, 403)
  assert.equal(
    backend('/admin/auth/login', {
      email: 'editor@example.test',
      password: 'wrong'
    }).status,
    401
  )
})
