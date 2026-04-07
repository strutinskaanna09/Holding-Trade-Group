#!/bin/bash

echo "🚀 Запуск серверів..."

# Запуск API сервера в фоновому режимі
cd "$(dirname "$0")/apps/api"
echo "📡 Запускаю API сервер на порту 3000..."
npm run dev > ../../api.log 2>&1 &
API_PID=$!
echo "API PID: $API_PID"

# Зачекати 3 секунди
sleep 3

# Запуск Web сервера в фоновому режимі
cd "../web"
echo "🌐 Запускаю Web сервер на порту 3001..."
PORT=3001 npm run dev > ../../web.log 2>&1 &
WEB_PID=$!
echo "Web PID: $WEB_PID"

echo ""
echo "✅ Сервери запущені!"
echo "📡 API: http://localhost:3000"
echo "🌐 Web: http://localhost:3001"
echo ""
echo "📝 Логи:"
echo "   API: tail -f api.log"
echo "   Web: tail -f web.log"
echo ""
echo "🛑 Для зупинки: kill $API_PID $WEB_PID"

# Зберегти PID для подальшого використання
echo "$API_PID" > ../../api.pid
echo "$WEB_PID" > ../../web.pid
