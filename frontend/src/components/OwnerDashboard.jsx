import React from 'react'
import OwnerNavbar from './OwnerNav'

const OwnerDashboard = () => {
  return (
    <div>
      <OwnerNavbar />
      <div className="mt-20 p-4">
        <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
        {/* Add more dashboard content here */}
      </div>
    </div>
  )
}

export default OwnerDashboard