import { SHORT } from '../../shared'
import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-descriptions', label: 'story-themed-label', value: 'story-themed-value' }

const template = `
	<div class="story-stack">
		<BaseDescriptions v-bind="args" title="По умолчанию" />
		<div style="--rise-descriptions-bg: var(--rise-bg-elevated); --rise-descriptions-border: var(--rise-primary); --rise-descriptions-radius: var(--rise-radius-xl); --rise-descriptions-padding-x: 24px; --rise-descriptions-padding-y: 20px; --rise-descriptions-gap: 16px; --rise-descriptions-label-text: var(--rise-text-highlighted); --rise-descriptions-label-font-weight: var(--rise-font-weight-semibold); --rise-descriptions-value-text: var(--rise-text); --rise-descriptions-value-font-weight: var(--rise-font-weight-medium);">
			<BaseDescriptions v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseDescriptions v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { items: SHORT },
	parameters: {
		controls: { include: ['variant', 'layout', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-descriptions-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding-x`, `padding-y`,',
					'`gap` (между строками полей; отступы умножаются на плотность `--rise-density`), подпись — `label-text`, `label-bg`,',
					'`label-font-weight`, значение — `value-text`, `value-font-weight`. Проп `ui` добавляет классы к частям `root`, `header`,',
					'`title`, `extra`, `list`, `item`, `label`, `value`, `content`, `empty-value`, `copy`, `empty`; глобально —',
					'`defaults.BaseDescriptions.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDescriptions'],
				script: `const ui = ${literal(ui)}`,
				omit: ['title'],
			}),
		},
	},
	render: args => ({
		components: { BaseDescriptions },
		setup: useStorySetup(args, { data: { ui }, slots: ['title'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-descriptions')]
		const part = (list: HTMLElement, name: string) => getComputedStyle(list.querySelector(`.base-descriptions__${name}`)!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(part(themed, 'label').color).not.toBe(part(plain, 'label').color)
		await expect(Number(part(themed, 'label').fontWeight)).toBeGreaterThan(Number(part(plain, 'label').fontWeight))
		await expect(Number(part(themed, 'value').fontWeight)).toBeGreaterThan(Number(part(plain, 'value').fontWeight))
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('24px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingLeft).toBe('16px')
		await expect(classed).toHaveClass('base-descriptions', 'story-themed-descriptions')
		await expect(classed.querySelector('.base-descriptions__label')).toHaveClass('story-themed-label')
		await expect(classed.querySelector('.base-descriptions__value')).toHaveClass('story-themed-value')
	},
}
