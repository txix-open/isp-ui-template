import { appConfig } from '../../utils/configUtils'

export default function HomePage() {
  return (
    <main>
      <p className="eyebrow">React · TypeScript · Vite</p>
      <h1>{appConfig.name}</h1>
      <p>Минимальная основа нового проекта готова.</p>
      <p>Добавьте свою страницу в src/pages и маршрут в App.tsx.</p>
      <p>Инструкции по разработке — в README проекта.</p>
      <small>Версия {window.AppVersion}</small>
    </main>
  )
}
