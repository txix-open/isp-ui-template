import { Button, Card, Space, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { useProfile } from '../../hooks/useProfile'
import { permissions } from '../../constants/permissions'

export default function HomePage() {
  const { data: profile, can } = useProfile()
  return (
    <main className="page">
      <Typography.Title level={2}>
        Здравствуйте, {profile?.displayName}
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        Приложение с собственным интерфейсом на ISP UI.
      </Typography.Paragraph>
      <Card title="Ваш профиль">
        <Space direction="vertical">
          <span>{profile?.email}</span>
          <Tag color={can(permissions.edit) ? 'blue' : 'default'}>
            {can(permissions.edit)
              ? 'Редактирование доступно'
              : can(permissions.view)
                ? 'Только просмотр'
                : 'Доступ к справочнику не предоставлен'}
          </Tag>
        </Space>
      </Card>
      {can(permissions.view) && (
        <Card title="Справочник" className="home-section">
          <Typography.Paragraph>
            Пример раздела с поиском, фильтром статуса и формой.
          </Typography.Paragraph>
          <Link to="/items">
            <Button type="primary">Открыть справочник</Button>
          </Link>
        </Card>
      )}
    </main>
  )
}
