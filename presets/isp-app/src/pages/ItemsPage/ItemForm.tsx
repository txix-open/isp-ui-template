import { Button, Modal, Space, Alert, Select, Form } from 'antd'
import { FormInput } from 'isp-ui-kit'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useBlocker, useBeforeUnload } from 'react-router-dom'
import { useCallback } from 'react'

import type { Item, ItemInput } from '../../services/itemsApi'
import { getApiErrorMessage } from '../../utils/apiError'

export function ItemForm({
  item,
  onSave,
  onCancel,
  loading
}: {
  item?: Item
  onSave: (input: ItemInput) => Promise<unknown>
  onCancel: () => void
  loading: boolean
}) {
  const {
    control,
    handleSubmit,
    formState: { isDirty }
  } = useForm<ItemInput>({
    defaultValues: { name: item?.name || '', status: item?.status || 'active' }
  })
  const [error, setError] = useState('')
  const blocker = useBlocker(isDirty && !loading)
  useBeforeUnload(
    useCallback(
      (event) => {
        if (isDirty && !loading) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [isDirty, loading]
    )
  )
  const [modal, contextHolder] = Modal.useModal()
  const close = () => {
    if (loading) return
    if (!isDirty) return onCancel()
    modal.confirm({
      title: 'Отменить изменения?',
      content: 'Несохранённые данные будут потеряны.',
      okText: 'Отменить изменения',
      cancelText: 'Продолжить',
      onOk: onCancel
    })
  }
  return (
    <Modal
      title={item ? 'Редактировать запись' : 'Новая запись'}
      open
      onCancel={close}
      footer={null}
      closable={!loading}
      mask={{ closable: !loading }}
      keyboard={!loading}
    >
      {contextHolder}
      <Modal
        open={blocker.state === 'blocked'}
        title="Уйти без сохранения?"
        okText="Уйти"
        cancelText="Продолжить редактирование"
        onOk={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      >
        Изменения будут потеряны.
      </Modal>
      <form
        onSubmit={handleSubmit(async (input) => {
          setError('')
          try {
            await onSave({ ...input, name: input.name.trim() })
          } catch (cause) {
            setError(getApiErrorMessage(cause))
          }
        })}
      >
        {error && <Alert type="error" title={error} role="alert" />}
        <FormInput
          control={control}
          name="name"
          label="Название"
          aria-label="Название"
          disabled={loading}
          rules={{
            validate: (value) => value.trim().length > 0 || 'Введите название',
            maxLength: { value: 100, message: 'Не более 100 символов' }
          }}
        />
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Form.Item label="Статус">
              <Select
                {...field}
                aria-label="Статус"
                disabled={loading}
                options={[
                  { value: 'active', label: 'Активна' },
                  { value: 'archived', label: 'В архиве' }
                ]}
              />
            </Form.Item>
          )}
        />
        <Space>
          <Button onClick={close} disabled={loading}>
            Отмена
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Сохранить
          </Button>
        </Space>
      </form>
    </Modal>
  )
}
