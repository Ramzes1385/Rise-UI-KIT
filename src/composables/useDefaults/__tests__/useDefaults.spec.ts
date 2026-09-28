import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import { defineComponent, h, provide } from 'vue'
import { BaseButton } from '@components/BaseButton'
import { DEFAULTS_KEY, kitDefaults, useDefaults } from '../useDefaults'
import type { UiKitDefaults } from '../useDefaults.types'

// Значения по умолчанию подставляются в опции props так же, как их собирает компилятор
// из withDefaults(defineProps<…>(), kitDefaults(…))
const probeDefaults = kitDefaults('Probe', {
	size: 100,
	tone: 'neutral',
	flag: false,
	items: () => ['a'],
	format: (value: string) => value,
})

/** Компонент с kitDefaults, как в библиотеке */
const Probe = defineComponent({
	name: 'Probe',
	props: {
		size: { type: Number, default: probeDefaults.size },
		tone: { type: String, default: probeDefaults.tone },
		flag: { type: Boolean, default: probeDefaults.flag },
		items: { type: Array, default: probeDefaults.items },
		format: { type: Function, default: probeDefaults.format },
	},
	setup(props) {
		return () => h('output', JSON.stringify({ ...props, format: typeof props.format }))
	},
})

function renderWithDefaults(defaults: UiKitDefaults | null, props: Record<string, unknown> = {}) {
	return render(
		defineComponent({
			setup() {
				if (defaults) provide(DEFAULTS_KEY, defaults)
				return () => h(Probe, props)
			},
		}),
	)
}

function readProbe(): Record<string, unknown> {
	return JSON.parse(screen.getByRole('status').textContent ?? '{}')
}

describe('kitDefaults', () => {
	it('без настроек — собственные значения компонента', () => {
		renderWithDefaults(null)

		expect(readProbe()).toEqual({ size: 100, tone: 'neutral', flag: false, items: ['a'], format: 'function' })
	})

	it('значение компонента важнее global, переданный проп важнее обоих', () => {
		renderWithDefaults({ global: { size: 90, tone: 'global' }, Probe: { tone: 'own', flag: true } }, { size: 120 })

		expect(readProbe()).toMatchObject({ size: 120, tone: 'own', flag: true })
	})

	it('global применяется, если у компонента нет своего значения', () => {
		renderWithDefaults({ global: { size: 90 }, Other: { size: 50 } })

		expect(readProbe()).toMatchObject({ size: 90, tone: 'neutral' })
	})

	it('функции остаются как есть: фабрики и props-функции не переопределяются', () => {
		renderWithDefaults({ Probe: { items: ['b'], format: 'text' } })

		expect(readProbe()).toMatchObject({ items: ['a'], format: 'function' })
	})

	it('работает в компонентах библиотеки', () => {
		render(
			defineComponent({
				setup() {
					provide(DEFAULTS_KEY, { global: { sizeScale: 90 }, BaseButton: { variant: 'soft' } })
					return () => h(BaseButton, null, () => 'Сохранить')
				},
			}),
		)

		const button = screen.getByRole('button', { name: 'Сохранить' })
		expect(button).toHaveClass('base-button--soft')
		expect(button.style.getPropertyValue('--size-scale')).toBe('0.9')
	})
})

describe('useDefaults', () => {
	it('возвращает настройки плагина внутри компонента и null вне его', () => {
		let fromSetup: UiKitDefaults | null = null
		const defaults = { global: { sizeScale: 90 } }
		render(
			defineComponent({
				setup() {
					provide(DEFAULTS_KEY, defaults)
					return () =>
						h(
							defineComponent({
								setup() {
									fromSetup = useDefaults()
									return () => null
								},
							}),
						)
				},
			}),
		)

		expect(fromSetup).toBe(defaults)
		expect(useDefaults()).toBeNull()
	})
})
