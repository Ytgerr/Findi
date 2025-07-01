import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import PDFViewer from './PDFViewer.jsx'
import VideoViewer from './VideoViewer.jsx'
import AudioViewer from './AudioViewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pdf-viewer" element={<PDFViewer />} />
        <Route path="/video-viewer" element={<VideoViewer />} />
        <Route path="/audio-viewer" element={<AudioViewer />} />
      </Routes>
    </Router>
  </StrictMode>,
)
