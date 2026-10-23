import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseScrollArea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseScrollArea from '../../../ui/BaseScrollArea.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const rows = Array.from({ length: 16 }, (_, index) => `Отгрузка № ${1200 + index}`)

const ui = { viewport: 'story-themed-viewport', thumb: 'story-themed-thumb' }

const template = `
	<div class="story-row" style="align-items: start;">
		<BaseScrollArea v-bind="args" aria-label="По умолчанию" scrollbar="always" style="width: 220px; border: 1px solid var(--rise-border)">
			<p v-for="row in rows" :key="row" style="margin: 8px 16px">{{ row }}</p>
		</BaseScrollArea>
		<div style="--rise-scroll-area-bar-width: 14px; --rise-scroll-area-bar-bg: var(--rise-bg-muted); --rise-scroll-area-thumb-bg: var(--rise-primary); --rise-scroll-area-thumb-bg-hover: var(--rise-primary-hover); --rise-scroll-area-thumb-radius: var(--rise-radius-sm);">
			<BaseScrollArea v-bind="args" aria-label="Токены на контейнере" scrollbar="always" style="width: 220px; border: 1px solid var(--rise-border)">
				<p v-for="row in rows" :key="row" style="margin: 8px 16px">{{ row }}</p>
			</BaseScrollArea>
		</div>
		<BaseScrollArea v-bind="args" aria-label="Классы через ui" scrollbar="always" :ui="ui" style="width: 220px; border: 1px solid var(--rise-border)">
			<p v-for="row in rows" :key="row" style="margin: 8px 16px">{{ row }}</p>
		</BaseScrollArea>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['maxHeight', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска полосы без пропов. Токены `--rise-scroll-area-*` кит только читает: `bar-width` (толщина полосы), `bar-bg` (дорожка),',
					'`thumb-bg`, `thumb-bg-hover`, `thumb-bg-active` (во время прокрутки и перетаскивания), `thumb-radius` — задайте их на `:root`,',
					'в теме или на обёртке. Список — docs/design/COMPONENT_TOKENS.md. Проп `ui` добавляет классы к частям',
					'(`root`, `viewport`, `content`, `bar`, `thumb`); глобально — `defaults.BaseScrollArea.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseScrollArea'],
				script: [`const rows = ${literal(rows)}`, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['ariaLabel', 'scrollbar'],
			}),
		},
	},
	render: args => ({
		components: { BaseScrollArea },
		setup: useStorySetup(args, { data: { rows, ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [plain, themed, classed] = ['По умолчанию', 'Токены на контейнере', 'Классы через ui'].map(name =>
			canvas.getByRole('region', { name }).closest<HTMLElement>('.base-scroll-area'),
		)
		const bar = (area: HTMLElement | null) => area!.querySelector<HTMLElement>('.base-scroll-area__bar')!
		const thumb = (area: HTMLElement | null) => area!.querySelector<HTMLElement>('.base-scroll-area__thumb')!

		await waitFor(() => expect(bar(themed)).toBeInTheDocument())
		await expect(getComputedStyle(thumb(themed)).backgroundColor).not.toBe(getComputedStyle(thumb(plain)).backgroundColor)
		await expect(bar(themed).offsetWidth).toBeGreaterThan(bar(plain).offsetWidth)
		if (!isStoryBranded()) await expect(bar(themed).offsetWidth).toBe(14)
		if (!isStoryBranded()) await expect(bar(plain).offsetWidth).toBe(10)
		await expect(canvas.getByRole('region', { name: 'Классы через ui' })).toHaveClass(
			'base-scroll-area__viewport',
			'story-themed-viewport',
		)
		await expect(thumb(classed)).toHaveClass('base-scroll-area__thumb', 'story-themed-thumb')
	},
}
