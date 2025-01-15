# Добавление в новый проект
Скопировать содержимое репозитория в новую директорию проекта
# Настройка Docker и Nginx
## Nginx
Конфиг nginx находится: ```cfg/template_cfg.conf```
1. Изменить название стандартного конфига nginx на проектное
2. Изменить root в конфиге на название папки проекта ```  root  /opt/msp/project-name/```
## Docker
В Dockerfile в блоке настройки Nginx. Изменить:
1. Изменить название конфига nginx на проектное ```COPY cfg/template_cfg.conf /etc/nginx/conf.d/template_cfg.conf```
2. Изменить название проекта ```COPY --from=build /usr/src/app/build /opt/msp/project-name```
