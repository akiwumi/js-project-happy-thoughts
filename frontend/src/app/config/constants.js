const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim()
const fallbackLocalUrl = 'http://localhost:3001'

const normalizeBaseUrl = (url) => url.replace(/\/+$/, '')

export const API_BASE_URL = normalizeBaseUrl(rawApiBaseUrl || fallbackLocalUrl)
export const SOCKET_URL = normalizeBaseUrl(import.meta.env.VITE_SOCKET_URL?.trim() || API_BASE_URL)

export const HAS_PRODUCTION_API_URL = Boolean(rawApiBaseUrl)

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  NOT_FOUND: '*',
}

export const API_ENDPOINTS = {
  // Auth
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_ME: '/api/auth/me',
  
  // Chats
  CHATS: '/api/chats',
  SEARCH_USERS: '/api/chats/search-users',
  
  // Messages
  MESSAGES: '/api/messages',
}
