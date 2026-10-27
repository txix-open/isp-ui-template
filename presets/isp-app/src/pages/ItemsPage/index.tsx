import {
  Alert,
  App,
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography
} from 'antd'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { permissions } from '../../constants/permissions'
import { useProfile } from '../../hooks/useProfile'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { itemsApi, type Item } from '../../services/itemsApi'
import { parseListParams } from '../../utils/listParams'
import { getApiErrorMessage } from '../../utils/apiError'
import { ItemForm } from './ItemForm'

export default function ItemsPage() {
  const { message } = App.useApp()
  const { can } = useProfile()
  const [params, setParams] = useSearchParams()
  const query = parseListParams(params)
  const search = useDebouncedValue(query.search)
  const { currentData, isLoading, isFetching, error, refetch } =
    itemsApi.useListQuery({ ...query, search })
  const [create, createState] = itemsApi.useCreateMutation()
  const [update, updateState] = itemsApi.useUpdateMutation()
  const [remove, removeState] = itemsApi.useRemoveMutation()
  const [editing, setEditing] = useState<Item | 'new' | null>(null)
  const changeParams = (changes: Record<string, string>) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        Object.entries(changes).forEach(([key, value]) =>
          value ? next.set(key, value) : next.delete(key)
        )
        return next
      },
      { replace: true }
    )
  return (
    <main className="page">
      <Typography.Title level={2}>Справочник</Typography.Title>
      <Typography.Paragraph type="secondary">
        Собственный раздел приложения: данные, фильтры и права действий.
      </Typography.Paragraph>
      <Space className="items-toolbar" wrap>
        <Input.Search
          aria-label="Поиск по названию"
          placeholder="Поиск по названию"
          allowClear
          value={query.search}
          onChange={(event) =>
            changeParams({ search: event.target.value, page: '' })
          }
        />
        <Select
          aria-label="Фильтр статуса"
          className="status-filter"
          value={query.status}
          options={[
            { value: '', label: 'Все статусы' },
            { value: 'active', label: 'Активные' },
            { value: 'archived', label: 'В архиве' }
          ]}
          onChange={(value) => changeParams({ status: value, page: '' })}
        />
        <Button onClick={() => void refetch()} loading={isFetching}>
          Обновить
        </Button>
        {can(permissions.create) && (
          <Button type="primary" onClick={() => setEditing('new')}>
            Создать запись
          </Button>
        )}
      </Space>
      {Boolean(error) && (
        <Alert
          type="error"
          title={
            currentData
              ? 'Не удалось обновить данные'
              : 'Не удалось загрузить справочник'
          }
          description={getApiErrorMessage(error)}
          role="alert"
        />
      )}
      <Table<Item>
        rowKey="id"
        scroll={{ x: 660 }}
        loading={isLoading || isFetching}
        dataSource={currentData?.items}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total: currentData?.total || 0,
          showSizeChanger: false,
          hideOnSinglePage: true
        }}
        locale={{
          emptyText: error
            ? 'Данные недоступны'
            : query.search || query.status
              ? 'Ничего не найдено'
              : 'Записей пока нет'
        }}
        onChange={(pagination, _filters, sorter) => {
          const order =
            !Array.isArray(sorter) && sorter.order === 'descend'
              ? 'desc'
              : 'asc'
          changeParams({
            page: order !== query.order ? '' : String(pagination.current || 1),
            order
          })
        }}
        columns={[
          {
            title: 'Название',
            dataIndex: 'name',
            sorter: true,
            sortOrder: query.order === 'asc' ? 'ascend' : 'descend',
            sortDirections: ['ascend', 'descend', 'ascend']
          },
          {
            title: 'Статус',
            dataIndex: 'status',
            render: (status: Item['status']) => (
              <Tag color={status === 'active' ? 'green' : 'default'}>
                {status === 'active' ? 'Активна' : 'В архиве'}
              </Tag>
            )
          },
          {
            title: 'Действия',
            key: 'actions',
            hidden: !can(permissions.edit) && !can(permissions.remove),
            render: (_, item) => (
              <Space wrap>
                {can(permissions.edit) && (
                  <Button onClick={() => setEditing(item)}>
                    Редактировать
                  </Button>
                )}
                {can(permissions.remove) && (
                  <Popconfirm
                    title="Удалить запись?"
                    okText="Удалить"
                    cancelText="Отмена"
                    onConfirm={async () => {
                      try {
                        await remove(item.id).unwrap()
                        if (currentData?.items.length === 1 && query.page > 1)
                          changeParams({ page: String(query.page - 1) })
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
