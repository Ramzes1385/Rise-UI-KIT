/** Состав порции для проверок: что изменилось относительно базы, разделы и id историй, команды тестов с порогом покрытия из package.json */

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'

const USAGE = `node scripts/portion-scope.mjs [--base=feat/rise-v2] [--json] [BaseX | путь ...]
Без путей — изменения относительно базы: коммиты ветки, незакоммиченное и новые файлы в src, docs, scripts, build.`
const VITEST = 'npx cross-env CI=true vitest run --config build/tests/vitest.config.ts --project unit-integration'
const COMPONENT_THRESHOLDS =
	'--coverage.thresholds.lines=100 --coverage.thresholds.functions=100 --coverage.thresholds.statements=100 --coverage.thresholds.branches=0 --coverage.thresholds.perFile'
const UNIT_THRESHOLDS = '--coverage.thresholds.100 --coverage.thresholds.perFile'
const COMPONENT_PATH = /^src\/components\/(Base\w+)\//
const UNIT_PATH = /^src\/(composables|utils)\/[^/]+\/[^/]+\//

function parseArgs(argv) {
	const options = { base: 'feat/rise-v2', json: false, targets: [], help: false }
	for (const arg of argv) {
		if (arg.startsWith('--base=')) options.base = arg.slice('--base='.length)
		else if (arg === '--json') options.json = true
		else if (arg === '--help') options.help = true
		else options.targets.push(arg.replace(/\\/g, '/'))
	}
	return options
}

function git(args) {
	return execFileSync('git', args, {
		encoding: 'utf8',
		env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
		stdio: ['ignore', 'pipe', 'pipe'],
	})
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean)
}

function changedFiles(base) {
	const lock = git(['rev-parse', '--git-path', 'index.lock'])[0]
	if (existsSync(lock)) throw new Error(`Есть ${lock}: другой процесс git не закончил работу, состав не читаю`)
	const committed = git(['diff', '--name-only', `${base}...HEAD`])
	const uncommitted = git(['diff', '--name-only', 'HEAD'])
	const untracked = git(['ls-files', '--others', '--exclude-standard', '--', 'src', 'docs', 'scripts', 'build'])
	return [...new Set([...committed, ...uncommitted, ...untracked])].sort()
}

function targetFiles(targets) {
	return targets.map(target => {
		if (/^Base\w+$/.test(target)) return `src/components/${target}/`
		const isDir = existsSync(target) && statSync(target).isDirectory()
		return isDir && !target.endsWith('/') ? `${target}/` : target
	})
}

function coverageArgs(scriptName, flag) {
	const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
	const script = pkg.scripts[scriptName] ?? ''
	return [...script.matchAll(new RegExp(`--coverage\\.${flag}=(\\S+)`, 'g'))].map(match => match[1])
}

function storyMeta(component) {
	const file = `src/components/${component}/stories/${component}.stories.ts`
	const title = existsSync(file) ? readFileSync(file, 'utf8').match(/title:\s*'([^']+)'/)?.[1] : undefined
	if (!title) return { group: null, idPrefix: null }
	return { group: title.split('/')[0], idPrefix: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') }
}

function describeComponents(names) {
	const excluded = new Set(coverageArgs('test:components:coverage', 'exclude').map(glob => glob.split('/')[2]))
	return names.map(name => ({ name, ...storyMeta(name), threshold: !excluded.has(name) }))
}

function sourceFiles(dir) {
	if (!existsSync(dir)) return []
	return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
		const path = `${dir}/${entry.name}`
		if (entry.isDirectory()) return ['__tests__', 'types'].includes(entry.name) ? [] : sourceFiles(path)
		return /\.ts$/.test(entry.name) && !/\.(spec|test|d)\.ts$/.test(entry.name) && entry.name !== 'index.ts' ? [path] : []
	})
}

function describeUnits(dirs) {
	const excluded = new Set(['test:composables:coverage', 'test:utils:coverage'].flatMap(name => coverageArgs(name, 'exclude')))
	return dirs.map(dir => {
		const files = sourceFiles(dir)
		const covered = files.filter(file => !excluded.has(file))
		return { dir, kind: dir.split('/')[1], files: covered, excluded: files.filter(file => excluded.has(file)) }
	})
}

function classify(files) {
	const components = new Set()
	const units = new Set()
	const other = []
	for (const file of files) {
		const component = file.match(COMPONENT_PATH)?.[1]
		const unit = file.match(UNIT_PATH)?.[0]
		if (component) components.add(component)
		else if (unit) units.add(unit.slice(0, -1))
		else other.push(file)
	}
	const flags = {
		styles: files.some(file => file.startsWith('src/styles/')),
		locales: files.some(file => file.startsWith('src/locales/')),
	}
	return { components: describeComponents([...components].sort()), units: describeUnits([...units].sort()), other, flags }
}

function componentCoverageCommand(components) {
	if (!components.length) return null
	const extra = coverageArgs('test:components:coverage', 'include')
	const includes = components.flatMap(({ name }) => [
		`--coverage.include='src/components/${name}/**/*.vue'`,
		`--coverage.include='src/components/${name}/**/model/**/use*.ts'`,
		...extra.filter(path => path.startsWith(`src/components/${name}/`)).map(path => `--coverage.include='${path}'`),
	])
	const paths = components.map(({ name }) => `src/components/${name}`)
	return [VITEST, '--coverage', ...includes, '--coverage.reportsDirectory=coverage/portion', COMPONENT_THRESHOLDS, ...paths].join(' ')
}

function unitCoverageCommand(units) {
	const covered = units.filter(unit => unit.files.length)
	if (!covered.length) return null
	const includes = covered.flatMap(unit => unit.files.map(file => `--coverage.include='${file}'`))
	const paths = covered.map(unit => unit.dir)
	return [VITEST, '--coverage', ...includes, '--coverage.reportsDirectory=coverage/portion', UNIT_THRESHOLDS, ...paths].join(' ')
}

function commandsFor(scope) {
	const groups = [...new Set(scope.components.map(component => component.group).filter(Boolean))]
	const prefixes = scope.components.map(component => component.idPrefix).filter(Boolean)
	const unthresholded = [
		...scope.components.filter(component => !component.threshold).map(component => `src/components/${component.name}`),
		...scope.units.filter(unit => !unit.files.length).map(unit => unit.dir),
	]
	return [
		groups.length ? `npm run test:story-source -- --group=${groups.join(',')}` : null,
		scope.flags.styles ? 'npm run test:contrast' : null,
		componentCoverageCommand(scope.components.filter(component => component.threshold)),
		unitCoverageCommand(scope.units),
		unthresholded.length ? `${VITEST} --passWithNoTests ${unthresholded.join(' ')}` : null,
		prefixes.length
			? `node scripts/check-stories.mjs --url=http://localhost:6006 --filter='^(${prefixes.join('|')})--' --concurrency=2`
			: null,
	].filter(Boolean)
}

function printText({ base, files, scope, commands }) {
	const lines = [`База: ${base}. Файлов: ${files.length}.`, '', `Компоненты (${scope.components.length}):`]
	for (const component of scope.components) {
		const stories = component.group ? `${component.group}, истории ${component.idPrefix}--*` : 'историй нет'
		const coverage = component.threshold ? 'порог 100% строк, функций, операторов' : 'без порога (исключён в test:components:coverage)'
		lines.push(`  ${component.name} — ${stories}; ${coverage}`)
	}
	lines.push('', `Composables и утилиты (${scope.units.length}):`)
	for (const unit of scope.units) {
		const note = unit.excluded.length ? `; без порога: ${unit.excluded.join(', ')}` : ''
		lines.push(`  ${unit.dir} — файлов с порогом 100%: ${unit.files.length}${note}`)
	}
	lines.push('', `Прочее (${scope.other.length}):`, ...scope.other.map(file => `  ${file}`))
	if (scope.flags.styles) lines.push('', 'Менялись src/styles — нужен test:contrast.')
	if (scope.flags.locales) lines.push('', 'Менялись словари src/locales — test:l10n.')
	lines.push('', 'Команды по составу (общие проверки — в rise-checker):', ...commands.map(command => `  ${command}`))
	console.log(lines.join('\n'))
}

const options = parseArgs(process.argv.slice(2))
if (options.help) {
	console.log(USAGE)
} else {
	const files = options.targets.length ? targetFiles(options.targets) : changedFiles(options.base)
	const scope = classify(files)
	const report = { base: options.targets.length ? null : options.base, files, scope, commands: commandsFor(scope) }
	if (options.json) console.log(JSON.stringify(report, null, '\t'))
	else printText({ ...report, base: report.base ?? 'не используется — состав задан аргументами' })
}
