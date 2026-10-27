#!/bin/sh
set -eu

PUBLIC_PATH="${PUBLIC_PATH:-/}"
case "$PUBLIC_PATH" in
  /*) ;;
  *) echo "PUBLIC_PATH должен начинаться с /" >&2; exit 1 ;;
esac
case "$PUBLIC_PATH" in
  *[!a-zA-Z0-9_/-]*) echo "Некорректный PUBLIC_PATH" >&2; exit 1 ;;
esac
PUBLIC_PATH="$(printf '%s' "$PUBLIC_PATH" | sed -E 's|^/*|/|; s|/*$|/|')"
case "$PUBLIC_PATH" in
  *//*) echo "PUBLIC_PATH содержит пустой сегмент" >&2; exit 1 ;;
esac

# Совместимый JS/JSON string без дополнительного runtime (только POSIX sh/awk).
# Sentinel сохраняет завершающие переводы строк значения.
json_string() {
  printf '%s.' "$1" | LC_ALL=C awk '
    { if (NR > 1) value = value "\n"; value = value $0 }
    END {
      value = substr(value, 1, length(value) - 1)
      for (i = 1; i < 32; i++) control[sprintf("%c", i)] = sprintf("\\u%04x", i)
      printf "\""
      for (i = 1; i <= length(value); i++) {
        char = substr(value, i, 1)
        if (char == "\\") printf "\\\\"
        else if (char == "\"") printf "\\\""
        else if (char == "<") printf "\\u003c"
        else if (char in control) printf "%s", control[char]
        else printf "%s", char
      }
      printf "\""
    }'
}

ENABLE_PASSWORD_LOGIN="${ENABLE_PASSWORD_LOGIN:-true}"
ENABLE_OAUTH_LOGIN="${ENABLE_OAUTH_LOGIN:-false}"
for value in "$ENABLE_PASSWORD_LOGIN" "$ENABLE_OAUTH_LOGIN"; do
  case "$value" in
    true|false) ;;
    *) echo "ENABLE_PASSWORD_LOGIN и ENABLE_OAUTH_LOGIN должны быть true или false" >&2; exit 1 ;;
  esac
done

CONFIG_DIR="/opt/msp/project-name${PUBLIC_PATH}"
CONFIG_PATH="${CONFIG_DIR}config.js"
NGINX_SRC="/etc/nginx/conf.d/template_cfg.conf"
TMP_FILE="${NGINX_SRC}.tmp"

mkdir -p "$CONFIG_DIR"
# APP_NAME добавляется только при явной передаче, чтобы не подменять название сборки.
APP_NAME_CONFIG=""
if [ "${APP_NAME+x}" = x ]; then
  APP_NAME_CONFIG="  APP_NAME: $(json_string "$APP_NAME"),"
fi
cat <<EOF > "$CONFIG_PATH"
window.config = {
${APP_NAME_CONFIG}
  APP_TOKEN: $(json_string "${APP_TOKEN:-default_token}"),
  CLIENT_NAME: $(json_string "${CLIENT_NAME:-project-name}"),
  ENABLE_PASSWORD_LOGIN: ${ENABLE_PASSWORD_LOGIN},
  ENABLE_OAUTH_LOGIN: ${ENABLE_OAUTH_LOGIN},
  OAUTH_LOGIN_BUTTON_TEXT: $(json_string "${OAUTH_LOGIN_BUTTON_TEXT:-Войти с помощью OAuth}")
};
EOF

sed "s|__PUBLIC_PATH__|${PUBLIC_PATH}|g" "$NGINX_SRC" > "$TMP_FILE"
mv "$TMP_FILE" "$NGINX_SRC"
echo "Generated runtime config: $CONFIG_PATH; PUBLIC_PATH=$PUBLIC_PATH"
exec nginx -g "daemon off;"
