# 🔧 Добавление в новый проект

## 📁 Копирование репозитория

Скопировать содержимое репозитория в новую директорию проекта.

---

## ⚙️ Настройка Docker и Nginx

### 🧾 Nginx

Конфиг nginx находится по пути:

```
cfg/template_cfg.conf
```

Необходимо:

1. Переименовать конфиг `template_cfg.conf` в соответствии с названием проекта.
2. Изменить путь `root` в соответствии с названием проекта:

   ```
   root  /opt/msp/project-name/;
   ```

---

### 🐳 Docker

В `Dockerfile`, в блоке настройки Nginx, внести следующие изменения:

1. Переименовать конфиг nginx:

   ```dockerfile
   COPY cfg/template_cfg.conf /etc/nginx/conf.d/project-name.conf
   ```

2. Изменить название проекта:

   ```dockerfile
   COPY --from=build /usr/src/app/build /opt/msp/project-name
   ```

3. Обновить пути к `entrypoint.sh`:

   ```dockerfile
   COPY entrypoint.sh /opt/msp/project-name/entrypoint.sh
   ENTRYPOINT ["/opt/msp/project-name/entrypoint.sh"]
   ```

---

## ⚙️ Настройка `config.js`

### 📄 В `entrypoint.sh`

Обновить путь до `config.js`:

```bash
CONFIG_PATH="/opt/msp/project-name/config.js"
```

---

### 🛠 Формат `config.js`

Пример структуры:

```javascript
window.config = {
  APP_TOKEN: '${APP_TOKEN:-"default_token"}',
  NEW_FIELD: '${NEW_FIELD:-"default_value"}'
};
```

> ⚠️ **Если значение не строка** — не используйте кавычки:

```
NEW_BOOL_VALUE: ${NEW_BOOL_VALUE:-true}
```

---

Вот более аккуратный, структурированный и «документационный» вариант с пояснениями и примерами 👇

---

### 🌐 Работа с `PUBLIC_PATH`

Для корректного деплоя приложения в **поддиректорию сайта**
например:

```
https://domain.com/my-app/
```

используется переменная окружения **`PUBLIC_PATH`**.

Она определяет **базовый путь**, относительно которого будут загружаться статические файлы (JS, CSS, assets) и работать роутинг приложения.

---

### 🛠 Передача `PUBLIC_PATH` при сборке образа

Значение `PUBLIC_PATH` необходимо передать **на этапе сборки**, так как оно используется бандлером (Vite / Webpack) при генерации статических файлов:

```bash
docker build \
  --build-arg PUBLIC_PATH=/test \
  -t my-app .
```

> ⚠️ Важно
> Путь должен начинаться со слэша (`/`) и **не заканчиваться слэшем**.

---

### 🚀 Передача `PUBLIC_PATH` при запуске контейнера

Переменная также должна быть доступна **во время запуска контейнера**, чтобы приложение и сервер (nginx / node) работали в одном и том же контексте:

```bash
docker run \
  -e PUBLIC_PATH=/test \
  my-app
```

---

### ✅ Результат

При значении:

```env
PUBLIC_PATH=/test
```

приложение будет доступно по адресу:

```
https://domain.com/test/
```

и все статические ресурсы будут корректно загружаться относительно этого пути.

---

### 💡 Рекомендации

* Используйте **одно и то же значение `PUBLIC_PATH`** при сборке и запуске контейнера
* Для деплоя в корень домена используйте:

  ```env
  PUBLIC_PATH=/
  ```
---


### 🧩 Использование конфига в проекте

Для получения значений из `config.js` используйте функцию `getConfigProperty` из пакета `isp-ui-kit`.

**Пример:**

```javascript
getConfigProperty(
  'APP_TOKEN',
  import.meta.env.DEV_APP_TOKEN
)
```
