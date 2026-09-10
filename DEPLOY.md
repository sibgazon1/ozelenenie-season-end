# Посадочная ozelenenie-season-end

## Локально

```bash
py -3 apps/ozelenenie-season-end/server.py
```

Открыть: http://127.0.0.1:5179

Порт: `5179` (или `PORT` / `OZELENENIE_PORT`).  
Лид: `POST /api/lead`, без промокода. Telegram - если заданы `TELEGRAM_BOT_TOKEN` и `TELEGRAM_OWNER_CHAT_ID`.

Кейсы и фото: `assets/cases/{dacha,house,cottage}/`. Оригиналы генерации: `Generations/10-9-2026/Images/ozelenenie-cases/`.

## Быстрая ссылка (Cloudflare Tunnel)

Сервер уже должен быть запущен на 5179:

```powershell
cloudflared tunnel --url http://127.0.0.1:5179
```

В консоли появится `https://....trycloudflare.com`. Работает, пока открыты туннель и локальный сервер.

## Постоянная ссылка (Render)

1. Залейте репозиторий на GitHub.
2. [render.com](https://render.com) → New → Blueprint / Web Service.
3. Root Directory: `apps/ozelenenie-season-end`
4. Build: `pip install -r requirements.txt`
5. Start: `python server.py`
6. Env (по желанию): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID`

Готовый `render.yaml` лежит в этой папке.
