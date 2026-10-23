import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { useColorPicker } from '../useColorPicker'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { UseColorPickerOptions, UseColorPickerReturn } from '../types/useColorPicker.types'

interface HostResult {
	api: UseColorPickerReturn
	value: { value: string }
	changes: string[]
}

function mountPicker(initial: string, extra: Partial<UseColorPickerOptions> = {}): HostResult {
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
				...extra,
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

		it('эмитит введённый HEX без искажения через округлённый HSV', () => {
			const { api, changes } = mountPicker('#000000')
			api.setHex('#123456')
			expect(changes).toEqual(['#123456'])
			expect(api.hex.value).toBe('#123456')
		})

		it('эмитит нормализованную запись введённого HEX', () => {
			const { api, changes } = mountPicker('#000000')
			api.setHex(' #ABC ')
			expect(changes).toEqual(['#aabbcc'])
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

		it('сохраняет точный внешний HEX, который не переживает round-trip через HSV', async () => {
			const { api, value } = mountPicker('#000000')
			value.value = '#abcdef'
			await nextTick()
			expect(api.hex.value).toBe('#abcdef')
		})
	})

	describe('форматы и прозрачность', () => {
		it('принимает rgba() и хранит прозрачность', () => {
			const { api } = mountPicker('rgba(255, 0, 0, 0.5)')
			expect(api.hex.value).toBe('#ff0000')
			expect(api.alpha.value).toBe(0.5)
			expect(api.value.value).toBe('#ff000080')
		})

		it('без hasAlpha входная прозрачность отбрасывается', () => {
			const { api, changes } = mountPicker('#ff000080', { hasAlpha: () => false })
			expect(api.alpha.value).toBe(1)
			api.setHex('rgba(0, 0, 255, 0.2)')
			expect(changes).toEqual(['#0000ff'])
		})

		it('эмитит значение в формате getFormat', () => {
			const { api, changes } = mountPicker('#ff0000', { getFormat: () => 'rgb' })
			api.setAlpha(0.25)
			api.setHex('hsl(120, 100%, 50%)')
			expect(changes).toEqual(['rgba(255, 0, 0, 0.25)', 'rgb(0, 255, 0)'])
		})

		it('setAlpha зажимает и округляет до сотых', () => {
			const { api } = mountPicker('#000000')
			api.setAlpha(1.4)
			expect(api.alpha.value).toBe(1)
			api.setAlpha(0.333)
			expect(api.alpha.value).toBe(0.33)
		})

		it('setRgb меняет только переданные каналы', () => {
			const { api, changes } = mountPicker('#102030')
			api.setRgb({ g: 255 })
			expect(api.rgb.value).toEqual({ r: 16, g: 255, b: 48 })
			expect(changes).toEqual(['#10ff30'])
		})

		it('setHsl меняет тон, насыщенность или светлоту', () => {
			const { api, changes } = mountPicker('#ff0000')
			expect(api.hsl.value).toEqual({ h: 0, s: 100, l: 50 })
			api.setHsl({ h: 240 })
			expect(changes).toEqual(['#0000ff'])
			expect(api.hsv.value).toEqual({ h: 240, s: 100, v: 100 })
		})

		it('внешнее значение с другой прозрачностью обновляет alpha', async () => {
			const { api, value } = mountPicker('#ff0000')
			value.value = '#ff000033'
			await nextTick()
			expect(api.alpha.value).toBe(0.2)
		})
	})
})
