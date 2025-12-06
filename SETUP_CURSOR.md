# Настройка Sys8 MCP для Cursor AI

**Требования:** Node.js >= 24.0.0

## Быстрая настройка (глобально для всех проектов)

### Вариант 1: Через tsx (Рекомендуется для разработки)

Этот вариант запускает TypeScript напрямую, как в других MCP серверах. Не требует компиляции.

**macOS/Linux:**

1. Создайте или отредактируйте файл конфигурации:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

2. Добавьте следующую конфигурацию (замените путь на ваш):
```json
{
  "mcpServers": {
    "sys8": {
      "command": "npx",
      "args": ["tsx", "/Users/ug/code/AI/mcp/sys8/src/index.ts"]
    }
  }
}
```

3. Перезапустите Cursor AI

### Вариант 2: Через скомпилированный JavaScript

Этот вариант использует скомпилированный файл. Требует запуска `npm run build` после изменений.

**macOS/Linux:**

1. Создайте или отредактируйте файл конфигурации:
```bash
mkdir -p ~/Library/Application\ Support/Cursor/User/globalStorage
nano ~/Library/Application\ Support/Cursor/User/globalStorage/mcp.json
```

2. Добавьте следующую конфигурацию (замените путь на ваш):
```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["/Users/ug/code/AI/mcp/sys8/build/index.js"]
    }
  }
}
```

3. Перезапустите Cursor AI

### Linux

1. Создайте или отредактируйте файл конфигурации:
```bash
mkdir -p ~/.config/Cursor/User/globalStorage
nano ~/.config/Cursor/User/globalStorage/mcp.json
```

2. Добавьте конфигурацию как в примере для macOS

3. Перезапустите Cursor AI

### Windows

1. Создайте или отредактируйте файл:
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

2. Добавьте конфигурацию (используйте формат Windows путей):
```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp\\sys8\\build\\index.js"]
    }
  }
}
```

3. Перезапустите Cursor AI

## Настройка для конкретного проекта

Если вы хотите использовать сервер только в текущем проекте, отредактируйте файл `.cursor/mcp.json` в корне проекта:

```json
{
  "mcpServers": {
    "sys8": {
      "command": "node",
      "args": ["./sys8/build/index.js"]
    }
  }
}
```

## Проверка работы

После настройки и перезапуска Cursor AI, вы можете использовать следующие функции:

- `get_current_date` - получить текущую дату
- `get_current_datetime` - получить дату и время
- `get_unix_timestamp` - получить Unix timestamp
- `get_os_version` - получить версию операционной системы

Просто запросите их в чате Cursor AI, и они будут автоматически доступны.

