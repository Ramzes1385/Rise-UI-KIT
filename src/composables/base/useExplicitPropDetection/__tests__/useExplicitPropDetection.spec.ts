import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useExplicitPropDetection } from '../useExplicitPropDetection'
import type { UseExplicitPropDetectionReturn } from '../types/useExplicitPropDetection.types'

function mountWithProps(props: Record<string, unknown>): UseExplicitPropDetectionReturn {
	let detection!: UseExplicitPropDetectionReturn
	const Child = defineComponent({
		props: { isOpen: { type: Boolean, default: undefined }, label: { type: String, default: '' } },
		setup() {
			detection = useExplicitPropDetection()
			return () => h('div')
		},
	})
	mount(defineComponent({ setup: () => () => h(Child, props) }))
	return detection
}

describe('useExplicitPropDetection', () => {
	it('находит проп, переданный в camelCase', () => {
		const { wasPropPassed } = mountWithProps({ isOpen: true })
		expect(wasPropPassed('isOpen')).toBe(true)
		expect(wasPropPassed('label')).toBe(false)
	})

	it('находит проп, переданный в kebab-case', () => {
		const { wasPropPassed } = mountWithProps({ 'is-open': false })
		expect(wasPropPassed('isOpen')).toBe(true)
	})

	it('берёт переданное значение, а без него — значение по умолчанию', () => {
		const passed = mountWithProps({ isOpen: false })
		expect(passed.resolveBooleanPropDefault('isOpen', false, true)).toBe(false)
		expect(passed.resolveBooleanPropDefault('isOpen', undefined, true)).toBe(true)

		const notPassed = mountWithProps({})
		expect(notPassed.resolveBooleanPropDefault('isOpen', false, true)).toBe(true)
	})

	it('вне компонента считает, что пропсы не переданы', () => {
		const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()
		expect(wasPropPassed('isOpen')).toBe(false)
		expect(resolveBooleanPropDefault('isOpen', false, true)).toBe(true)
	})
})
