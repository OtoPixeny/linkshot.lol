"use client"

import { useState, useEffect } from "react"
import { Alert, AlertTitle } from "./alert"

export function AlertToaster() {
  const [alerts, setAlerts] = useState([])

  const addAlert = (alert) => {
    const id = Date.now()
    setAlerts(prev => [...prev, { ...alert, id }])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id))
    }, 5000)
  }

  // Make addAlert available globally
  useEffect(() => {
    window.showAlert = addAlert
    return () => {
      delete window.showAlert
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="animate-in slide-in-from-bottom-2 fade-in-0 duration-300"
        >
          <Alert variant={alert.type} className="min-w-[300px] max-w-[400px]">
            <AlertTitle>
              {alert.type === 'success' ? 'Success' : 
               alert.type === 'error' ? 'Error' : 
               alert.type === 'warning' ? 'Warning' : 'Info'} - {alert.message}
            </AlertTitle>
          </Alert>
        </div>
      ))}
    </div>
  )
}
