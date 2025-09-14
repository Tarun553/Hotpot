import React from 'react'
import Navbar from './Navbar'
const UserDashboard = ({userData}) => {
    
  return (
    <div>
        <Navbar />
        <h1>Welcome {userData.fullName}</h1>
    </div>
  )
}

export default UserDashboard