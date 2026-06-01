import '@testing-library/jest-dom/vitest'

import { useIcon } from './useIcon'

describe('useIcon', () => {
	it('возвращает spritePath', () => {
		const { spritePath } = useIcon()
		expect(spritePath).toBe('/icons.svg')
	})

	describe('getIconUrl', () => {
		it('строит URL иконки из имени', () => {
			const { getIconUrl } = useIcon()
			expect(getIconUrl('close')).toBe('/icons.svg#close')
		})

		it('строит URL для другого имени', () => {
			const { getIconUrl } = useIcon()
			expect(getIconUrl('menu')).toBe('/icons.svg#menu')
		})
	})

	describe('isIconExists', () => {
		it('возвращает true если иконка существует', () => {
			const { isIconExists } = useIcon()
			expect(isIconExists('close', ['close', 'menu'])).toBe(true)
		})

		it('возвращает false если иконка не существует', () => {
			const { isIconExists } = useIcon()
			expect(isIconExists('unknown', ['close', 'menu'])).toBe(false)
		})
	})

	describe('getIconNames', () => {
		it('возвращает пустой массив если спрайт не найден', () => {
			const { getIconNames } = useIcon()
			expect(getIconNames()).toEqual([])
		})

		it('возвращает имена иконок из спрайта', () => {
			// Создаём мок спрайта в DOM
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
			svg.setAttribute('href', '/icons.svg')

			const symbol1 = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
			symbol1.id = 'close'
			const symbol2 = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
			symbol2.id = 'menu'

			svg.appendChild(symbol1)
			svg.appendChild(symbol2)
			document.body.appendChild(svg)

			const { getIconNames } = useIcon()
			expect(getIconNames()).toEqual(['close', 'menu'])

			// Очистка
			document.body.removeChild(svg)
		})

		it('возвращает имена иконок из спрайта загруженного через link', () => {
			const link = document.createElement('link')
			link.setAttribute('href', '/icons.svg')

			document.body.appendChild(link)

			const { getIconNames } = useIcon()
			// link[href] найден, но link не содержит symbol — возвращается пустой массив
			expect(getIconNames()).toEqual([])

			// Очистка
			document.body.removeChild(link)
		})
	})

	it('возвращает объект со всеми утилитами для иконок', () => {
		const result = useIcon()
		expect(result).toHaveProperty('spritePath')
		expect(result).toHaveProperty('getIconUrl')
		expect(result).toHaveProperty('isIconExists')
		expect(result).toHaveProperty('getIconNames')
		expect(result.spritePath).toBe('/icons.svg')
		expect(result.getIconUrl).toBeTypeOf('function')
		expect(result.isIconExists).toBeTypeOf('function')
		expect(result.getIconNames).toBeTypeOf('function')
	})

	it('возвращает пустые строки для symbol без id', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svg.setAttribute('href', '/icons.svg')

		const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
		// id не установлен — будет пустая строка
		svg.appendChild(symbol)
		document.body.appendChild(svg)

		const { getIconNames } = useIcon()
		expect(getIconNames()).toEqual([''])

		document.body.removeChild(svg)
	})

	it('ищет спрайт только с правильным href', () => {
		const svgWrong = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svgWrong.setAttribute('href', '/other.svg')
		const symbolWrong = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
		symbolWrong.id = 'wrong'
		svgWrong.appendChild(symbolWrong)
		document.body.appendChild(svgWrong)

		const svgRight = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
		svgRight.setAttribute('href', '/icons.svg')
		const symbolRight = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
		symbolRight.id = 'close'
		svgRight.appendChild(symbolRight)
		document.body.appendChild(svgRight)

		const { getIconNames } = useIcon()
		expect(getIconNames()).toEqual(['close'])

		document.body.removeChild(svgWrong)
		document.body.removeChild(svgRight)
	})
})

import { createApp } from 'vue'
import { createIconPlugin } from './iconPlugin'

describe('createIconPlugin', () => {
	it('должен создавать плагин с методом install', () => {
		const plugin = createIconPlugin()
		expect(plugin).toHaveProperty('install')
		expect(plugin.install).toBeTypeOf('function')
	})

	it('должен регистрировать компонент с именем по умолчанию', () => {
		const app = createApp({})
		const plugin = createIconPlugin()
		app.use(plugin)

		expect(app.component('BaseIcon')).toBeDefined()
	})

	it('должен регистрировать компонент с именем по умолчанию при пустых опциях', () => {
		const app = createApp({})
		const plugin = createIconPlugin({})
		app.use(plugin)

		expect(app.component('BaseIcon')).toBeDefined()
	})

	it('должен регистрировать компонент с кастомным именем', () => {
		const app = createApp({})
		const plugin = createIconPlugin({ componentName: 'MyIcon' })
		app.use(plugin)

		expect(app.component('MyIcon')).toBeDefined()
	})
})
