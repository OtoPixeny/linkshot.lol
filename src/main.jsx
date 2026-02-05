import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './App.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_Y3V0ZS1jYXQtOTkuY2xlcmsuYWNjb3VudHMuZGV2JA"

console.log("Environment variables loaded:", {
  PUBLISHABLE_KEY: PUBLISHABLE_KEY ? "Found" : "Not found",
  allEnv: import.meta.env
})

if (!PUBLISHABLE_KEY) {
  console.warn("Clerk publishable key not found. Authentication features will be disabled.")
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
)
