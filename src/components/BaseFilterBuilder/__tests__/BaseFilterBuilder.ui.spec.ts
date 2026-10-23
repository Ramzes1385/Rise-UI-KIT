import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'
import { FILTER_BUILDER_PARTS } from '../types/BaseFilterBuilder.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import type { FilterBuilderField, FilterBuilderGroup } from '../types/BaseFilterBuilder.types'

const FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{ key: 'status', label: 'Статус', type: 'select', options: [{ value: 'todo', label: 'К выполнению' }] },
]

const FILTER: FilterBuilderGroup = {
	match: 'all',
	conditions: [
		{ id: 'a', field: 'title', operator: 'contains', value: 'x' },
		{ id: 'b', field: 'status', operator: 'eq', value: 'todo' },
		{ id: 'c', field: 'title', operator: 'eq', value: 'y' },
	],
}

const allUi = Object.fromEntries(['root', ...FILTER_BUILDER_PARTS].map(part => [part, `u-${part}`]))

function renderLive(initial: FilterBuilderGroup) {
	const filter = ref<FilterBuilderGroup>(initial)
	const utils = render(
		{
			components: { BaseFilterBuilder },
			setup: () => ({ filter, fields: FIELDS }),
			template: '<BaseFilterBuilder v-model="filter" :fields="fields" />',
		},
		{ global: { stubs: { TransitionGroup: false, Transition: false } } },
	)
	return { ...utils, filter }
}

describe('BaseFilterBuilder: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseFilterBuilder, { props: { fields: FIELDS, modelValue: FILTER } })

		expect(container.querySelector('.base-filter-builder')).toHaveAttribute('class', 'base-filter-builder')
		for (const part of ['match', 'list', 'item', 'row', 'joiner', 'actions'])
			expect(container.querySelector(`.base-filter-builder__${part}`)).toHaveAttribute('class', `base-filter-builder__${part}`)
		expect(container.querySelector('.base-filter-builder__input')).toHaveAttribute(
			'class',
			'base-input base-filter-builder__input base-filter-builder__value',
		)
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseFilterBuilder, {
			props: {
				fields: FIELDS,
				modelValue: FILTER,
				variant: 'soft',
				isDisabled: true,
				customClass: { root: 'own-root', row: 'own-row', actions: 'own-actions' },
				ui: allUi,
			},
		})
		const root = container.querySelector('.base-filter-builder')!

		expect(root).toHaveClass('u-root', 'base-filter-builder--soft', 'base-filter-builder--disabled', 'own-root')
		for (const part of FILTER_BUILDER_PARTS.filter(part => part !== 'empty'))
			expect(root.querySelector(`.base-filter-builder__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-filter-builder__row')).toHaveClass('own-row')
		expect(root.querySelector('.base-filter-builder__actions')).toHaveClass('own-actions')
		expect(root.querySelector('.base-filter-builder__select--inline')).toHaveClass('u-select')
		expect(root.querySelector('.base-filter-builder__remove')).toHaveClass('base-button', 'u-remove')
		expect(root.querySelector('.base-filter-builder__add')).toHaveClass('base-filter-builder__button', 'u-button', 'u-add')
	})

	it('часть empty — у подсказки без условий', () => {
		const { container } = render(BaseFilterBuilder, { props: { fields: FIELDS, ui: { empty: 'u-empty' } } })

		expect(container.querySelector('.base-filter-builder__empty')).toHaveClass('u-empty')
	})

	it('классы из defaults.BaseFilterBuilder.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseFilterBuilder, {
			props: { fields: FIELDS, modelValue: FILTER, ui: { row: 'own-row' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseFilterBuilder: { ui: { root: 'app-root', row: 'app-row' } } } })] },
		})

		expect(container.querySelector('.base-filter-builder')).toHaveClass('base-filter-builder', 'app-root')
		expect(container.querySelector('.base-filter-builder__row')).toHaveAttribute('class', 'base-filter-builder__row app-row own-row')
	})
})

describe('BaseFilterBuilder: движение', () => {
	it('новое условие появляется через переход base-filter-builder__item', async () => {
		const { container } = renderLive({ ...FILTER, conditions: FILTER.conditions.slice(0, 1) })

		await fireEvent.click(screen.getByRole('button', { name: 'Добавить условие' }))

		const added = [...container.querySelectorAll('.base-filter-builder__item')].at(-1)
		expect(container.querySelectorAll('.base-filter-builder__item')).toHaveLength(2)
		expect(added).toHaveClass('base-filter-builder__item-enter-active')
		await waitFor(() => expect(added).not.toHaveClass('base-filter-builder__item-enter-active'))
	})

	it('удалённое условие уходит на своём месте, недоступно скринридеру и фокусу, затем исчезает', async () => {
		const { container, filter } = renderLive(FILTER)
		const leaving = container.querySelectorAll<HTMLElement>('.base-filter-builder__item')[1]!

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить условие 2' }))
		await nextTick()

		expect(filter.value.conditions.map(item => item.id)).toEqual(['a', 'c'])
		expect(leaving).toHaveClass('base-filter-builder__item-leave-active')
		expect(leaving.style.left).toBe('0px')
		expect(leaving.style.top).toBe('0px')
		expect(leaving.style.width).toBe('0px')
		expect(leaving).toHaveAttribute('aria-hidden', 'true')
		expect(leaving.inert).toBe(true)
		expect(screen.getAllByRole('group', { name: /^Условие/ })).toHaveLength(2)
		await waitFor(() => expect(leaving).not.toBeInTheDocument())
		expect(container.querySelectorAll('.base-filter-builder__item')).toHaveLength(2)
	})
})
