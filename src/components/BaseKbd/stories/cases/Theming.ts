import { expect } from 'storybook/test'
import BaseKbd from '../../ui/BaseKbd.vue'
import type meta from '../BaseKbd.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-kbd', name: 'story-themed-name' }

const template = `
	<div class="story-row">
		<BaseKbd v-bind="args" />
		<div style="--rise-kbd-bg: var(--rise-bg-inverted); --rise-kbd-text: var(--rise-text-inverted); --rise-kbd-border: var(--rise-border-inverted); --rise-kbd-radius: var(--rise-radius-full); --rise-kbd-shadow: var(--rise-shadow-sm); --rise-kbd-font-weight: var(--rise-font-weight-bold);">
			<BaseKbd v-bind="args" />
		</div>
		<BaseKbd v-bind="args" value="shift" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['value', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-kbd-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `shadow`, `height`, `padding-x`,',
					'`font-size`, `font-weight`. Проп `ui` добавляет классы к частям `root` и `name` (скрытое название служебной клавиши);',
					'глобально — `defaults.BaseKbd.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseKbd'], script: `const ui = ${literal(ui)}`, omit: ['variant'] }),
		},
	},
	render: args => ({
		components: { BaseKbd },
		setup: useStorySetup(args, { data: { ui }, slots: ['variant'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('kbd')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).fontWeight).toBe('700')
		await expect(getComputedStyle(plain).fontWeight).toBe('500')
		await expect(getComputedStyle(themed).boxShadow).not.toBe('none')
		await expect(classed).toHaveClass('base-kbd', 'story-themed-kbd')
		await expect(classed.querySelector('.base-kbd__name')).toHaveClass('story-themed-name')
	},
}
