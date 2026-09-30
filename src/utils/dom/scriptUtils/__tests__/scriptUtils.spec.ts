import '@testing-library/jest-dom/vitest'
import { forgetScript, loadScript } from '../scriptUtils'

const scripts = () => [...document.head.querySelectorAll('script')]

describe('scriptUtils', () => {
	afterEach(() => {
		for (const script of scripts()) forgetScript(script.src)
	})

	it('один тег на адрес; готовность — load', async () => {
		const first = loadScript('https://example.test/a.js', { attributes: { nonce: 'abc' } })
		const second = loadScript('https://example.test/a.js')
		expect(scripts()).toHaveLength(1)
		expect(scripts()[0]).toHaveAttribute('nonce', 'abc')
		expect(scripts()[0].async).toBe(true)
		scripts()[0].onload?.(new Event('load'))
		await expect(first).resolves.toBeUndefined()
		await expect(second).resolves.toBeUndefined()
	})

	it('готовность — вызов глобальной функции', async () => {
		const pending = loadScript('https://example.test/b.js', { callbackName: '__riseTestReady' })
		;(window as unknown as Record<string, () => void>).__riseTestReady()
		await expect(pending).resolves.toBeUndefined()
	})

	it('ошибка: тег удаляется, следующий вызов загружает заново', async () => {
		const failed = loadScript('https://example.test/c.js')
		scripts()[0].onerror?.(new Event('error'))
		await expect(failed).rejects.toThrow('Script: https://example.test/c.js')
		expect(scripts()).toHaveLength(0)

		void loadScript('https://example.test/c.js')
		expect(scripts()).toHaveLength(1)
	})

	it('forgetScript убирает только свой тег', () => {
		void loadScript('https://example.test/d.js')
		void loadScript('https://example.test/e.js')
		forgetScript('https://example.test/d.js')
		expect(scripts().map(script => script.src)).toEqual(['https://example.test/e.js'])
	})
})
