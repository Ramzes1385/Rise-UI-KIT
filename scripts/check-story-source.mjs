/**
 * «Show code» — точный код превью (STORIES_GUIDE, раздел 8). История со своим `render` берёт код из
 * `storySource()` или `staticStorySource()`; если свой `render` у meta компонента, код для историй без своего
 * `render` задаёт `parameters.docs.source` в `stories/parameters.ts`. Код, написанный вручную (`source.code`),
 * не допускается: он расходится с превью. Состояние шаблона — `state` помощников, а не `ref` в константе модуля:
 * такое состояние общее для всех показов истории и в код не попадает. `--group=Element` проверяет один раздел.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import ts from 'typescript'

const ROOT = join(import.meta.dirname, '..')
const COMPONENTS = join(ROOT, 'src/components')
const SOURCE_HELPERS = new Set(['storySource', 'staticStorySource'])
const REACTIVE = new Set(['ref', 'shallowRef', 'reactive', 'computed'])

function parseArgs(argv) {
	const group = argv.find(arg => arg.startsWith('--group='))?.slice('--group='.length)
	return { groups: group ? group.split(',') : null }
}

function listFiles(dir) {
	if (!existsSync(dir)) return []
	return readdirSync(dir).flatMap(name => {
		const path = join(dir, name)
		return statSync(path).isDirectory() ? listFiles(path) : name.endsWith('.ts') ? [path] : []
	})
}

const sources = new Map()
function sourceFile(path) {
	if (!sources.has(path)) sources.set(path, ts.createSourceFile(path, readFileSync(path, 'utf-8'), ts.ScriptTarget.Latest, true))
	return sources.get(path)
}

function property(object, name) {
	const item = object?.properties?.find(entry => entry.name?.getText() === name)
	if (!item) return null
	return ts.isShorthandPropertyAssignment(item) ? item.name : (item.initializer ?? null)
}

const hasProperty = (object, name) => !!object?.properties?.some(item => item.name?.getText() === name)

const isHelperCall = node => !!node && ts.isCallExpression(node) && SOURCE_HELPERS.has(node.expression.getText())

/** Объявление переменной `name` в файле или в файле, из которого она импортирована */
function resolveIdentifier(file, name, depth = 0) {
	const source = sourceFile(file)
	for (const statement of source.statements) {
		if (ts.isVariableStatement(statement)) {
			const declaration = statement.declarationList.declarations.find(item => item.name.getText() === name)
			if (declaration) return declaration.initializer ?? null
		}
		if (depth < 3 && ts.isImportDeclaration(statement) && statement.moduleSpecifier.text.startsWith('.')) {
			const imported = statement.importClause?.namedBindings?.elements?.some(item => item.name.getText() === name)
			const target = resolve(dirname(file), `${statement.moduleSpecifier.text}.ts`)
			if (imported && existsSync(target)) return resolveIdentifier(target, name, depth + 1)
		}
	}
	return null
}

/** Код истории собран помощником: вызов `storySource()`/`staticStorySource()` или константа с ним */
function isExactSource(file, node) {
	if (isHelperCall(node)) return true
	return !!node && ts.isIdentifier(node) && isHelperCall(resolveIdentifier(file, node.getText()))
}

const docsSource = parameters => property(property(parameters, 'docs'), 'source')

function metaInfo(dir) {
	const metaFile = readdirSync(join(dir, 'stories')).find(name => name.endsWith('.stories.ts'))
	if (!metaFile) return null
	const source = sourceFile(join(dir, 'stories', metaFile))
	let meta = null
	const visit = node => {
		if (ts.isVariableDeclaration(node) && node.name.getText() === 'meta') meta = node.initializer
		ts.forEachChild(node, visit)
	}
	visit(source)
	while (meta && (ts.isSatisfiesExpression(meta) || ts.isAsExpression(meta))) meta = meta.expression
	const title = property(meta, 'title')?.text ?? ''
	const parametersFile = join(dir, 'stories', 'parameters.ts')
	const parameters = existsSync(parametersFile) ? resolveIdentifier(parametersFile, 'parameters') : null
	const unwrapped =
		parameters && (ts.isSatisfiesExpression(parameters) || ts.isAsExpression(parameters)) ? parameters.expression : parameters
	return {
		group: title.split('/')[0],
		hasRender: hasProperty(meta, 'render'),
		source: docsSource(unwrapped),
		parametersFile,
	}
}

function storiesOf(dir) {
	return listFiles(join(dir, 'stories')).flatMap(file =>
		sourceFile(file)
			.statements.filter(ts.isVariableStatement)
			.flatMap(statement => statement.declarationList.declarations)
			.filter(
				declaration =>
					/StoryObj/.test(declaration.type?.getText() ?? '') && ts.isObjectLiteralExpression(declaration.initializer ?? {}),
			)
			.map(declaration => ({ file, name: declaration.name.getText(), story: declaration.initializer })),
	)
}

/** `const x = ref(…)` на уровне модуля: состояние общее для всех показов истории */
function moduleRefs(file) {
	return sourceFile(file)
		.statements.filter(ts.isVariableStatement)
		.flatMap(statement => statement.declarationList.declarations)
		.filter(item => item.initializer && ts.isCallExpression(item.initializer) && REACTIVE.has(item.initializer.expression.getText()))
		.map(item => item.name.getText())
}

function checkComponent(dir, meta) {
	const problems = []
	const at = file => relative(ROOT, file)
	for (const file of listFiles(join(dir, 'stories'))) {
		for (const name of moduleRefs(file)) problems.push(`${at(file)}: ${name} — ref в константе модуля, нужен state`)
	}
	if (meta.source && !isExactSource(meta.parametersFile, meta.source))
		problems.push(`${at(meta.parametersFile)}: код meta написан вручную`)
	for (const { file, name, story } of storiesOf(dir)) {
		const source = docsSource(property(story, 'parameters'))
		if (source && !isExactSource(file, source)) problems.push(`${at(file)} ${name}: код написан вручную — нужен storySource()`)
		else if (!source && hasProperty(story, 'render')) problems.push(`${at(file)} ${name}: свой render без storySource()`)
		else if (!source && meta.hasRender && !meta.source)
			problems.push(`${at(file)} ${name}: render meta без docs.source в parameters.ts`)
	}
	return problems
}

const { groups } = parseArgs(process.argv.slice(2))
const problems = []
let checked = 0
for (const name of readdirSync(COMPONENTS).sort()) {
	const dir = join(COMPONENTS, name)
	if (!existsSync(join(dir, 'stories'))) continue
	const meta = metaInfo(dir)
	if (!meta || (groups && !groups.includes(meta.group))) continue
	checked++
	problems.push(...checkComponent(dir, meta))
}

if (problems.length) {
	console.error(`❌ «Show code» не совпадает с превью (${problems.length}):\n`)
	for (const problem of problems) console.error(`  ${problem}`)
	process.exit(1)
}
console.log(`✅ «Show code» — точный код превью: ${checked} компонентов${groups ? ` (${groups.join(', ')})` : ''}.`)
