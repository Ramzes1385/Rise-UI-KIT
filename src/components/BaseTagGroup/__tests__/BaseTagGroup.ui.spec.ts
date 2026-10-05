import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseTagGroup from '../ui/BaseTagGroup.vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import type { TagGroupItem } from '../types/BaseTagGroup.types'

const ITEMS: TagGroupItem[] = [
	{ value: 'a', label: 'A' },
	{ value: 'b', label: 'B' },
	{ value: 'c', label: 'C' },
]

function renderLive(initial: TagGroupItem[]) {
	const items = ref<TagGroupItem[]>(initial)
	const remove = (item: TagGroupItem) => (items.value = items.value.filter(entry => entry.value !== item.value))
	const utils = render(
		{
			components: { BaseTagGroup },
			setup: () => ({ items, remove }),
			template: '<BaseTagGroup :items="items" is-removable @remove="remove" />',
		},
		{ global: { stubs: { TransitionGroup: false } } },
	)
	return { ...utils, items }
}

describe('BaseTagGroup: проп ui', () => {
	it('без ui — класс кита у группы и класс части tag у каждой метки', () => {
		const { container } = render(BaseTagGroup, { props: { items: ITEMS } })
		const group = screen.getByRole('group')

		expect(group).toHaveAttribute('class', 'base-tag-group')
		const tags = container.querySelectorAll('.base-tag')
		expect(tags).toHaveLength(3)
		for (const tag of tags) expect(tag).toHaveClass('base-tag-group__tag')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const { container } = render(BaseTagGroup, {
			props: { items: ITEMS, customClass: { root: 'own-root', tag: 'own-tag' }, ui: { root: 'u-root', tag: 'u-tag' } },
		})

		expect(screen.getByRole('group')).toHaveClass('base-tag-group', 'u-root', 'own-root')
		expect(container.querySelector('.base-tag')).toHaveClass('base-tag', 'base-tag-group__tag', 'u-tag', 'own-tag')
	})

	it('классы из defaults.BaseTagGroup.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTagGroup, {
			props: { items: ITEMS, ui: { tag: 'own-tag' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTagGroup: { ui: { root: 'app-root', tag: 'app-tag' } } } })] },
		})

		expect(screen.getByRole('group')).toHaveClass('base-tag-group', 'app-root')
		expect(container.querySelector('.base-tag')).toHaveClass('base-tag-group__tag', 'app-tag', 'own-tag')
	})
})

describe('BaseTagGroup: движение', () => {
	it('новая метка появляется через переход base-tag-group__tag', async () => {
		const { container, items } = renderLive(ITEMS.slice(0, 2))

		items.value = [...items.value, ITEMS[2]]
		await nextTick()

		const added = [...container.querySelectorAll('.base-tag')].at(-1)
		expect(added).toHaveTextContent('C')
		expect(added).toHaveClass('base-tag-group__tag-enter-active')
		await waitFor(() => expect(added).not.toHaveClass('base-tag-group__tag-enter-active'))
	})

	it('удалённая метка уходит на своём месте, фокус — на соседку, а не на уходящую', async () => {
		const user = userEvent.setup()
		const { container } = renderLive(ITEMS)
		const leaving = container.querySelectorAll<HTMLElement>('.base-tag')[1]

		await user.click(screen.getByRole('button', { name: 'Удалить метку B' }))

		expect(leaving).toHaveClass('base-tag-group__tag-leave-active')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.top).toBe('0px')
		expect(screen.getByRole('button', { name: 'Удалить метку C' })).toHaveFocus()
		await waitFor(() => expect(leaving).not.toBeInTheDocument())
		expect(container.querySelectorAll('.base-tag')).toHaveLength(2)
	})

	it('удаление последней оставшейся — фокус на группу, уходящая метка не в счёт', async () => {
		const user = userEvent.setup()
		renderLive(ITEMS.slice(0, 1))

		await user.click(screen.getByRole('button', { name: 'Удалить метку A' }))

		expect(screen.getByRole('group', { name: 'Метки' })).toHaveFocus()
	})
})
