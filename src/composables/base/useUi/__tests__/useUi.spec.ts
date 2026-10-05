import { useUi } from '../useUi'
import { render } from '@testing-library/vue'
import type { UiProp } from '../types/useUi.types'
import { defineComponent, h, provide, reactive } from 'vue'
import { DEFAULTS_KEY } from '@composables/base/useDefaults'
import type { UiKitDefaults } from '@composables/base/useDefaults'

type Part = 'label' | 'icon'

function mountProbe(props: { ui?: UiProp<Part> }, defaults?: UiKitDefaults) {
	let ui: ReturnType<typeof useUi<Part>> | undefined
	const Probe = defineComponent({
		setup() {
			ui = useUi<Part>(props, 'base-date-picker')
			return () => h('div')
		},
	})
	render(
		defineComponent({
			setup() {
				if (defaults) provide(DEFAULTS_KEY, defaults)
				return () => h(Probe)
			},
		}),
	)
	return ui!
}

describe('useUi', () => {
	it('без ui отдаёт только БЭМ-класс части; root — класс блока', () => {
		const ui = mountProbe({})
		expect(ui('root')).toEqual(['base-date-picker'])
		expect(ui('label')).toEqual(['base-date-picker__label'])
	})

	it('добавляет классы экземпляра к классу кита', () => {
		const ui = mountProbe({ ui: { root: 'shadow-lg', icon: 'text-red' } })
		expect(ui('root')).toEqual(['base-date-picker', 'shadow-lg'])
		expect(ui('icon')).toEqual(['base-date-picker__icon', 'text-red'])
		expect(ui('label')).toEqual(['base-date-picker__label'])
	})

	it('склеивает глобальные классы плагина (по имени компонента из блока) и экземпляра, не заменяя', () => {
		const ui = mountProbe({ ui: { label: 'own' } }, { BaseDatePicker: { ui: { label: 'global', root: 'g-root' } } })
		expect(ui('label')).toEqual(['base-date-picker__label', 'global', 'own'])
		expect(ui('root')).toEqual(['base-date-picker', 'g-root'])
	})

	it('настройки другого компонента и без ui не влияют', () => {
		const ui = mountProbe({}, { BaseButton: { ui: { label: 'x' } }, BaseDatePicker: { size: 1 } })
		expect(ui('label')).toEqual(['base-date-picker__label'])
	})

	it('читает props.ui при каждом вызове — классы реактивны', () => {
		const props = reactive<{ ui?: UiProp<Part> }>({})
		const ui = mountProbe(props)
		props.ui = { label: 'later' }
		expect(ui('label')).toEqual(['base-date-picker__label', 'later'])
	})

	it('вне компонента (нет inject) работает только с props.ui', () => {
		const ui = useUi<Part>({ ui: { icon: 'i' } }, 'base-x')
		expect(ui('icon')).toEqual(['base-x__icon', 'i'])
	})
})
