import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-breadcrumbs', link: 'story-themed-link', sep: 'story-themed-sep' }

const template = `
	<div class="story-stack">
		<BaseBreadcrumbs v-bind="args" aria-label="По умолчанию" />
		<div style="--rise-breadcrumbs-text: var(--rise-primary-text); --rise-breadcrumbs-current-text: var(--rise-primary); --rise-breadcrumbs-gap: 10px; --rise-breadcrumbs-font-weight: var(--rise-font-weight-bold);">
			<BaseBreadcrumbs v-bind="args" aria-label="Токены на контейнере" />
		</div>
		<BaseBreadcrumbs v-bind="args" aria-label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	argTypes: { variant: { control: false } },
	parameters: {
		controls: { include: ['separator', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-breadcrumbs-*` кит только читает: `text` (цвет пути), `text-hover`,',
					'`current-text` (текущая страница), `sep-text` (разделители), `gap`, `font-size`, `font-weight`; у вариантов в контейнере',
					'(`outline`, `shadow`, `soft`) — `bg`, `border`, `shadow`, `radius`, `padding-x`. Задайте их на `:root`, в теме или на',
					'контейнере, как здесь. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к частям (`root`, `list`, `item`, `link`, `current`, `text`, `icon`, `sep`, `ellipsis-btn`);',
					'глобально — `defaults.BaseBreadcrumbs.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBreadcrumbs'],
				script: `const ui = ${literal(ui)}`,
				omit: ['linkComponent', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const nav = (name: string) => canvas.getByRole('navigation', { name })
		const current = (name: string) => nav(name).querySelector('[aria-current="page"]') as HTMLElement
		const list = (name: string) => nav(name).querySelector('ol') as HTMLElement
		const plain = 'По умолчанию'
		const themed = 'Токены на контейнере'

		await expect(getComputedStyle(nav(themed)).color).not.toBe(getComputedStyle(nav(plain)).color)
		await expect(getComputedStyle(current(themed)).color).not.toBe(getComputedStyle(current(plain)).color)
		await expect(getComputedStyle(list(themed)).columnGap).not.toBe(getComputedStyle(list(plain)).columnGap)
		if (!isStoryBranded()) await expect(getComputedStyle(list(themed)).columnGap).toBe('10px')
		if (!isStoryBranded()) await expect(getComputedStyle(list(plain)).columnGap).toBe('6px')
		if (!isStoryBranded()) await expect(getComputedStyle(current(themed)).fontWeight).toBe('700')
		const classed = nav('Классы через ui')
		await expect(classed).toHaveClass('base-breadcrumbs', 'story-themed-breadcrumbs')
		await expect(classed.querySelector('.base-breadcrumbs__link')).toHaveClass('story-themed-link')
		await expect(classed.querySelector('.base-breadcrumbs__sep')).toHaveClass('story-themed-sep')
	},
}
