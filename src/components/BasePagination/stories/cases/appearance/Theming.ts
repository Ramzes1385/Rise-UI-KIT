import { expect } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePagination from '../../../ui/BasePagination.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const models = { page: 'modelValue' }

const ui = { root: 'story-themed-pagination', page: 'story-themed-page', indicator: 'story-themed-indicator' }

const template = `
	<div class="story-stack">
		<BasePagination v-bind="args" v-model="page" aria-label="По умолчанию" />
		<div style="--rise-pagination-indicator-bg: var(--rise-success); --rise-pagination-page-text-selected: var(--rise-on-success); --rise-pagination-indicator-radius: var(--rise-radius-full); --rise-pagination-gap: 8px;">
			<BasePagination v-bind="args" v-model="page" aria-label="Токены на контейнере" />
		</div>
		<BasePagination v-bind="args" v-model="page" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { modelValue: 3 },
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-pagination-*` кит только читает: `gap` (между кнопками), `page-padding-x`,',
					'`page-text-selected` (текст текущей страницы), `indicator-bg`, `indicator-bg-hover`, `indicator-radius`, `indicator-shadow`',
					'(подложка текущей страницы), `arrow-padding-x`, `ellipsis-text` — задайте их на `:root`, в теме или на контейнере,',
					'как здесь. Цвета пропа `color` (`bg.active`, `text.active`) сильнее токенов. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `arrow`, `pages`, `page`, `ellipsis`, `indicator`);',
					'глобально — `defaults.BasePagination.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePagination'],
				models,
				script: `const ui = ${literal(ui)}`,
				omit: ['ariaLabel'],
			}),
		},
	},
	render: args => ({
		components: { BasePagination },
		setup: useStorySetup(args, { models, data: { ui }, slots: ['default'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = (name: string) => canvas.getByRole('navigation', { name })
		const indicator = (name: string) => nav(name).querySelector('.base-pagination__indicator') as HTMLElement
		const plain = indicator('По умолчанию')
		const themed = indicator('Токены на контейнере')

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(nav('Классы через ui')).toHaveClass('base-pagination', 'story-themed-pagination')
		await expect(indicator('Классы через ui')).toHaveClass('base-pagination__indicator', 'story-themed-indicator')
		await expect(nav('Классы через ui').querySelector('[aria-current="page"]')).toHaveClass(
			'base-pagination__page',
			'story-themed-page',
		)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(nav('Токены на контейнере')).columnGap).toBe('8px')
			await expect(getComputedStyle(nav('По умолчанию')).columnGap).toBe('4px')
		}
	},
}
