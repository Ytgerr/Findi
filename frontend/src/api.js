// API конфигурация и функции для взаимодействия с backend

const API_BASE_URL = 'http://localhost:8001/api/v1' // Backend URL для Docker Compose

// Универсальная функция для fetch запросов
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return await response.text()
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// GET запросы
export const apiGet = (endpoint) => apiRequest(endpoint, { method: 'GET' })

// POST запросы
export const apiPost = (endpoint, data) => apiRequest(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
})

// PUT запросы
export const apiPut = (endpoint, data) => apiRequest(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
})

// DELETE запросы
export const apiDelete = (endpoint) => apiRequest(endpoint, { method: 'DELETE' })

// Специализированные функции для вашего приложения

// Анализ PDF документа
export const analyzeDocument = async (documentData) => {
  return await apiPost('/search/pdf_search', {
    file_name: documentData.name,
    file_content: documentData.content,
    file_type: documentData.type,
    query: documentData.query
  })
}

// Поиск в PDF документе
export const searchPDF = async (file, query) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('query', query)

  try {
    const response = await fetch(`${API_BASE_URL}/search/pdf_search`, {
      method: 'POST',
      body: formData // Не устанавливаем Content-Type для FormData
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Search error:', error)
    throw error
  }
}

// Поиск в документе
export const searchInDocument = async (documentId, query) => {
  return await apiPost('/documents/search', {
    document_id: documentId,
    query: query
  })
}

// Получение метаданных документа
export const getDocumentMetadata = async (documentId) => {
  return await apiGet(`/documents/${documentId}/metadata`)
}

// Загрузка файла
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch(`${API_BASE_URL}/search/pdf_search`, {
      method: 'POST',
      body: formData // Не устанавливаем Content-Type для FormData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// Получить результаты анализа
export const getAnalysisResults = async (documentId) => {
  return await apiGet(`/documents/${documentId}/analysis`)
}

// Сохранить дополнительные данные
export const saveAdditionalData = async (documentId, additionalData) => {
  return await apiPost(`/documents/${documentId}/metadata`, additionalData)
}

// Функция для обработки ошибок API
export const handleApiError = (error) => {
  if (error.name === 'TypeError') {
    return 'Сетевая ошибка. Проверьте подключение к интернету.'
  }
  
  if (error.message.includes('404')) {
    return 'Ресурс не найден.'
  }
  
  if (error.message.includes('500')) {
    return 'Ошибка сервера. Попробуйте позже.'
  }
  
  if (error.message.includes('401')) {
    return 'Ошибка авторизации.'
  }
  
  return error.message || 'Неизвестная ошибка'
} 