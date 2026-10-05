import { docsFrame } from '../../shared'
import type { SearchArgs } from '../../shared'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { field: 'story-themed-field', panel: 'story-themed-panel', result: 'story-themed-result' }

const state = { plain: '', themed: '', classed: 'Лис' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<BaseSearch v-bind="args" v-model="plain" placeholder="По умолчанию" />
		<div style="--rise-search-icon-text: var(--rise-primary); --rise-search-panel-bg: var(--rise-bg-muted); --rise-search-result-bg-selected: var(--rise-primary-soft); --rise-search-match-bg: var(--rise-bg-accented); --rise-input-bg: var(--rise-bg-muted);">
			<BaseSearch v-bind="args" v-model="themed" placeholder="Токены на контейнере" />
		</div>
		<BaseSearch v-bind="args" v-model="classed" placeholder="Классы через ui" :ui="ui" />
	</div>
`

const slots = ['modelValue', 'placeholder', 'onUpdate:modelValue']

export const Theming: StoryObj<SearchArgs> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isDisabled', 'error'] },
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Перекраска без пропов. Поле поиска — BaseInput: его рамку, фон и радиус задают токены `--rise-input-*`.',
					'Свои части поиска — токены `--rise-search-*`: `icon-text` (значок в поле); панель результатов и окно —',
					'`panel-bg`, `panel-border`, `panel-radius`, `panel-padding`, `panel-shadow` (тень — у окна `modal` и панели',
					'`sidebar`; тень выпадающей панели задаёт BaseDropdown); пункт результата — `result-text`, `result-gap`,',
					'`result-bg-hover`, `result-bg-selected` (подсветка стрелками); совпадение — `match-bg`; подложка окна — `overlay-bg`.',
					'Кит их только читает: задайте на `:root`, в теме или на контейнере (панель и окно открываются в слое страницы,',
					'поэтому их токены задавайте на `:root` или в теме). Проп `ui` добавляет классы к частям (`root`, `field`, `panel`,',
					'`modal`, `result`, `empty`… — см. `SEARCH_PARTS`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSearch'],
				script: `const ui = ${literal(ui)}`,
				state,
				omit: slots,
			}),
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, { state, data: { ui }, slots }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-search')]
		const part = (root: HTMLElement, selector: string) => root.querySelector<HTMLElement>(selector)!

		await expect(getComputedStyle(part(themed, '.base-search__icon')).color).not.toBe(
			getComputedStyle(part(plain, '.base-search__icon')).color,
		)
		await expect(getComputedStyle(part(themed, '.base-input__wrapper')).backgroundColor).not.toBe(
			getComputedStyle(part(plain, '.base-input__wrapper')).backgroundColor,
		)
		await expect(part(classed, '.base-search__field')).toHaveClass('story-themed-field')

		await userEvent.click(canvas.getByRole('combobox', { name: 'Классы через ui' }))
		const panel = await screen.findByRole('listbox', { name: 'Классы через ui' })
		await waitFor(() => expect(panel.closest('.base-search__panel')).toHaveClass('base-dropdown__panel', 'story-themed-panel'))
		for (const option of screen.getAllByRole('option')) await expect(option).toHaveClass('base-search__result', 'story-themed-result')
	},
}
