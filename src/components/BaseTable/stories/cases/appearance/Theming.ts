import { expect } from 'storybook/test'
import type meta from '../../BaseTable.stories'
import BaseTable from '../../../ui/BaseTable.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { COLUMNS, ORDERS, tableScript } from '../../shared'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const columns = [COLUMNS[0], COLUMNS[1], COLUMNS[2]]

const rows = ORDERS.slice(0, 3).map(({ id, number, customer, city }) => ({ id, data: { number, customer, city }, isSelected: id === 2 }))

const ui = { root: 'story-themed-table', th: 'story-themed-th', td: 'story-themed-td' }

const template = `
	<div class="story-stack">
		<span class="story-label">По умолчанию</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" />
		<span class="story-label">Токены на контейнере</span>
		<div style="--rise-table-bg: var(--rise-bg-muted); --rise-table-border: var(--rise-primary); --rise-table-radius: var(--rise-radius-2xl); --rise-table-header-bg: var(--rise-primary); --rise-table-header-text: var(--rise-on-primary); --rise-table-header-font-weight: var(--rise-font-weight-bold); --rise-table-row-bg-selected: var(--rise-success-soft); --rise-table-cell-padding-x: 20px; --rise-table-cell-padding-y: 8px;">
			<BaseTable v-bind="args" :columns="columns" :rows="rows" />
		</div>
		<span class="story-label">Классы через ui</span>
		<BaseTable v-bind="args" :columns="columns" :rows="rows" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { behavior: { selectable: true } },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-table-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: корень — `bg`, `text`, `border` (рамка и все линии),',
					'`radius`, `font-size` (кегль ячеек и шапки); шапка — `header-bg`, `header-text`, `header-font-weight`; строка —',
					'`row-bg-hover`, `row-bg-selected`; ячейка — `cell-padding-x`, `cell-padding-y` (их перекрывает проп `padding`).',
					'Отступы ячеек и панелей умножаются на плотность темы `--rise-density`. Проп `ui` добавляет классы к частям `root`,',
					'`body`, `header`, `toolbar`, `search`, `filters`, `settings`, `export`, `active-filters`, `content`, `wrapper`,',
					'`loading-overlay`, `table`, `thead`, `th`, `sort-btn`, `resizer`, `tbody`, `tr`, `td`, `expand-btn`, `expanded-wrapper`,',
					'`nested-wrapper`, `load-more`, `footer-bar`, `page-size`, `pagination-info`, `footer`; глобально — `defaults.BaseTable.ui`',
					'плагина. Вложенная таблица получает только глобальные классы.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTable', 'type TableColumn'],
				script: [tableScript({ columns }, { rows }), `const ui = ${literal(ui)}`].join('\n'),
				omit: ['columns', 'rows'],
			}),
		},
	},
	render: args => ({
		components: { BaseTable },
		setup: useStorySetup(args, { data: { columns, rows, ui }, slots: ['default', 'columns', 'rows'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-table')]
		const style = (root: HTMLElement, selector: string) => getComputedStyle(root.querySelector(selector)!)
		const selectedCell = '.base-table__tr--selected .base-table__td'

		await expect(style(themed, '.base-table__th').backgroundColor).not.toBe(style(plain, '.base-table__th').backgroundColor)
		await expect(style(themed, '.base-table__th').color).not.toBe(style(plain, '.base-table__th').color)
		await expect(style(themed, '.base-table__th').fontWeight).not.toBe(style(plain, '.base-table__th').fontWeight)
		await expect(style(themed, selectedCell).backgroundColor).not.toBe(style(plain, selectedCell).backgroundColor)
		await expect(style(themed, '.base-table__body').borderTopColor).not.toBe(style(plain, '.base-table__body').borderTopColor)
		await expect(style(themed, selectedCell).borderTopColor).not.toBe(style(plain, selectedCell).borderTopColor)
		if (!isStoryBranded())
			await expect(style(themed, '.base-table__body').borderTopLeftRadius).not.toBe(
				style(plain, '.base-table__body').borderTopLeftRadius,
			)
		if (!isStoryBranded()) {
			await expect(style(plain, '.base-table__td').paddingTop).toBe('12px')
			await expect(style(themed, '.base-table__td').paddingTop).toBe('8px')
			await expect(style(plain, '.base-table__th').paddingLeft).toBe('16px')
			await expect(style(themed, '.base-table__th').paddingLeft).toBe('20px')
			await expect(style(plain, '.base-table__body').borderTopLeftRadius).toBe('8px')
		}
		await expect(classed).toHaveClass('base-table', 'story-themed-table')
		for (const part of classed.querySelectorAll('.base-table__th')) await expect(part).toHaveClass('story-themed-th')
		for (const part of classed.querySelectorAll('.base-table__td')) await expect(part).toHaveClass('story-themed-td')
	},
}
