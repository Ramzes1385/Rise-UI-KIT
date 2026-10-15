import { mount } from '@vue/test-utils'
import { useClickable } from '../useClickable'
import { defineComponent, h, nextTick, ref } from 'vue'

function mountClickable(listeners: Record<string, unknown>, isDisabled?: () => boolean) {
	const Child = defineComponent({
		emits: ['click'],
		setup(_, { emit }) {
			const { isClickable, clickableAttributes, handleKeydown } = useClickable({ event: 'click', isDisabled })
			return () =>
				h(
					'span',
					{
						...clickableAttributes.value,
						'data-clickable': String(isClickable.value),
						onClick: (event: MouseEvent) => emit('click', event),
						onKeydown: handleKeydown,
					},
					[h('i', { class: 'inner', tabindex: '-1' })],
				)
		},
	})
	return mount(defineComponent({ setup: () => () => h(Child, listeners) }), { attachTo: document.body })
}

function press(element: Element, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
	const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })
	element.dispatchEvent(event)
	return event
}

describe('useClickable', () => {
	it('без слушателя — без роли, фокуса и реакции на клавиши', () => {
		const wrapper = mountClickable({})
		const element = wrapper.get('span').element
		expect(element.getAttribute('data-clickable')).toBe('false')
		expect(element.hasAttribute('role')).toBe(false)
		expect(element.hasAttribute('tabindex')).toBe(false)
		expect(press(element, 'Enter').defaultPrevented).toBe(false)
		wrapper.unmount()
	})

	it('со слушателем — role="button", tabindex="0", Enter и Space кликают', () => {
		const onClick = vi.fn()
		const wrapper = mountClickable({ onClick })
		const element = wrapper.get('span').element
		expect(element.getAttribute('role')).toBe('button')
		expect(element.getAttribute('tabindex')).toBe('0')
		expect(element.hasAttribute('aria-disabled')).toBe(false)

		expect(press(element, 'Enter').defaultPrevented).toBe(true)
		expect(press(element, ' ').defaultPrevented).toBe(true)
		expect(onClick).toHaveBeenCalledTimes(2)
		expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent)
		wrapper.unmount()
	})

	it('пропускает другие клавиши, повтор и клавиши на вложенном элементе', () => {
		const onClick = vi.fn()
		const wrapper = mountClickable({ onClick })
		const element = wrapper.get('span').element
		expect(press(element, 'a').defaultPrevented).toBe(false)
		expect(press(element, 'Enter', { repeat: true }).defaultPrevented).toBe(true)
		expect(press(wrapper.get('.inner').element, 'Enter').defaultPrevented).toBe(false)
		expect(onClick).not.toHaveBeenCalled()
		wrapper.unmount()
	})

	it('выключенный — aria-disabled, без фокуса, клавиши не кликают', async () => {
		const onClick = vi.fn()
		const isDisabled = ref(true)
		const wrapper = mountClickable({ onClick }, () => isDisabled.value)
		const element = wrapper.get('span').element
		expect(element.getAttribute('role')).toBe('button')
		expect(element.getAttribute('aria-disabled')).toBe('true')
		expect(element.hasAttribute('tabindex')).toBe(false)
		expect(press(element, 'Enter').defaultPrevented).toBe(true)
		expect(onClick).not.toHaveBeenCalled()

		isDisabled.value = false
		await wrapper.vm.$nextTick()
		expect(element.getAttribute('tabindex')).toBe('0')
		expect(element.hasAttribute('aria-disabled')).toBe(false)
		wrapper.unmount()
	})

	it('событие с дефисом находит слушатель в обеих записях: onClickBadge и onClick-badge', () => {
		const Child = defineComponent({
			emits: ['click-badge'],
			setup() {
				const { isClickable } = useClickable({ event: 'click-badge' })
				return () => h('span', String(isClickable.value))
			},
		})
		const camel = mount(defineComponent({ setup: () => () => h(Child, { onClickBadge: vi.fn() }) }))
		const hyphen = mount(defineComponent({ setup: () => () => h(Child, { 'onClick-badge': vi.fn() }) }))
		const none = mount(defineComponent({ setup: () => () => h(Child) }))
		expect([camel.text(), hyphen.text(), none.text()]).toEqual(['true', 'true', 'false'])
	})

	it('слушатель клика появился и исчез после монтирования — элемент становится кнопкой и перестаёт ей быть', async () => {
		const hasListener = ref(false)
		const Child = defineComponent({
			emits: ['click'],
			setup(_, { emit }) {
				const { clickableAttributes, handleKeydown } = useClickable({ event: 'click' })
				return () =>
					h('span', {
						...clickableAttributes.value,
						onClick: (event: MouseEvent) => emit('click', event),
						onKeydown: handleKeydown,
					})
			},
		})
		const wrapper = mount(defineComponent({ setup: () => () => h(Child, hasListener.value ? { onClick: () => undefined } : {}) }), {
			attachTo: document.body,
		})
		const element = wrapper.get('span').element
		expect(element.getAttribute('role')).toBeNull()

		hasListener.value = true
		await nextTick()
		expect(element.getAttribute('role')).toBe('button')
		expect(element.getAttribute('tabindex')).toBe('0')
		expect(press(element, 'Enter').defaultPrevented).toBe(true)

		hasListener.value = false
		await nextTick()
		expect(element.getAttribute('role')).toBeNull()
		expect(press(element, 'Enter').defaultPrevented).toBe(false)
		wrapper.unmount()
	})
})
