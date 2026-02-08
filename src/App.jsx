import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/utils/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/Hero'
import FixedImage from '@/components/FixedImage'
import PopupModal from '@/components/PopupModal'
import { useSuccessSound } from '@/hooks/useSuccessSound'

// Import pages (we'll create these next)
import Home from '@/pages/Home'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import UserProfile from '@/pages/UserProfile'
import Top3 from '@/pages/Top3'

function App() {
  const location = useLocation()
  const { playClickSound } = useSuccessSound()
  const isUserProfilePage = location.pathname !== '/' && !location.pathname.startsWith('/auth') && !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/top3')
  
  // Add global click sound effect for buttons only
  React.useEffect(() => {
    const handleClick = (event) => {
      const target = event.target
      // Check if clicked element is a button or inside a button
      if (
        target.tagName === 'BUTTON' ||
        target.role === 'button' ||
        target.closest('button') ||
        target.closest('[role="button"]')
      ) {
        playClickSound()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [playClickSound])
  
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
        {!isUserProfilePage && <PopupModal />}
      </div>
    </ThemeProvider>
  )
}

export default App
