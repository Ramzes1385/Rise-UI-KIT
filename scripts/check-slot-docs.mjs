/**
 * Слоты в документации: у каждого слота компонента есть описание в таблице параметров Storybook. Описание — JSDoc
 * члена интерфейса слотов (`defineSlots<BaseXSlots>()`, `types/*.types.ts`; в Docs его переносит плагин
 * build/plugins/slotDocs.ts) или `slotArgType('…')` в `stories/argTypes.ts`. Ошибка: `<slot>` в шаблоне без
 * `defineSlots` или без объявления в интерфейсе, слот или шаблон имён без описания, динамический `<slot :name>` без
 * шаблона имён в интерфейсе (`` [name: `cell-${string}`] ``), слот в таблице, который компонент не показывает,
 * `Base<X>Slots` с членами в `types/<X>.types.ts` без `defineSlots` в `ui/<X>.vue`. Слоты,
 * скрытые `hiddenArgTypes(…)`, не проверяются.
 * `--component=BaseTable,BaseTabs` проверяет только эти компоненты.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { readComponentSlots } from '../build/plugins/slotDocs.ts'

const ROOT = join(import.meta.dirname, '..')
const COMPONENTS = join(ROOT, 'src/components')

function listFiles(dir) {
	if (!existsSync(dir)) return []
	return readdirSync(dir).flatMap(name => {
		const path = join(dir, name)
		return statSync(path).isDirectory() ? listFiles(path) : /\.(vue|ts)$/.test(name) ? [path] : []
	})
}

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Слот показывается компонентом: `<slot name>` в любом `.vue` папки `ui/`, обращение `slots.x` / `slots['x']` в `ui/`
 * и `model/` или проброс всех слотов (`v-for … in $slots`). Слот `default` без имени — только в самом компоненте: у
 * внутренних компонентов `ui/` он свой.
 */
function renderedSlots(dir, main) {
	const own = readFileSync(main, 'utf-8')
	const text = [...listFiles(join(dir, 'ui')), ...listFiles(join(dir, 'model'))].map(file => readFileSync(file, 'utf-8')).join('\n')
	const forwardsAll = /in\s+\$?slots\b|Object\.(keys|entries)\(\s*\$?slots/.test(text)
	return name =>
		forwardsAll ||
		new RegExp(
			`<slot\\b[^>]*\\bname="${escapeRegExp(name)}"|slots\\??\\.${escapeRegExp(name.replace(/-/g, '_'))}\\b|slots\\??\\.?\\[['"\`]${escapeRegExp(name)}['"\`]\\]`,
		).test(text) ||
		(name === 'default' && /<slot\b(?![^>]*\bname=)[^>]*>/.test(own))
}

/** Слоты, описанные или скрытые в `stories/argTypes.ts` */
function storySlots(dir) {
	const file = join(dir, 'stories', 'argTypes.ts')
	const text = existsSync(file) ? readFileSync(file, 'utf-8') : ''
	const described = new Set([...text.matchAll(/['"]?([\w-]+)['"]?\s*:\s*slotArgType\(/g)].map(match => match[1]))
	const hidden = new Set(
		[...text.matchAll(/hiddenArgTypes\(([^)]*)\)/g)].flatMap(match => [...match[1].matchAll(/['"]([\w-]+)['"]/g)].map(item => item[1])),
	)
	return { described, hidden }
}

/**
 * В `types/<X>.types.ts` у `<X>Slots` есть члены или родители: интерфейс с непустым телом или `extends`, тип-объект с
 * членами. Без `defineSlots` такой интерфейс к компоненту не привязан — экспортируемое имя обещает слоты, которых нет.
 */
function hasSlotMembers(dir, name) {
	const file = join(dir, 'types', `${name}.types.ts`)
	if (!existsSync(file)) return false
	const text = readFileSync(file, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
	const slots = escapeRegExp(`${name}Slots`)
	const declaration = new RegExp(`\\b(?:interface\\s+${slots}\\b([^{]*)|type\\s+${slots}\\s*=\\s*)\\{([^}]*)\\}`).exec(text)
	return Boolean(declaration && (/\bextends\b/.test(declaration[1] ?? '') || declaration[2].trim()))
}

function checkComponent(name) {
	const dir = join(COMPONENTS, name)
	const file = join(dir, 'ui', `${name}.vue`)
	if (!existsSync(file)) return { count: 0, problems: [] }
	const at = relative(ROOT, file)
	const result = readComponentSlots(file, readFileSync(file, 'utf-8'))
	const { described, hidden } = storySlots(dir)
	const problems = []
	if (!result.interfaceName) {
		const count = result.undeclared.length + result.dynamic.length
		if (count) problems.push(`${at}: слоты в шаблоне без defineSlots — описаний в Docs нет`)
		if (hasSlotMembers(dir, name))
			problems.push(
				`${at}: интерфейс слотов не подключён: defineSlots<${name}Slots>() или пустой тип ${name}Slots = Record<never, never>`,
			)
		return { count, problems }
	}
	if (!result.found) return { count: 0, problems: [`${at}: интерфейс ${result.interfaceName} не найден в types/`] }
	for (const slot of result.undeclared) problems.push(`${at}: слот «${slot}» есть в шаблоне, но не объявлен в ${result.interfaceName}`)
	for (const slot of [...result.slots, ...result.patterns]) {
		const isDocumented = slot.description || described.has(slot.name) || hidden.has(slot.name)
		if (!isDocumented && !result.undeclared.includes(slot.name))
			problems.push(`${at}: слот «${slot.name}» без описания (JSDoc в ${result.interfaceName})`)
	}
	const isRendered = renderedSlots(dir, file)
	for (const slot of result.hasDynamic ? [] : result.slots) {
		if (!hidden.has(slot.name) && !isRendered(slot.name))
			problems.push(`${at}: слот «${slot.name}» объявлен в ${result.interfaceName}, но компонент его не показывает`)
	}
	for (const expression of result.dynamic)
		problems.push(`${at}: динамический слот :name="${expression}" без шаблона имён в ${result.interfaceName}`)
	return { count: result.slots.length + result.patterns.length, problems }
}

const only = process.argv.find(arg => arg.startsWith('--component='))?.slice('--component='.length)
const names = readdirSync(COMPONENTS)
	.filter(name => statSync(join(COMPONENTS, name)).isDirectory())
	.filter(name => !only || only.split(',').includes(name))
	.sort()
let count = 0
const problems = []
for (const name of names) {
	const result = checkComponent(name)
	count += result.count
	problems.push(...result.problems)
}

if (problems.length) {
	console.error(`❌ Слоты без описания в документации (${problems.length}):\n`)
	for (const problem of problems) console.error(`  ${problem}`)
	process.exit(1)
}
console.log(`✅ Слоты описаны: ${count} в ${names.length} компонентах.`)
