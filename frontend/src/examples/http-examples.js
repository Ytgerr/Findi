// 🌐 HTTP Запросы в React - Примеры использования

// ==========================================
// 📡 1. FETCH API - Базовые примеры
// ==========================================

// GET запрос с параметрами
const fetchDocuments = async (page = 1, limit = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort: 'created_at',
    order: 'desc'
  })

  try {
    const response = await fetch(`/api/documents?${params}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Ошибка получения документов:', error)
    throw error
  }
}

// POST запрос с JSON данными
const createDocument = async (documentData) => {
  try {
    const response = await fetch('/api/documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(documentData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Ошибка создания документа')
    }

    return await response.json()
  } catch (error) {
    console.error('Ошибка создания документа:', error)
    throw error
  }
}

// PUT запрос для обновления
const updateDocument = async (id, updates) => {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error(`Ошибка обновления: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Ошибка обновления документа:', error)
    throw error
  }
}

// DELETE запрос
const deleteDocument = async (id) => {
  try {
    const response = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (!response.ok) {
      throw new Error(`Ошибка удаления: ${response.status}`)
    }

    return response.status === 204 // No Content
  } catch (error) {
    console.error('Ошибка удаления документа:', error)
    throw error
  }
}

// ==========================================
// 📦 2. AXIOS - Расширенные возможности
// ==========================================

import axios from 'axios'

// Создание экземпляра axios с конфигурацией
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Перехватчики запросов (interceptors)
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен к каждому запросу
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('Отправляем запрос:', config)
    return config
  },
  (error) => Promise.reject(error)
)

// Перехватчики ответов
apiClient.interceptors.response.use(
  (response) => {
    console.log('Получен ответ:', response)
    return response
  },
  (error) => {
    // Обработка ошибок авторизации
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    console.error('Ошибка API:', error)
    return Promise.reject(error)
  }
)

// Использование axios
const axiosExamples = {
  // GET запрос
  getDocuments: async () => {
    const response = await apiClient.get('/documents')
    return response.data
  },

  // POST запрос
  createDocument: async (data) => {
    const response = await apiClient.post('/documents', data)
    return response.data
  },

  // PUT запрос
  updateDocument: async (id, data) => {
    const response = await apiClient.put(`/documents/${id}`, data)
    return response.data
  },

  // DELETE запрос
  deleteDocument: async (id) => {
    await apiClient.delete(`/documents/${id}`)
  },

  // Запрос с параметрами
  searchDocuments: async (query, filters = {}) => {
    const response = await apiClient.get('/documents/search', {
      params: { query, ...filters }
    })
    return response.data
  },

  // Загрузка файла
  uploadFile: async (file, onProgress) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress?.(percentCompleted)
      }
    })
    return response.data
  }
}

// ==========================================
// 🔧 3. React Hook для API запросов
// ==========================================

import { useState, useEffect } from 'react'

// Кастомный хук для fetch запросов
export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url])

  return { data, loading, error }
}

// Использование хука
const DocumentList = () => {
  const { data, loading, error } = useFetch('/api/documents')

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  return (
    <div>
      {data?.map(doc => (
        <div key={doc.id}>{doc.name}</div>
      ))}
    </div>
  )
}

// ==========================================
// 🎯 4. Конкретные примеры для Findi
// ==========================================

// Интеграция с backend для поиска
export const searchAPI = {
  // Поиск в документе
  searchInDocument: async (documentId, query) => {
    const response = await fetch('/api/documents/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: documentId,
        query: query,
        options: {
          highlight: true,
          case_sensitive: false,
          max_results: 50
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    return await response.json()
  },

  // Анализ документа
  analyzeDocument: async (file) => {
    const formData = new FormData()
    formData.append('document', file)
    formData.append('analysis_type', 'full')

    const response = await fetch('/api/documents/analyze', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`)
    }

    return await response.json()
  },

  // Получение метаданных
  getMetadata: async (documentId) => {
    const response = await fetch(`/api/documents/${documentId}/metadata`)
    
    if (!response.ok) {
      throw new Error(`Failed to get metadata: ${response.status}`)
    }

    return await response.json()
  }
}

// ==========================================
// 🛠️ 5. Обработка ошибок и загрузки
// ==========================================

// Компонент с полным циклом API вызова
const DocumentSearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await searchAPI.searchInDocument(
        'document-id',
        searchQuery
      )
      
      setResults(response.results || [])
    } catch (err) {
      setError(err.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск в документе..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Поиск...' : 'Найти'}
      </button>

      {error && <div style={{color: 'red'}}>Ошибка: {error}</div>}
      
      <div>
        {results.map((result, index) => (
          <div key={index}>
            <p>{result.text}</p>
            <small>Совпадение: {(result.confidence * 100).toFixed(1)}%</small>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==========================================
// 🔄 6. Повторные запросы и кэширование
// ==========================================

// Функция с повторными попытками
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      
      if (response.ok) {
        return response
      }
      
      // Если это последняя попытка, выбрасываем ошибку
      if (i === maxRetries) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Ждем перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      
    } catch (error) {
      if (i === maxRetries) {
        throw error
      }
      
      // Ждем перед повторной попыткой
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}

// Простое кэширование результатов
const cache = new Map()

const fetchWithCache = async (url, options = {}) => {
  const cacheKey = url + JSON.stringify(options)
  
  if (cache.has(cacheKey)) {
    console.log('Возвращаем из кэша:', cacheKey)
    return cache.get(cacheKey)
  }
  
  const response = await fetch(url, options)
  const data = await response.json()
  
  cache.set(cacheKey, data)
  
  // Очищаем кэш через 5 минут
  setTimeout(() => {
    cache.delete(cacheKey)
  }, 5 * 60 * 1000)
  
  return data
}

// ==========================================
// 📱 7. Real-time обновления
// ==========================================

// WebSocket для real-time обновлений
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const ws = new WebSocket(url)
    
    ws.onopen = () => {
      setConnected(true)
      setSocket(ws)
    }
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      setMessages(prev => [...prev, message])
    }
    
    ws.onclose = () => {
      setConnected(false)
      setSocket(null)
    }
    
    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message) => {
    if (socket && connected) {
      socket.send(JSON.stringify(message))
    }
  }

  return { connected, messages, sendMessage }
}

// ==========================================
// 🏁 Экспорт всех функций
// ==========================================

export {
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  axiosExamples,
  DocumentList,
  DocumentSearchComponent,
  fetchWithRetry,
  fetchWithCache,
  useWebSocket
} 