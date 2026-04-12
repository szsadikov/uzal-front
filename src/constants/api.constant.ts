export const TOKEN_TYPE = 'Bearer'
export const REQUEST_HEADER_AUTH_KEY = 'Authorization'
export const REQUEST_HEADER_LANG_KEY = 'Accept-Language'

export const IS_DEV = import.meta.env.NODE_ENV === 'development'
export const IS_PROD = import.meta.env.NODE_ENV === 'production'

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1'
// export const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL
// export const API_SERVER_URL = 'http://213.230.125.42:8000'
// export const API_SERVER_URL = 'https://doc-api.uzal.uz'
export const API_SERVER_URL = 'https://test-api.uzal.uz'
