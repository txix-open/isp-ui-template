#!/bin/sh
set -e

PUBLIC_PATH="${PUBLIC_PATH:-/}"

PUBLIC_PATH="$(printf '%s' "$PUBLIC_PATH" | sed -E 's|^/*|/|; s|/*$|/|')"

echo "Using normalized PUBLIC_PATH: '$PUBLIC_PATH'"

# Генерация конфигурации приложения
CONFIG_DIR="/opt/msp/project-name${PUBLIC_PATH}"
CONFIG_PATH="${CONFIG_DIR}/config.js"

mkdir -p "$CONFIG_DIR"

cat <<EOF > "$CONFIG_PATH"
window.config = {
  APP_TOKEN: '${APP_TOKEN:-"default_token"}',
};
EOF

echo "Generated config at: $CONFIG_PATH"

# Подготовка nginx-конфига: заменяем __PUBLIC_PATH__ на реальное значение
NGINX_SRC="/etc/nginx/conf.d/template_cfg.conf"
TMP_FILE="${NGINX_SRC}.tmp"

echo "Substituting __PUBLIC_PATH__ with: '${PUBLIC_PATH}'"
sed "s|__PUBLIC_PATH__|${PUBLIC_PATH}|g" "$NGINX_SRC" > "$TMP_FILE"

# Проверка результата
echo "=== Generated nginx config ==="
cat "$TMP_FILE"
echo "=== End nginx config ==="

# Заменяем оригинальный конфиг
mv "$TMP_FILE" "$NGINX_SRC"

echo "Starting nginx..."
exec nginx -g "daemon off;"
