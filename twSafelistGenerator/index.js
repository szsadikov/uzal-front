// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require('tailwindcss/plugin')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const crypto = require('crypto')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const generator = require('./generator')

module.exports = plugin.withOptions(({ path = 'safelist.txt', patterns = [] }) => ({ theme }) => {
	const safeList = generator(theme)(patterns).join('\n')
	const currentSafeList = fs.readFileSync(path).toString()

	const hash = crypto.createHash('md5').update(JSON.stringify(safeList)).digest('hex')
	const prevHash = crypto.createHash('md5').update(JSON.stringify(currentSafeList)).digest('hex')

	if (hash !== prevHash) {
		return fs.writeFileSync(path, safeList)
	}
})
