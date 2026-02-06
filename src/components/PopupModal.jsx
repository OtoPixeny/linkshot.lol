import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PopupModal = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Show popup after 20 seconds
    const initialTimer = setTimeout(() => {
      showPopup()
    }, 20000)

    // Set up recurring timer for every 5 minutes
    const recurringTimer = setInterval(() => {
      showPopup()
    }, 300000) // 5 minutes in milliseconds

    return () => {
      clearTimeout(initialTimer)
      clearInterval(recurringTimer)
    }
  }, [])

  const showPopup = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(true)
    }, 100)
  }

  const hidePopup = () => {
    setIsVisible(false)
    setTimeout(() => {
      setIsAnimating(false)
    }, 300)
  }

  const handleGoHome = () => {
    navigate('/')
    hidePopup()
  }

  const handleClose = () => {
    hidePopup()
  }

  if (!isAnimating) return null

  return (
    <div className="popup-modal-overlay">
      {/* Backdrop */}
      <div 
        className={`popup-modal-backdrop ${isVisible ? 'popup-backdrop-visible' : 'popup-backdrop-hidden'}`}
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`popup-modal-content ${isVisible ? 'popup-content-visible' : 'popup-content-hidden'}`}
      >

        {/* Image */}
        <div className="popup-modal-image-container">
          <img 
            src="https://i.imgur.com/BBcEFpP.png" 
            alt="Popup Image"
            className="popup-modal-image"
          />
        </div>

        {/* Buttons */}
        <div className="popup-modal-buttons">
          <button
            onClick={handleGoHome}
            className="popup-modal-button popup-modal-button-primary"
          >
            გადასვლა
          </button>
          <button
            onClick={handleClose}
            className="popup-modal-button popup-modal-button-secondary"
          >
            ჩახურვა
          </button>
        </div>
      </div>
    </div>
  )
}

export default PopupModal
