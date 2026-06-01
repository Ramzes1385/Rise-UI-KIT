/// <reference types="vitest/globals" />
/**
 * Глобальная настройка Vitest.
 * Очистка DOM и восстановление моков после каждого теста.
 * Матчеры jest-dom подключаются в каждом тест-файле индивидуально
 * через import '@testing-library/jest-dom/vitest'.
 */

import { cleanup } from '@testing-library/vue'

// Подавление неинформативных предупреждений в консоли тестов
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
	if (
		typeof args[0] === 'string' &&
		args[0].includes('decodeEntities option is passed but will be ignored in non-browser builds')
	) {
		return
	}
	originalWarn(...args)
}

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.clearAllMocks()
})

/** Мок ResizeObserver — отсутствует в jsdom, нужен для BaseSlider, BaseTree и др. */
globalThis.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

/** Мок getBoundingClientRect — отсутствует в jsdom, нужен для BaseTree и др. */
Element.prototype.getBoundingClientRect = () => ({
	width: 0,
	height: 0,
	top: 0,
	left: 0,
	bottom: 0,
	right: 0,
	x: 0,
	y: 0,
	toJSON: () => {},
})

/** Мок window.open — отсутствует в jsdom */
globalThis.window.open = vi.fn()

/** Мок window.prompt — отсутствует в jsdom, нужен для Storybook тестов */
globalThis.window.prompt = vi.fn(() => null)

/** Мок window.confirm — отсутствует в jsdom */
globalThis.window.confirm = vi.fn(() => true)
