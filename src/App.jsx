import './App.css'
import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import EventDetailsPage from './pages/EventDetailsPage'
import EventFormPage from './pages/EventFormPage'
import EventsListPage from './pages/EventsListPage'
import HomePage from './pages/HomePage'
import NewsDetailsPage from './pages/NewsDetailsPage'
import NewsFormPage from './pages/NewsFormPage'
import NewsListPage from './pages/NewsListPage'
import NotFoundPage from './pages/NotFoundPage'
import { seedInitialDataIfEmpty } from './services/storageService'

function App() {
  useEffect(() => {
    seedInitialDataIfEmpty()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsListPage />} />
        <Route path="events/new" element={<EventFormPage mode="create" />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
        <Route path="events/:id/edit" element={<EventFormPage mode="edit" />} />
        <Route path="news" element={<NewsListPage />} />
        <Route path="news/new" element={<NewsFormPage mode="create" />} />
        <Route path="news/:id" element={<NewsDetailsPage />} />
        <Route path="news/:id/edit" element={<NewsFormPage mode="edit" />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
