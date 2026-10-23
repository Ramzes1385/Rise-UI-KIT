import { mount } from '@vue/test-utils'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
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

	describe('родитель меняет набор переданных пропсов после монтирования', () => {
		function mountToggle() {
			const isPassed = ref(false)
			const hasListener = ref(false)
			let passed!: { prop: () => boolean; listener: () => boolean; resolved: () => boolean }
			const Child = defineComponent({
				props: { isOpen: { type: Boolean, default: undefined } },
				setup(props) {
					const { wasPropPassed, resolveBooleanPropDefault } = useExplicitPropDetection()
					const prop = computed(() => wasPropPassed('isOpen'))
					const listener = computed(() => wasPropPassed('onClick'))
					const resolved = computed(() => resolveBooleanPropDefault('isOpen', props.isOpen, true))
					passed = { prop: () => prop.value, listener: () => listener.value, resolved: () => resolved.value }
					return () => h('div')
				},
			})
			mount(
				defineComponent({
					setup: () => () =>
						h(Child, {
							...(isPassed.value ? { 'is-open': false } : {}),
							...(hasListener.value ? { onClick: () => undefined } : {}),
						}),
				}),
			)
			return { isPassed, hasListener, get: () => passed }
		}

		it('проп начали передавать — computed видит это, перестали — снова нет', async () => {
			const { isPassed, get } = mountToggle()
			expect(get().prop()).toBe(false)
			expect(get().resolved()).toBe(true)

			isPassed.value = true
			await nextTick()
			expect(get().prop()).toBe(true)
			expect(get().resolved()).toBe(false)

			isPassed.value = false
			await nextTick()
			expect(get().prop()).toBe(false)
			expect(get().resolved()).toBe(true)
		})

		it('слушатель добавили и убрали — computed следует за ним', async () => {
			const { hasListener, get } = mountToggle()
			expect(get().listener()).toBe(false)

			hasListener.value = true
			await nextTick()
			expect(get().listener()).toBe(true)

			hasListener.value = false
			await nextTick()
			expect(get().listener()).toBe(false)
		})

		it('родитель перестал передавать пропсы совсем (props вершины — null) — проп не передан', async () => {
			const isPassed = ref(true)
			let wasPassed!: () => boolean
			const Child = defineComponent({
				props: { isOpen: { type: Boolean, default: undefined } },
				setup() {
					const { wasPropPassed } = useExplicitPropDetection()
					const passed = computed(() => wasPropPassed('isOpen'))
					wasPassed = () => passed.value
					return () => h('div')
				},
			})
			mount(defineComponent({ setup: () => () => h(Child, isPassed.value ? { isOpen: true } : null) }))
			expect(wasPassed()).toBe(true)

			isPassed.value = false
			await nextTick()
			expect(wasPassed()).toBe(false)
		})
	})
})
