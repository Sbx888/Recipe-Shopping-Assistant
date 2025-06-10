import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000 // 60 second timeout
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    if (error.response) {
      // Server responded with error
      console.error('Server error:', error.response.data)
      if (error.response.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server:', error.request)
    } else {
      // Request setup error
      console.error('Request setup error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api 