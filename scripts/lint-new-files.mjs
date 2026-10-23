/** Новые .ts и .vue в src проверяются без предупреждений: новый код сразу пишется в пороги «чистого кода» */

import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const added = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=AC'], { encoding: 'utf8' })
	.split('\n')
	.filter(file => /^src\/.+\.(ts|vue)$/.test(file) && !file.endsWith('.d.ts'))

if (added.length) {
	try {
		execFileSync(process.execPath, [join('node_modules', 'eslint', 'bin', 'eslint.js'), '--max-warnings=0', ...added], {
			stdio: 'inherit',
		})
	} catch {
		process.exitCode = 1
	}
}
