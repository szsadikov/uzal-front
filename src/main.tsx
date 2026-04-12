import '@/assets/styles/app.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

if (import.meta.env.DEV) {
	const { mockServer } = await import('./mock/mock')
	mockServer({ environment: 'development' })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)
