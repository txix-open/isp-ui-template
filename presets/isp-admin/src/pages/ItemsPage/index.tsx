import {
  Alert,
  App,
  Button,
  Input,
  Popconfirm,
  Space,
  Table,
  Typography
} from 'antd'
import { useRole } from 'isp-admin-ui-kit'
import { useState } from 'react'

import { permissions } from '../../constants/permissions'
import { itemsApi, type Item } from '../../services/itemsApi'
import { getApiErrorMessage } from '../../utils/apiError'
import { ItemForm } from './ItemForm'

export default function ItemsPage() {
  const { message } = App.useApp()
  const { hasPermission } = useRole()
  const { data, isLoading, isFetching, error, refetch } =
    itemsApi.useListQuery()
  const [create, createState] = itemsApi.useCreateMutation()
  const [update, updateState] = itemsApi.useUpdateMutation()
  const [remove, removeState] = itemsApi.useRemoveMutation()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Item | 'new' | null>(null)
  const canCreate = hasPermission(permissions.create)
  const canEdit = hasPermission(permissions.edit)
  const canDelete = hasPermission(permissions.remove)
  const rows = data?.filter((item) =>
    item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())
  )
  return (
    <main className="items-page">
      <Typography.Title level={2}>Справочник</Typography.Title>
      <Typography.Paragraph type="secondary">
        Пример собственного раздела: таблица, формы, API и права.
      </Typography.Paragraph>
      <Space className="items-toolbar" wrap>
        <Input.Search
          aria-label="Поиск по названию"
          placeholder="Поиск по названию"
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Button onClick={() => void refetch()} loading={isFetching}>
          Обновить
        </Button>
        {canCreate && (
          <Button type="primary" onClick={() => setEditing('new')}>
            Создать запись
          </Button>
        )}
      </Space>
      {Boolean(error) && (
        <Alert
          type="error"
          title="Не удалось загрузить справочник"
          description={getApiErrorMessage(error)}
          role="alert"
        />
      )}
      <Table<Item>
        rowKey="id"
        scroll={{ x: 540 }}
        loading={isLoading}
        dataSource={rows}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
        locale={{
          emptyText: error
            ? 'Данные недоступны'
            : search
              ? 'Ничего не найдено'
              : 'Записей пока нет'
        }}
        columns={[
          {
            title: 'Название',
            dataIndex: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
          },
          {
            title: 'Действия',
            key: 'actions',
            hidden: !canEdit && !canDelete,
            render: (_, item) => (
              <Space wrap>
                {canEdit && (
                  <Button onClick={() => setEditing(item)}>
                    Редактировать
                  </Button>
                )}
                {canDelete && (
                  <Popconfirm
                    title="Удалить запись?"
                    okText="Удалить"
                    cancelText="Отмена"
                    onConfirm={async () => {
                      try {
                        await remove(item.id).unwrap()
                        void message.success('Запись удалена')
                      } catch (cause) {
                        void message.error(getApiErrorMessage(cause))
                      }
                    }}
                  >
                    <Button danger loading={removeState.isLoading}>
                      Удалить
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            )
          }
        ]}
      />
      {editing && (
        <ItemForm
          item={editing === 'new' ? undefined : editing}
          loading={createState.isLoading || updateState.isLoading}
          onCancel={() => setEditing(null)}
          onSave={async (input) => {
            if (editing === 'new') await create(input).unwrap()
            else await update({ ...input, id: editing.id }).unwrap()
            setEditing(null)
            void message.success('Запись сохранена')
          }}
        />
      )}
    </main>
  )
}
