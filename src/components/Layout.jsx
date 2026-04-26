import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import TopNav from './TopNav'

function Layout() {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
