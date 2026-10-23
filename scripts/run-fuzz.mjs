/**
 * Долгий прогон фаззинга XSS (build/tests/fuzz): `npm run test:fuzz -- --iterations=50000`.
 * Обычный `npm run test:unit` гоняет те же файлы с малым числом итераций; здесь число задаётся флагом.
 *
 * Флаги:
 *   --iterations=<n>    базовое число итераций цели (по умолчанию 5000; цели берут долю по весу, у sanitizeHtml — вдвое больше);
 *   --seed=<n>          зерно запуска (по умолчанию из fuzzRunner.ts); итерация воспроизводится по зерну, цели и номеру;
 *   --target=<текст>    только цели, в имени которых есть текст (`--target=sanitizeHtml`);
 *   --only=<цель>:<n>   повтор одной итерации: `--only=BaseMarkdown:1234`;
 *   --report=<файл>     дописывает сводку по целям в файл.
 * Код выхода — как у vitest: 0, если нарушений нет.
 */

import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const DEFAULT_ITERATIONS = 5000
const ENVIRONMENT = { iterations: 'FUZZ_ITERATIONS', seed: 'FUZZ_SEED', target: 'FUZZ_TARGET', only: 'FUZZ_ONLY', report: 'FUZZ_REPORT' }

/** Значения флагов `--имя=значение` */
function readFlags(args) {
	const flags = {}
	for (const arg of args) {
		const match = /^--([a-z]+)=(.+)$/.exec(arg)
		if (!match || !(match[1] in ENVIRONMENT)) {
			process.stderr.write(`Неизвестный аргумент: ${arg}\n`)
			process.exit(2)
		}
		flags[match[1]] = match[2]
	}
	return flags
}

const flags = readFlags(process.argv.slice(2))
const env = {
	...process.env,
	NODE_OPTIONS: process.env.NODE_OPTIONS ?? '--max-old-space-size=8192',
	FUZZ_ITERATIONS: String(DEFAULT_ITERATIONS),
}
for (const [flag, name] of Object.entries(ENVIRONMENT)) if (flags[flag]) env[name] = flags[flag]

const vitest = join('node_modules', 'vitest', 'vitest.mjs')
const result = spawnSync(
	process.execPath,
	[
		vitest,
		'run',
		'--config',
		'build/tests/vitest.config.ts',
		'--project',
		'unit-integration',
		'--maxWorkers=2',
		'--testTimeout=14400000',
		'--hookTimeout=14400000',
		'build/tests/fuzz',
	],
	{ env, stdio: 'inherit' },
)
process.exitCode = result.status ?? 1
