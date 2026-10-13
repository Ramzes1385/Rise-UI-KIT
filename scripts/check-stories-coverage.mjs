/** Поддерживает и старую структуру (BaseComponent/BaseComponent.stories.ts), и новую (BaseComponent/stories/BaseComponent.stories.ts). */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const COMPONENTS_DIR = join(ROOT, 'src/components')

function findStoryPath(componentDir, componentName) {
	const directPath = join(componentDir, `${componentName}.stories.ts`)
	const nestedPath = join(componentDir, 'stories', `${componentName}.stories.ts`)

	if (existsSync(directPath)) {
		return directPath
	}

	if (existsSync(nestedPath)) {
		return nestedPath
	}

	return null
}

/** История «Анимации» (решение research-motion): обязательна у каждого компонента — пропуск роняет проверку */
const ANIMATIONS_EXPORT = /export const Animations\b/

function reportAnimations(storyPaths) {
	const missing = storyPaths.filter(([, path]) => !ANIMATIONS_EXPORT.test(readFileSync(path, 'utf8'))).map(([name]) => name)
	if (missing.length === 0) {
		console.log('✅ История Animations есть у всех компонентов.\n')
		return true
	}
	console.log(`❌ Нет истории Animations («Анимации») у ${missing.length} из ${storyPaths.length} компонентов:`)
	console.log(`   ${missing.join(', ')}\n`)
	return false
}

function checkCoverage() {
	console.log('=== Запуск динамической проверки покрытия UI KIT файлами Stories ===\n')

	if (!existsSync(COMPONENTS_DIR)) {
		console.error(`❌ Ошибка: Директория компонентов не найдена: ${COMPONENTS_DIR}`)
		process.exit(1)
	}

	const items = readdirSync(COMPONENTS_DIR, { withFileTypes: true })

	const baseComponents = items
		.filter(item => item.isDirectory() && item.name.startsWith('Base'))
		.map(item => item.name)
		.sort()

	if (baseComponents.length === 0) {
		console.error('❌ Ошибка: Не найдено ни одного компонента Base* в src/components')
		process.exit(1)
	}

	const missingStories = []
	const coveredStories = []
	const storyPaths = []

	for (const component of baseComponents) {
		const componentDir = join(COMPONENTS_DIR, component)
		const storyPath = findStoryPath(componentDir, component)

		if (storyPath) {
			coveredStories.push(component)
			storyPaths.push([component, storyPath])
		} else {
			missingStories.push(component)
		}
	}

	console.log('=== Результаты проверки ===')
	console.log(`Всего обнаружено компонентов Base*: ${baseComponents.length}`)
	console.log(`Покрыто stories: ${coveredStories.length}`)
	console.log(`Отсутствуют stories: ${missingStories.length}\n`)
	const hasAllAnimations = reportAnimations(storyPaths)

	if (missingStories.length > 0) {
		console.log('❌ Следующие компоненты не имеют .stories.ts файлов:')
		missingStories.forEach(name => console.log(` - ${name}`))
		console.log('\nПроверка завершилась с ошибкой.')
		process.exit(1)
	}

	if (!hasAllAnimations) {
		console.log('Проверка завершилась с ошибкой.')
		process.exit(1)
	}

	console.log('✅ Отлично! Все компоненты UI KIT покрыты файлами stories.')
	process.exit(0)
}

checkCoverage()
