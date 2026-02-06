import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/utils/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import FixedImage from '@/components/FixedImage'
import PopupModal from '@/components/PopupModal'

// Import pages (we'll create these next)
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import UserProfile from '@/pages/UserProfile'
import Top3 from '@/pages/Top3'

function App() {
  const location = useLocation()
  const isUserProfilePage = location.pathname !== '/' && !location.pathname.startsWith('/auth') && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/top3')
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
    >
      <div className="min-h-screen flex flex-col">
        {!isUserProfilePage && <FixedImage />}
        {!isUserProfilePage && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/*" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/manage" element={<Dashboard />} />
            <Route path="/:username" element={<UserProfile />} />
            <Route path="/top3" element={<Top3 />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
        <PopupModal />
      </div>
    </ThemeProvider>
  )
}

export default App
