#!/bin/bash

echo "🚀 Запуск всіх сервісів..."

# Перевірка Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker не запущений!"
    echo "📋 Запустіть Docker Desktop і спробуйте знову"
    exit 1
fi

# Запуск БД та Redis
echo "📦 Запуск бази даних..."
cd "$(dirname "$0")"
docker-compose -f infra/docker-compose.yml up -d postgres redis

echo "⏳ Очікування запуску БД (15 секунд)..."
sleep 15

# Створення адміна
echo "👤 Створення адміністратора..."
sleep 5
curl -s -X POST http://localhost:3000/auth/create-admin \
     -H 'Content-Type: application/json' \
     -d '{"email":"admin@holding.com","password":"admin123"}' || echo "⚠️ API ще не готовий, створіть адміна вручну пізніше"

echo ""
echo "✅ Готово!"
echo "📋 Облікові дані:"
echo "   Email: admin@holding.com"
echo "   Пароль: admin123"
echo ""
echo "🌐 Відкрийте: http://localhost:3001/admin/login"

