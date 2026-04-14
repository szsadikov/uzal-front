import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'
import eslint from 'vite-plugin-eslint2'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const worktreeRoot = process.cwd()

	console.log('VITE_API_SERVER_URL:---', env.VITE_API_SERVER_URL)
	console.log('VITE ROOT (worktree):', worktreeRoot)

	return {
		root: worktreeRoot,
		base: process.env.NODE_ENV === 'production' ? '/uzal-front/' : '/',
		server: {
			port: 3000
			// proxy: {
			// 	'/api/v1': {
			// 		target: env.VITE_API_SERVER_URL,
			// 		changeOrigin: true,
			// 		secure: false
			// 	}
			// }
		},
		plugins: [
			eslint(),
			dynamicImport(),
			react({
				babel: {
					plugins: ['babel-plugin-macros']
				}
			})
		],

		assetsInclude: ['**/*.md'],
		resolve: {
			alias: {
				'@': path.join(worktreeRoot, 'src')
			}
		},
		build: {
			outDir: 'build'
		}
	}
})
