import '@testing-library/jest-dom/vitest'
import { createApp } from 'vue'
import { createIconPlugin } from './iconPlugin'

describe('createIconPlugin', () => {
	it('возвращает объект с методом install', () => {
		const plugin = createIconPlugin()

		expect(plugin).toHaveProperty('install')
		expect(typeof plugin.install).toBe('function')
	})

	it('регистрирует компонент с именем по умолчанию BaseIcon', () => {
		const app = createApp({})
		app.use(createIconPlugin())

		const registered = app.component('BaseIcon')

		expect(registered).toBeDefined()
	})

	it('регистрирует компонент с кастомным именем', () => {
		const app = createApp({})
		app.use(createIconPlugin({ componentName: 'AppIcon' }))

		const registered = app.component('AppIcon')

		expect(registered).toBeDefined()
	})

	it('использует BaseIcon если options не передан', () => {
		const app = createApp({})
		app.use(createIconPlugin())

		const defaultComponent = app.component('BaseIcon')
		const customComponent = app.component('AppIcon')

		expect(defaultComponent).toBeDefined()
		expect(customComponent).toBeUndefined()
	})

	it('использует BaseIcon если componentName undefined', () => {
		const app = createApp({})
		app.use(createIconPlugin({ componentName: undefined }))

		const registered = app.component('BaseIcon')

		expect(registered).toBeDefined()
	})
})
