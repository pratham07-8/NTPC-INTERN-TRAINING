import React from 'react'
import LOGO from '../assets/ntpc-logo.png'

const Navbar = () => {
  return (
    <div className="overflow-hidden">
      <div className="mt-5 ml-5 flex justify-start items-centeR">
        <img src={LOGO} style={{ width: '100px', height: '80px' }} />
      </div>
    </div>
  )
}

export default Navbar

