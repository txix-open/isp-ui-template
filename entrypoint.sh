#!/bin/sh
# ЗАМЕНИТЬ НА НАЗВАНИЕ ПРОЕКТА
CONFIG_PATH="/opt/msp/project-name/config.js"

cat <<EOF > $CONFIG_PATH
// DON'T TOUCH
// THIS FILE FOR PRODUCTION BUILD

window.config = {
  APP_TOKEN: '${APP_TOKEN:-"default_token"}',
};
EOF


exec nginx -g "daemon off;"
