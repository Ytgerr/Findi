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

// Поиск в PDF документе
export const searchPDF = async (file, query) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('query', query)

  try {
    const response = await fetch(`${API_BASE_URL}/search/pdf_search`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
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

// Поиск в видео файлах
export const searchMP4 = async (file, query) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('query', query)

  try {
    const response = await fetch(`${API_BASE_URL}/search/mp4_search`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Video search failed: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Video search error:', error)
    throw error
  }
}

// Поиск в аудио файлах
export const searchMP3 = async (file, query) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('query', query)

  try {
    const response = await fetch(`${API_BASE_URL}/search/mp3_search`, {
      method: 'POST',
      headers: {
        'accept': 'application/json'
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Audio search failed: ${response.status} - ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Audio search error:', error)
    throw error
  }
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