import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseChecklist from '../ui/BaseChecklist.vue'
import { CHECKLIST_PARTS } from '../types/BaseChecklist.types'
import { render, screen, waitFor } from '@testing-library/vue'
import type { ChecklistItem } from '../types/BaseChecklist.types'

const ITEMS: ChecklistItem[] = [
	{ id: 'a', title: 'Первый', description: 'Пояснение', actionLabel: 'Сделать' },
	{ id: 'b', title: 'Второй' },
	{ id: 'c', title: 'Третий' },
]

const allUi = Object.fromEntries(['root', ...CHECKLIST_PARTS].map(part => [part, `u-${part}`]))

function renderLive(initial: ChecklistItem[], completed: string[] = []) {
	const items = ref<ChecklistItem[]>(initial)
	const done = ref<string[]>(completed)
	const utils = render(
		{
			components: { BaseChecklist },
			setup: () => ({ items, done }),
			template: '<BaseChecklist :items="items" v-model:completed="done" />',
		},
		{ global: { stubs: { TransitionGroup: false, Transition: false } } },
	)
	return { ...utils, items, done }
}

describe('BaseChecklist: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseChecklist, { props: { items: ITEMS } })

		expect(container.querySelector('.base-checklist__label')).toHaveAttribute('class', 'base-checklist__label')
		expect(container.querySelector('.base-checklist__list')).toHaveAttribute('class', 'base-checklist__list')
		expect(container.querySelector('.base-checklist__header')).toHaveAttribute('class', 'base-checklist__header')
		expect(container.querySelector('.base-progress')).toHaveClass('base-checklist__progress')
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseChecklist, {
			props: {
				items: ITEMS,
				completed: ['a', 'b', 'c'],
				variant: 'soft',
				customClass: { root: 'own-root', item: 'own-item' },
				ui: allUi,
			},
		})

		expect(container.querySelector('.base-checklist')).toHaveClass(
			'u-root',
			'base-checklist--soft',
			'base-checklist--complete',
			'own-root',
		)
		expect(container.querySelector('.base-checklist__item')).toHaveClass('u-item', 'own-item', 'base-checklist__item--done')
		for (const part of CHECKLIST_PARTS.filter(part => !['next', 'action'].includes(part)))
			expect(container.querySelector(`.base-checklist__${part}`)).toHaveClass(`u-${part}`)
	})

	it('части next и action получают классы у невыполненного шага', () => {
		const { container } = render(BaseChecklist, { props: { items: ITEMS, ui: { next: 'u-next', action: 'u-action' } } })

		expect(container.querySelector('.base-checklist__next')).toHaveClass('u-next')
		expect(container.querySelector('.base-checklist__action')).toHaveClass('base-button', 'u-action')
	})

	it('классы из defaults.BaseChecklist.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseChecklist, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseChecklist: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		expect(container.querySelector('.base-checklist')).toHaveClass('base-checklist', 'app-root')
		expect(container.querySelector('.base-checklist__label')).toHaveAttribute('class', 'base-checklist__label app-label own-label')
	})
})

describe('BaseChecklist: движение', () => {
	it('новый шаг появляется через переход base-checklist__item', async () => {
		const { container, items } = renderLive(ITEMS.slice(0, 2))

		items.value = [...items.value, ITEMS[2]!]
		await nextTick()

		const added = [...container.querySelectorAll('.base-checklist__item')].at(-1)
		expect(added).toHaveTextContent('Третий')
		expect(added).toHaveClass('base-checklist__item-enter-active')
		await waitFor(() => expect(added).not.toHaveClass('base-checklist__item-enter-active'))
	})

	it('убранный шаг уходит на своём месте и затем исчезает', async () => {
		const { container, items } = renderLive(ITEMS)
		const leaving = container.querySelectorAll<HTMLElement>('.base-checklist__item')[1]!

		items.value = items.value.filter(item => item.id !== 'b')
		await nextTick()

		expect(leaving).toHaveClass('base-checklist__item-leave-active')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
		await waitFor(() => expect(leaving).not.toBeInTheDocument())
		expect(container.querySelectorAll('.base-checklist__item')).toHaveLength(2)
	})

	it('отметка последнего шага — «Всё готово» появляется через переход, снятие — уходит', async () => {
		const { done } = renderLive(ITEMS, ['a', 'b'])

		screen.getByRole('checkbox', { name: 'Третий' }).click()
		await nextTick()

		const status = screen.getByRole('status')
		expect(done.value).toEqual(['a', 'b', 'c'])
		expect(status).toHaveClass('base-checklist__done', 'base-checklist__done-enter-active')
		done.value = ['a']
		await nextTick()
		expect(status).toHaveClass('base-checklist__done-leave-active')
		await waitFor(() => expect(screen.queryByRole('status')).toBeNull())
	})
})
