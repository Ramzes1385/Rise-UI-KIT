/**
 * Unit-тесты для useColorPicker.
 * Покрывают: инициализацию, setHue, setSaturationValue, setHex,
 * клампинг, реактивный hueColor/markerStyle и внешнюю синхронизацию value.
 */

import '@testing-library/jest-dom/vitest'

import { defineComponent, h, nextTick, ref } from 'vue'
import { render } from '@testing-library/vue'

import { useColorPicker } from './useColorPicker'
import type { UseColorPickerReturn } from './useColorPicker.types'

interface HostResult {
	api: UseColorPickerReturn
	value: { value: string }
	changes: string[]
}

function mountPicker(initial: string): HostResult {
	const result = {} as HostResult
	const TestComponent = defineComponent({
		setup() {
			const value = ref(initial)
			const changes: string[] = []
			const api = useColorPicker({
				getValue: () => value.value,
				onChange: hex => {
					value.value = hex
					changes.push(hex)
				},
			})
			result.api = api
			result.value = value
			result.changes = changes
			return () => h('div')
		},
	})
	render(TestComponent)
	return result
}

describe('useColorPicker', () => {
	describe('инициализация', () => {
		it('парсит начальный HEX в HSV', () => {
			const { api } = mountPicker('#ff0000')
			expect(api.hsv.value).toEqual({ h: 0, s: 100, v: 100 })
		})

		it('использует чёрный для невалидного начального значения', () => {
			const { api } = mountPicker('garbage')
			expect(api.hex.value).toBe('#000000')
		})
	})

	describe('производные значения', () => {
		it('hex отражает текущее HSV', () => {
			const { api } = mountPicker('#3b82f6')
			expect(api.hex.value).toMatch(/^#[0-9a-f]{6}$/)
		})

		it('hueColor — чистый тон при полной насыщенности и яркости', () => {
			const { api } = mountPicker('#800000')
			expect(api.hueColor.value).toBe('#ff0000')
		})

		it('markerStyle отражает saturation/value в процентах', () => {
			const { api } = mountPicker('#ff0000')
			expect(api.markerStyle.value).toEqual({ left: '100%', top: '0%' })
		})
	})

	describe('setHue', () => {
		it('меняет тон и эмитит изменение', () => {
			const { api, changes } = mountPicker('#ff0000')
			api.setHue(120)
			expect(api.hsv.value.h).toBe(120)
			expect(changes).toHaveLength(1)
		})

		it('ограничивает тон сверху значением 360', () => {
			const { api } = mountPicker('#ff0000')
			api.setHue(999)
			expect(api.hsv.value.h).toBe(360)
		})

		it('ограничивает тон снизу нулём', () => {
			const { api } = mountPicker('#ff0000')
			api.setHue(-50)
			expect(api.hsv.value.h).toBe(0)
		})
	})

	describe('setSaturationValue', () => {
		it('устанавливает saturation/value по относительной точке', () => {
			const { api } = mountPicker('#ff0000')
			api.setSaturationValue({ x: 0.5, y: 0.25 })
			expect(api.hsv.value.s).toBe(50)
			expect(api.hsv.value.v).toBe(75)
		})

		it('ограничивает точку диапазоном [0, 1]', () => {
			const { api } = mountPicker('#ff0000')
			api.setSaturationValue({ x: 2, y: -1 })
			expect(api.hsv.value.s).toBe(100)
			expect(api.hsv.value.v).toBe(100)
		})
	})

	describe('setHex', () => {
		it('применяет валидный HEX', () => {
			const { api } = mountPicker('#000000')
			api.setHex('#00ff00')
			expect(api.hsv.value).toEqual({ h: 120, s: 100, v: 100 })
		})

		it('игнорирует невалидный HEX', () => {
			const { api, changes } = mountPicker('#000000')
			api.setHex('nope')
			expect(api.hex.value).toBe('#000000')
			expect(changes).toHaveLength(0)
		})
	})

	describe('внешняя синхронизация value', () => {
		it('обновляет HSV при внешнем изменении value', async () => {
			const { api, value } = mountPicker('#000000')
			value.value = '#0000ff'
			await nextTick()
			expect(api.hsv.value).toEqual({ h: 240, s: 100, v: 100 })
		})

		it('игнорирует невалидное внешнее значение', async () => {
			const { api, value } = mountPicker('#ff0000')
			value.value = 'invalid'
			await nextTick()
			expect(api.hsv.value).toEqual({ h: 0, s: 100, v: 100 })
		})

		it('не пересчитывает при совпадении с текущим hex', async () => {
			const { api, value } = mountPicker('#ff0000')
			const before = api.hsv.value
			value.value = '#ff0000'
			await nextTick()
			expect(api.hsv.value).toBe(before)
		})
	})
})
