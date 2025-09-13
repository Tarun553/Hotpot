import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'

const useGetCurrentUser = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
        console.log(response.data)
        setUser(response.data.user)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading, error }
}

export default useGetCurrentUser