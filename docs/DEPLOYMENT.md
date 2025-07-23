# CerebellumBot Platform - Deployment Guide

## Системные требования

### Минимальные требования
- **CPU**: 4 cores
- **RAM**: 8GB
- **Storage**: 100GB SSD
- **Network**: 1Gbps
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Docker

### Рекомендуемые требования (Production)
- **CPU**: 8+ cores
- **RAM**: 32GB+
- **Storage**: 500GB+ NVMe SSD
- **Network**: 10Gbps
- **OS**: Ubuntu 22.04 LTS

## Локальная разработка

### Предварительные требования
```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.12+
sudo apt update
sudo apt install python3.12 python3.12-venv python3-pip

# Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Docker & Docker Compose
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER
```

### Запуск backend
```bash
cd backend
poetry install
cp .env.example .env
# Отредактируйте .env файл
poetry run fastapi dev app/main.py
```

### Запуск frontend
```bash
cd frontend
npm install
cp .env.example .env
# Отредактируйте .env файл
npm run dev
```

### Запуск с Docker Compose
```bash
# Полная среда разработки
docker-compose -f docker-compose.dev.yml up -d

# Production-like среда
docker-compose up -d
```

## Production развёртывание

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Установка Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Настройка firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Клонирование и настройка

```bash
# Клонирование репозитория
git clone https://github.com/your-org/cerebellumbot-platform.git
cd cerebellumbot-platform

# Создание production конфигурации
cp backend/.env.example backend/.env.prod
cp frontend/.env.example frontend/.env.prod

# Редактирование конфигурации
nano backend/.env.prod
nano frontend/.env.prod
```

### 3. SSL сертификаты

```bash
# Получение SSL сертификата
sudo certbot --nginx -d cerebellumbot.ai -d www.cerebellumbot.ai

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 4. Настройка Nginx

```bash
# Копирование конфигурации
sudo cp infra/nginx.conf /etc/nginx/sites-available/cerebellumbot
sudo ln -s /etc/nginx/sites-available/cerebellumbot /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Запуск приложения

```bash
# Production запуск
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose ps
docker-compose logs -f
```

### 6. Настройка мониторинга

```bash
# Prometheus + Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# Проверка метрик
curl http://localhost:9090/metrics
```

## CI/CD с GitHub Actions

### Настройка секретов

В GitHub репозитории добавьте следующие секреты:

```
DEPLOY_HOST=your-server-ip
DEPLOY_USER=deploy
DEPLOY_SSH_KEY=your-private-ssh-key
DOCKER_REGISTRY_TOKEN=your-registry-token
```

### SSH ключи для деплоя

```bash
# На сервере
sudo adduser deploy
sudo usermod -aG docker deploy
sudo su - deploy
ssh-keygen -t rsa -b 4096 -C "deploy@cerebellumbot.ai"

# Добавить публичный ключ в ~/.ssh/authorized_keys
# Приватный ключ добавить в GitHub Secrets как DEPLOY_SSH_KEY
```

### Автоматический деплой

После push в main ветку:
1. Запускаются тесты backend и frontend
2. Собираются Docker образы
3. Образы публикуются в registry
4. Выполняется деплой на production сервер

## Мониторинг и логирование

### Prometheus метрики

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'cerebellumbot-backend'
    static_configs:
      - targets: ['backend:8000']
  
  - job_name: 'cerebellumbot-frontend'
    static_configs:
      - targets: ['frontend:3000']
```

### Grafana дашборды

Импортируйте готовые дашборды:
- FastAPI Application Metrics
- React Application Performance
- PostgreSQL Database Metrics
- Redis Cache Metrics

### Логирование

```bash
# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend

# ELK Stack для централизованного логирования
docker-compose -f docker-compose.logging.yml up -d
```

## Резервное копирование

### База данных

```bash
# Создание бэкапа
docker-compose exec db pg_dump -U postgres cerebellumbot > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
docker-compose exec -T db psql -U postgres cerebellumbot < backup_20240101_120000.sql
```

### Автоматические бэкапы

```bash
# Cron задача для ежедневных бэкапов
0 2 * * * /opt/cerebellumbot-platform/scripts/backup.sh
```

## Масштабирование

### Горизонтальное масштабирование

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
  
  frontend:
    deploy:
      replicas: 2
```

### Load Balancer

```nginx
upstream backend_pool {
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

upstream frontend_pool {
    server frontend1:3000;
    server frontend2:3000;
}
```

## Безопасность

### Настройки безопасности

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Настройка fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Отключение root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

### Сканирование уязвимостей

```bash
# Trivy для сканирования Docker образов
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image cerebellumbot-backend:latest
```

## Troubleshooting

### Общие проблемы

1. **Контейнеры не запускаются**
   ```bash
   docker-compose logs
   docker system prune -f
   ```

2. **База данных недоступна**
   ```bash
   docker-compose exec db psql -U postgres -c "SELECT 1;"
   ```

3. **Проблемы с SSL**
   ```bash
   sudo certbot certificates
   sudo nginx -t
   ```

4. **Высокая нагрузка**
   ```bash
   docker stats
   htop
   ```

### Логи и диагностика

```bash
# Системные логи
sudo journalctl -u nginx
sudo journalctl -u docker

# Логи приложения
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Метрики производительности
curl http://localhost:8000/metrics
```

## Контакты поддержки

- **Technical Support**: tech@cerebellumbot.ai
- **Emergency**: +1-XXX-XXX-XXXX
- **Documentation**: https://docs.cerebellumbot.ai
