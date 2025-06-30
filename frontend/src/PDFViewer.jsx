import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './PDFViewer.css'
// Импортируем API функции
import { 
  uploadFile, 
  analyzeDocument,
  searchInDocument, 
  searchPDF,
  getAnalysisResults, 
  handleApiError 
} from './api.js'

function PDFViewer() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [apiData, setApiData] = useState({})
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [documentId, setDocumentId] = useState(null)
  const [fileData, setFileData] = useState(location.state?.fileData || {
    name: 'sample.pdf',
    size: 1024,
    type: 'application/pdf',
    query: 'hello',
    content: "",
    url: null
  })

  // Загружаем файл при первом рендере
  useEffect(() => {
    console.log('PDFViewer useEffect - location.state:', location.state)
    console.log('PDFViewer useEffect - fileData:', fileData)
    
    // Проверяем разные способы передачи файла
    const file = fileData.file || location.state?.file || location.state?.fileData?.file
    
    if (file && !documentId) {
      console.log('Найден файл для загрузки:', file)
      
      // Если файл не сохранен в fileData, сохраняем его
      if (!fileData.file) {
        console.log('Сохраняем файл в fileData...')
        setFileData(prev => ({
          ...prev,
          file: file,
          name: file.name,
          size: file.size,
          type: file.type
        }))
      }
      
      handleFileUpload(file)
    } else {
      console.log('Файл не найден или уже загружен. file:', !!file, 'documentId:', documentId)
      
      // Если файл не найден, но есть содержимое, добавляем отладочную информацию
      if (!file && fileData.content) {
        console.log('Файл не найден, но содержимое есть:', fileData.content.length, 'символов')
        addApiDataObject({
          "File Content": "Loaded from state",
          "Content Length": fileData.content.length,
          "Status": "File object missing - please re-upload",
          "Timestamp": new Date().toLocaleTimeString()
        })
      } else if (!file && !fileData.content) {
        console.log('Ни файл, ни содержимое не найдены')
        addApiDataObject({
          "File Content": "Not loaded",
          "Status": "Please upload a file",
          "Timestamp": new Date().toLocaleTimeString()
        })
      }
    }
  }, [location.state, documentId])

  // Отображаем статус содержимого файла
  useEffect(() => {
    const hasFile = !!fileData.file
    const hasContent = !!fileData.content
    
    addApiDataObject({
      "File Object": hasFile ? "Available" : "Missing",
      "Content Status": hasContent ? "Available" : "Empty",
      "Content Length": hasContent ? fileData.content.length : 0,
      "Ready for Search": hasFile ? "Yes" : "No - please upload file",
      ...(hasContent && fileData.content.length < 200 ? {
        "Content Preview": fileData.content
      } : hasContent ? {
        "Content Preview": fileData.content.substring(0, 100) + "..."
      } : {})
    })
  }, [fileData.content, fileData.file])

  const formatFileSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB'
  }

  // Функция для чтения файла как UTF-8 текста
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          // Читаем файл как ArrayBuffer
          const arrayBuffer = event.target.result
          // Конвертируем в UTF-8 строку
          const uint8Array = new Uint8Array(arrayBuffer)
          const textDecoder = new TextDecoder('utf-8')
          const text = textDecoder.decode(uint8Array)
          resolve(text)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  // Функция для загрузки файла на сервер
  const handleFileUpload = async (file) => {
    setIsLoading(true)
    try {
      console.log('Читаем содержимое файла...')
      
      // Читаем содержимое файла как UTF-8 текст
      const fileContent = await readFileAsText(file)
      
      // Обновляем fileData с содержимым файла
      setFileData(prev => ({
        ...prev,
        name: file.name,
        size: file.size,
        type: file.type,
        content: fileContent,
        file: file
      }))
      
      console.log('Содержимое файла прочитано, длина:', fileContent.length)
      
      console.log('Загружаем файл на сервер...')
      const response = await uploadFile(file)
      setDocumentId(response.document_id)
      
      // Добавляем информацию о загрузке в Additional Data
      addApiDataObject({
        "Upload Status": "Success",
        "Document ID": response.document_id,
        "Content Length": fileContent.length,
        "Server Response": new Date().toLocaleTimeString()
      })
      
      console.log('Файл успешно загружен:', response)
    } catch (error) {
      const errorMessage = handleApiError(error)
      console.error('Ошибка загрузки файла:', errorMessage)
      
      // Добавляем информацию об ошибке
      addApiDataObject({
        "Upload Status": "Failed",
        "Error": errorMessage,
        "Timestamp": new Date().toLocaleTimeString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Обновленная функция поиска с реальными API вызовами
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    // Проверяем, есть ли файл для отправки
    if (!fileData.file) {
      console.error('Файл не найден для поиска')
      addMessage('Ошибка: файл не загружен. Пожалуйста, загрузите файл сначала.', 0.1)
      return
    }
    
    setIsLoading(true)
    try {
      console.log('Отправляем поисковый запрос на сервер...')
      console.log('fileData:', fileData)
      console.log('Данные для отправки:')
      console.log('- file object:', fileData.file)
      console.log('- file name:', fileData.file.name)
      console.log('- file size:', fileData.file.size)
      console.log('- file type:', fileData.file.type)
      console.log('- query:', searchQuery.trim())
      
      // Отправляем POST запрос на /api/v1/search/pdf_search как FormData
      const response = await searchPDF(
        fileData.file,          // file object
        searchQuery.trim()      // query
      )
      
      console.log('Результаты поиска получены:', response)
      
      // Добавляем информацию о поиске в Additional Data
      addApiDataObject({
        "Search Status": "Success",
        "Search Query": searchQuery.trim(),
        "Results Count": response.results?.length || 0,
        "Timestamp": new Date().toLocaleTimeString()
      })
      
      // Обрабатываем результаты поиска
      if (response.results && response.results.length > 0) {
        response.results.forEach(result => {
          addMessage(
            result.text || result.sentence || "Найденный фрагмент", 
            result.confidence || result.score || 0.5
          )
        })
      } else {
        addMessage("Совпадений не найдено", 0.0)
      }
      
    } catch (error) {
      const errorMessage = handleApiError(error)
      console.error('Ошибка поиска:', errorMessage)
      
      // Добавляем информацию об ошибке
      addApiDataObject({
        "Search Status": "Failed",
        "Error": errorMessage,
        "Search Query": searchQuery.trim(),
        "Timestamp": new Date().toLocaleTimeString()
      })
      
      // Добавляем сообщение об ошибке
      addMessage(`Ошибка поиска: ${errorMessage}`, 0.1)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для получения результатов анализа
  const fetchAnalysisResults = async () => {
    if (!documentId) return
    
    setIsLoading(true)
    try {
      console.log('Получаем результаты анализа...')
      const results = await getAnalysisResults(documentId)
      
      // Обновляем Additional Data
      addApiDataObject({
        "Analysis Status": "Retrieved",
        "Total Results": results.length,
        "Timestamp": new Date().toLocaleTimeString()
      })
      
      // Добавляем результаты как сообщения
      if (results.length > 0) {
        results.forEach(result => {
          addMessage(result.text, result.confidence)
        })
      }
      
      console.log('Результаты анализа получены:', results)
    } catch (error) {
      const errorMessage = handleApiError(error)
      console.error('Ошибка получения результатов:', errorMessage)
      
      addApiDataObject({
        "Analysis Status": "Failed",
        "Error": errorMessage,
        "Timestamp": new Date().toLocaleTimeString()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch()
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  // Функция для обработки выбора файла пользователем
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      console.log('Пользователь выбрал файл:', file)
      handleFileUpload(file)
    }
  }

  // Функция для программного добавления API данных
  const addApiData = (key, value) => {
    if (key && value) {
      setApiData(prev => ({
        ...prev,
        [key]: value
      }))
    }
  }

  // Функция для добавления объекта с данными
  const addApiDataObject = (dataObject) => {
    if (dataObject && typeof dataObject === 'object') {
      setApiData(prev => ({
        ...prev,
        ...dataObject
      }))
    }
  }

  // Функция для удаления данных по ключу
  const removeApiData = (key) => {
    setApiData(prev => {
      const newData = { ...prev }
      delete newData[key]
      return newData
    })
  }

  // Функция для очистки всех API данных
  const clearApiData = () => {
    setApiData({})
  }

  // Функция для добавления тестовых данных (для демонстрации)
  const addTestApiData = () => {
    const testData = {
      "Matches": "14",
      "Pages": "25", 
      "Confidence": "87%",
      "Document Type": "Research Paper",
      "Language": "English"
    }
    addApiDataObject(testData)
  }

  // Функция для добавления сообщения
  const addMessage = (sentence, confidence) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sentence: sentence,
      confidence: confidence,
      timestamp: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, newMessage])
  }

  // Функция для удаления сообщения
  const removeMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  // Функция для очистки всех сообщений
  const clearAllMessages = () => {
    setMessages([])
  }

  // Функция для добавления тестовых сообщений
  const addTestMessage = () => {
    const testSentences = [
      "This document contains important financial information.",
      "The analysis shows positive trends in market data.",
      "Key findings indicate significant improvements.",
      "Statistical evidence supports the conclusions.",
      "The methodology used is scientifically sound."
    ]
    const randomSentence = testSentences[Math.floor(Math.random() * testSentences.length)]
    const randomConfidence = Math.random() * 0.4 + 0.6 // 0.6 to 1.0
    addMessage(randomSentence, randomConfidence)
  }

  return (
    <div className="pdf-viewer-app">
      <div className="pdf-viewer-container">
        {/* Header */}
        <header className="pdf-header">
          <button className="back-button" onClick={handleBackToHome}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="m12 19-7-7 7-7" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Back to Findi
          </button>
          <h1 className="pdf-title">Document Viewer</h1>
          <div className="header-divider"></div>
        </header>

        {/* Main Content */}
        <main className="pdf-main-content">
          {/* Left Sidebar */}
          <aside className="pdf-sidebar">
            {/* File Information */}
            <div className="file-info-container">
              <h3>Document Information</h3>
              <div className="file-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{fileData.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{formatFileSize(fileData.size)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">PDF Document</span>
                </div>
              </div>
            </div>

            <div className="sidebar-divider"></div>

            {/* API Data Container */}
            <div className="api-data-container">
              <div className="api-data-header">
                <h3>Additional Data</h3>
              </div>

              {/* API Controls Section */}
              <div className="api-data-controls">
                {/* Status Indicator */}
                {isLoading && (
                  <div className="loading-indicator">
                    <div className="loading-spinner"></div>
                    <span>Loading...</span>
                  </div>
                )}
                
                {/* API Control Buttons */}
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.txt,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <button 
                  className="fetch-analysis-btn"
                  onClick={() => document.getElementById('file-upload').click()}
                  disabled={isLoading}
                  title="Select and upload a file"
                >
                  📁 Upload File
                </button>
                <button 
                  className="fetch-analysis-btn"
                  onClick={fetchAnalysisResults}
                  disabled={!documentId || isLoading}
                  title="Fetch analysis results from server"
                >
                  📊 Analysis
                </button>
              </div>

              {/* Display existing data */}
              <div className="api-data-list">
                {Object.entries(apiData).map(([key, value]) => (
                  <div key={key} className="api-data-item">
                    <div className="api-data-content">
                      <span className="api-key">{key}:</span>
                      <span className="api-value">{value}</span>
                    </div>
                    <button 
                      className="remove-data-btn"
                      onClick={() => removeApiData(key)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Object.keys(apiData).length === 0 && (
                  <div className="no-data-message">
                    <p className="no-data-text">No additional data</p>
                    <p className="no-data-hint">Data will appear after search</p>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* PDF Display Area */}
          <div className="pdf-display-area">
            {fileData.url ? (
              <iframe
                src={fileData.url}
                className="pdf-iframe"
                title="PDF Document"
              />
            ) : (
              <div className="pdf-placeholder">
                <div className="placeholder-content">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <h3>PDF Preview</h3>
                  <p>File: {fileData.name}</p>
                  <p className="placeholder-note">
                    PDF viewer will be displayed here when file is selected
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Messages Container */}
          <aside className="messages-sidebar">
            <div className="messages-container">
              <div className="messages-header">
                <h3>Analysis Results</h3>
              </div>

              <div className="messages-list">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No analysis results yet</p>
                    <p className="no-messages-hint">Search the document to see results here</p>
                  </div>
                ) : (
                  messages.map(message => (
                    <div key={message.id} className="message-block">
                      <div className="message-content">
                        <p className="message-sentence">{message.sentence}</p>
                        <div className="message-meta">
                          <div className="confidence-container">
                            <span className="confidence-label">Confidence:</span>
                            <span className={`confidence-value ${getConfidenceClass(message.confidence)}`}>
                              {(message.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <span className="message-timestamp">{message.timestamp}</span>
                        </div>
                      </div>
                      <button 
                        className="remove-message-btn"
                        onClick={() => removeMessage(message.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </main>

        {/* Search Section at Bottom */}
        <footer className="pdf-search-footer">
          <div className="footer-divider"></div>
          <div className="search-container">
            <div className={`search-input-wrapper ${isSearchFocused ? 'focused' : ''}`}>
              <div className="search-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search in document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery && (
                <button 
                  className="clear-input-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            <button 
              className={`search-button ${!searchQuery.trim() || isLoading ? 'disabled' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <div className="button-spinner"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <span>Search</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Helper function to get confidence class
function getConfidenceClass(confidence) {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

export default PDFViewer 