import React from 'react'

const FixedImage = () => {
  return (
    <img
      src="https://i.imgur.com/dbGUUjh.png"
      alt="Fixed decoration"
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block xl:block"
      style={{
        height: 'auto',
        width: '60px',
        display:'none',
        pointerEvents: 'none'
      }}
    />
  )
}

export default FixedImage
