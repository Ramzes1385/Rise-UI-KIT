import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useTriggerAttributes } from './useTriggerAttributes'
import type { TriggerAttributes } from './useTriggerAttributes'

function mountTrigger(attributes: () => TriggerAttributes, content: () => ReturnType<typeof h>[], withId = true) {
	let api!: ReturnType<typeof useTriggerAttributes>
	const container = ref<HTMLElement | null>(null)
	const utils = render(
		defineComponent({
			setup() {
				api = useTriggerAttributes(() => container.value, attributes, { withId })
				return () => h('span', { ref: container }, content())
			},
		}),
	)
	return { ...utils, api: () => api, container }
}

describe('useTriggerAttributes', () => {
	it('ставит атрибуты на первый фокусируемый элемент, снимает undefined, даёт id и снимает всё при размонтировании', async () => {
		const isOpen = ref(false)
		const { container, unmount, api } = mountTrigger(
			() => ({ 'aria-expanded': String(isOpen.value), 'aria-controls': isOpen.value ? 'panel' : undefined }),
			() => [h('span', 'Иконка'), h('button', { type: 'button' }, 'Меню')],
		)
		const button = container.value?.querySelector('button') as HTMLButtonElement
		expect(button).toHaveAttribute('aria-expanded', 'false')
		expect(button).not.toHaveAttribute('aria-controls')
		expect(api().triggerId.value).toBe(button.id)
		expect(api().getTrigger()).toBe(button)

		isOpen.value = true
		await nextTick()
		expect(button).toHaveAttribute('aria-controls', 'panel')

		unmount()
		expect(button).not.toHaveAttribute('aria-expanded')
		expect(button).not.toHaveAttribute('id')
	})

	it('свой id элемента сохраняется; без фокусируемого — первый дочерний элемент', () => {
		const { container, api } = mountTrigger(
			() => ({ 'aria-haspopup': 'dialog' }),
			() => [h('img', { id: 'avatar', alt: 'Аватар' })],
		)
		const image = container.value?.querySelector('img') as HTMLImageElement
		expect(image).toHaveAttribute('aria-haspopup', 'dialog')
		expect(api().triggerId.value).toBe('avatar')
	})

	it('aria-describedby — список: свой id добавляется и убирается, чужие остаются', async () => {
		const isVisible = ref(true)
		const { container, api } = mountTrigger(
			() => ({ 'aria-describedby': isVisible.value ? 'tip' : undefined }),
			() => [h('button', { type: 'button', 'aria-describedby': 'hint' }, 'Сохранить')],
		)
		const button = container.value?.querySelector('button') as HTMLButtonElement
		expect(button.getAttribute('aria-describedby')).toBe('hint tip')

		isVisible.value = false
		await nextTick()
		expect(button.getAttribute('aria-describedby')).toBe('hint')
		expect(api().triggerId.value).toBe(button.id)
	})

	it('смена элемента-триггера переносит атрибуты; пустой контейнер — без триггера', async () => {
		const variant = ref<'a' | 'b' | 'none'>('a')
		const { container, api } = mountTrigger(
			() => ({ 'aria-describedby': 'tip', 'aria-expanded': 'true' }),
			() => (variant.value === 'none' ? [] : [h('button', { key: variant.value, type: 'button' }, variant.value)]),
		)
		const first = container.value?.querySelector('button') as HTMLButtonElement
		expect(first).toHaveAttribute('aria-expanded', 'true')

		variant.value = 'b'
		await nextTick()
		const second = container.value?.querySelector('button') as HTMLButtonElement
		expect(second).not.toBe(first)
		expect(second).toHaveAttribute('aria-describedby', 'tip')

		variant.value = 'none'
		await nextTick()
		expect(api().getTrigger()).toBeNull()
		expect(api().triggerId.value).toBeUndefined()
	})

	it('без withId id не добавляется', () => {
		const { container, api } = mountTrigger(
			() => ({ 'aria-describedby': 'tip' }),
			() => [h('button', { type: 'button' }, 'Сохранить')],
			false,
		)
		expect(container.value?.querySelector('button')).not.toHaveAttribute('id')
		expect(api().triggerId.value).toBeUndefined()
	})

	it('без контейнера триггера нет', () => {
		let api!: ReturnType<typeof useTriggerAttributes>
		render(
			defineComponent({
				setup() {
					api = useTriggerAttributes(() => null, () => ({ 'aria-expanded': 'false' }))
					return () => h('div')
				},
			}),
		)
		expect(api.getTrigger()).toBeNull()
		expect(api.triggerId.value).toBeUndefined()
	})
})
