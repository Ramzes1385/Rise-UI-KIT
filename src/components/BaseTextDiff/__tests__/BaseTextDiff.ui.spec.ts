import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseTextDiff from '../ui/BaseTextDiff.vue'
import { TEXT_DIFF_PARTS } from '../types/BaseTextDiff.types'

const BEFORE = 'Цена: 1 990 ₽\nДоставка: 3 дня'
const AFTER = 'Цена: 1 790 ₽\nДоставка: 3 дня'

const allUi = Object.fromEntries(['root', ...TEXT_DIFF_PARTS].map(part => [part, `u-${part}`]))

describe('BaseTextDiff: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseTextDiff, { props: { before: BEFORE, after: AFTER, label: 'Цена' } })

		expect(container.querySelector('.base-text-diff')).toHaveAttribute('class', 'base-text-diff')
		for (const part of ['summary', 'table', 'head', 'number', 'sign', 'text'])
			expect(container.querySelector(`.base-text-diff__${part}`)).toHaveAttribute('class', `base-text-diff__${part}`)
		expect(container.querySelector('.base-text-diff__count')).toHaveAttribute(
			'class',
			'base-text-diff__count base-text-diff__count--added',
		)
		expect(container.querySelector('.base-text-diff__word')).toHaveAttribute(
			'class',
			'base-text-diff__word base-text-diff__word--removed',
		)
	})

	it('классы всех частей unified добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseTextDiff, {
			props: {
				before: BEFORE,
				after: AFTER,
				label: 'Цена',
				variant: 'soft',
				customClass: { root: 'own-root', table: 'own-table' },
				ui: allUi,
			},
		})
		const root = container.querySelector('.base-text-diff')!

		expect(root).toHaveClass('u-root', 'base-text-diff--soft', 'own-root')
		for (const part of TEXT_DIFF_PARTS.filter(part => part !== 'same'))
			expect(root.querySelector(`.base-text-diff__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-text-diff__table')).toHaveClass('own-table')
		expect(root.querySelector('.base-text-diff__row')).toHaveClass('base-text-diff__cell--removed')
		for (const word of root.querySelectorAll('.base-text-diff__word')) expect(word).toHaveClass('u-word')
	})

	it('split и «Без изменений»: части row, number, text, word и same получают классы', () => {
		const { container } = render(BaseTextDiff, { props: { before: BEFORE, after: AFTER, label: 'Цена', mode: 'split', ui: allUi } })
		const table = container.querySelector('.base-text-diff__table')!

		expect(table).toHaveClass('base-text-diff__table--split', 'u-table')
		expect(table.querySelector('.base-text-diff__row')).toHaveClass('u-row')
		expect(table.querySelector('.base-text-diff__number')).toHaveClass('u-number', 'base-text-diff__cell--removed')
		expect(table.querySelector('.base-text-diff__text')).toHaveClass('u-text', 'base-text-diff__cell--removed')
		expect(table.querySelector('ins')).toHaveClass('base-text-diff__word', 'base-text-diff__word--added', 'u-word')

		const same = render(BaseTextDiff, { props: { before: BEFORE, after: BEFORE, label: 'Цена', ui: allUi } })
		expect(same.container.querySelector('.base-text-diff__same')).toHaveClass('u-same')
	})

	it('классы из defaults.BaseTextDiff.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseTextDiff, {
			props: { before: BEFORE, after: AFTER, label: 'Цена', ui: { summary: 'own-summary' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseTextDiff: { ui: { root: 'app-root', summary: 'app-summary' } } } })] },
		})

		expect(container.querySelector('.base-text-diff')).toHaveClass('base-text-diff', 'app-root')
		expect(container.querySelector('.base-text-diff__summary')).toHaveAttribute(
			'class',
			'base-text-diff__summary app-summary own-summary',
		)
	})
})
