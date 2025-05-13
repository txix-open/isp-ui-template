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

### 🧩 Использование конфига в проекте

Для получения значений из `config.js` используйте функцию `getConfigProperty` из пакета `isp-ui-kit`.

**Пример:**

```javascript
getConfigProperty(
  'APP_TOKEN',
  import.meta.env.DEV_APP_TOKEN
)
```
