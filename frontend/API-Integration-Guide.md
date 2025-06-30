# 🌐 Руководство по интеграции с Backend API

## 📋 Содержание
1. [Быстрый старт](#быстрый-старт)
2. [Настройка API](#настройка-api)
3. [Основные функции](#основные-функции)
4. [Примеры использования](#примеры-использования)
5. [Обработка ошибок](#обработка-ошибок)
6. [Дополнительные возможности](#дополнительные-возможности)

---

## 🚀 Быстрый старт

### 1. Настройте URL вашего backend
```javascript
// В файле src/api.js измените эту строку:
const API_BASE_URL = 'http://localhost:8000/api' // Ваш backend URL
```

### 2. Импортируйте функции API
```javascript
import { 
  analyzeDocument, 
  searchInDocument, 
  uploadFile 
} from './api.js'
```

### 3. Используйте в компонентах
```javascript
// Загрузка файла
const handleUpload = async (file) => {
  try {
    const result = await uploadFile(file)
    console.log('Файл загружен:', result)
  } catch (error) {
    console.error('Ошибка:', error)
  }
}
```

---

## ⚙️ Настройка API

### Структура backend endpoints:
```
POST /api/documents/upload      - Загрузка файла
POST /api/documents/analyze     - Анализ документа
POST /api/documents/search      - Поиск в документе
GET  /api/documents/:id/metadata - Получение метаданных
GET  /api/documents/:id/analysis - Результаты анализа
```

### Настройка CORS (если нужно):
Убедитесь, что ваш backend разрешает CORS запросы с frontend домена:
```python
# Пример для FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Ваш frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 Основные функции

### 📤 **uploadFile(file)**
Загружает файл на сервер

```javascript
const uploadResult = await uploadFile(selectedFile)
// Возвращает: { document_id: "abc123", message: "File uploaded" }
```

### 📊 **analyzeDocument(documentData)**
Анализирует документ

```javascript
const analysis = await analyzeDocument({
  name: file.name,
  size: file.size,
  type: file.type,
  searchQuery: "поисковый запрос"
})
```

### 🔍 **searchInDocument(documentId, query)**
Поиск в документе

```javascript
const searchResults = await searchInDocument("doc123", "текст для поиска")
// Возвращает: { matches: [...], processing_time: "0.5s" }
```

### 📋 **getAnalysisResults(documentId)**
Получение результатов анализа

```javascript
const results = await getAnalysisResults("doc123")
// Возвращает массив результатов анализа
```

---

## 🎯 Примеры использования

### Пример 1: Полный цикл работы с файлом
```javascript
const handleFileProcess = async (file) => {
  try {
    // 1. Загружаем файл
    setIsLoading(true)
    const uploadResult = await uploadFile(file)
    const documentId = uploadResult.document_id
    
    // 2. Анализируем документ
    const analysis = await analyzeDocument({
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // 3. Обновляем UI с результатами
    addApiDataObject({
      "Document ID": documentId,
      "Analysis Status": "Complete",
      "Upload Time": new Date().toLocaleTimeString()
    })
    
    // 4. Добавляем результаты анализа как сообщения
    if (analysis.results) {
      analysis.results.forEach(result => {
        addMessage(result.text, result.confidence)
      })
    }
    
  } catch (error) {
    console.error('Ошибка обработки файла:', error)
    addMessage(`Ошибка: ${error.message}`, 0.1)
  } finally {
    setIsLoading(false)
  }
}
```

### Пример 2: Поиск с обновлением UI
```javascript
const handleSearchWithUI = async (query) => {
  if (!query.trim() || !documentId) return
  
  setIsLoading(true)
  try {
    const results = await searchInDocument(documentId, query)
    
    // Обновляем Additional Data
    addApiDataObject({
      "Last Search": query,
      "Matches Found": results.matches?.length || 0,
      "Search Time": new Date().toLocaleTimeString()
    })
    
    // Добавляем результаты как сообщения
    if (results.matches) {
      results.matches.forEach(match => {
        addMessage(match.text, match.confidence)
      })
    }
    
  } catch (error) {
    addMessage(`Поиск не удался: ${error.message}`, 0.1)
  } finally {
    setIsLoading(false)
  }
}
```

---

## ❌ Обработка ошибок

### Встроенная функция обработки ошибок:
```javascript
import { handleApiError } from './api.js'

try {
  const result = await searchInDocument(id, query)
} catch (error) {
  const friendlyMessage = handleApiError(error)
  console.log(friendlyMessage) // "Сетевая ошибка. Проверьте подключение."
}
```

### Типы ошибок:
- **Сетевые ошибки** - проблемы с подключением
- **404** - ресурс не найден
- **401** - ошибка авторизации  
- **500** - ошибка сервера

---

## 🎨 Дополнительные возможности

### Установка Axios (опционально)
Для более продвинутых функций:

```powershell
npm install axios
```

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000
})

// Использование
const response = await api.post('/documents/analyze', data)
```

### Кастомный React Hook для API
```javascript
const useApiCall = (apiFunction) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (...args) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await apiFunction(...args)
      setData(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, execute }
}

// Использование
const { loading, error, execute } = useApiCall(searchInDocument)

const handleSearch = () => {
  execute(documentId, searchQuery)
}
```

---

## 🔧 Настройка в PowerShell

### Запуск development сервера:
```powershell
# Перейти в папку проекта
cd C:\Users\20msk\Documents\GitHub\Findi\frontend

# Запустить development сервер
npm run dev
```

### Проверка API подключения:
```powershell
# Проверить доступность backend
curl http://localhost:8000/api/health

# Или через PowerShell
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET
```

---

## 📁 Структура файлов

```
src/
├── api.js                    # API функции
├── PDFViewer.jsx            # Главный компонент с интеграцией
├── examples/
│   └── http-examples.js     # Дополнительные примеры
└── components/
    └── ...
```

---

## 🔑 Ключевые моменты

1. **Всегда обрабатывайте ошибки** - используйте try/catch
2. **Показывайте индикаторы загрузки** - используйте состояние `isLoading`
3. **Проверяйте доступность backend** - перед запросами
4. **Используйте TypeScript** - для лучшей типизации (опционально)
5. **Кэшируйте результаты** - для улучшения производительности

---

## 📞 Дополнительная помощь

- **Файл с примерами**: `src/examples/http-examples.js`
- **API конфигурация**: `src/api.js`
- **Основной компонент**: `src/PDFViewer.jsx`

**Успешной интеграции! 🚀** 