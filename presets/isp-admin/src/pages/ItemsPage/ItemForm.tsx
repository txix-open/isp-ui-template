import { Button, Modal, Space, Alert } from 'antd'
import { FormInput } from 'isp-ui-kit'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

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
  } = useForm<ItemInput>({ defaultValues: { name: item?.name || '' } })
  const [error, setError] = useState('')
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
      maskClosable={!loading}
      keyboard={!loading}
    >
      {contextHolder}
      <form
        onSubmit={handleSubmit(async (input) => {
          setError('')
          try {
            await onSave({ name: input.name.trim() })
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
