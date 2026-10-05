import { FRAME } from '../../shared'
import { expect } from 'storybook/test'
import BaseFab from '../../../ui/BaseFab.vue'
import type meta from '../../BaseFab.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frame = FRAME

const ui = { root: 'story-themed-fab', icon: 'story-themed-icon' }

const template = `
	<div :style="frame">
		<BaseFab v-bind="args" label="По умолчанию" position="bottom-left" />
		<div style="--rise-fab-bg: var(--rise-success); --rise-fab-bg-hover: var(--rise-success-hover); --rise-fab-radius: var(--rise-radius-lg); --rise-fab-height: 64px; --rise-fab-shadow: var(--rise-shadow-sm);">
			<BaseFab v-bind="args" label="Токены на контейнере" position="bottom-right" />
		</div>
		<BaseFab v-bind="args" label="Классы через ui" position="top-left" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['isExtended', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-fab-*` — `bg`, `bg-hover`, `text`, `border`, `radius`, `shadow`, `height`',
					'(сторона круглой кнопки и высота широкой), `padding-x` и `gap` широкой кнопки, `font-weight` — кит только читает:',
					'задайте их на `:root`, в теме или на контейнере — как здесь. Проп `ui` добавляет классы к частям (`root`, `icon`, `label`);',
					'глобально — `defaults.BaseFab.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFab'],
				script: [`const frame = ${literal(frame)}`, `const ui = ${literal(ui)}`].join('\n'),
				omit: ['label', 'position', 'variant'],
			}),
		},
	},
	render: args => ({
		components: { BaseFab },
		setup: useStorySetup(args, { data: { frame, ui }, slots: ['label', 'position', 'variant'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('button', { name: 'По умолчанию' })
		const themed = canvas.getByRole('button', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('button', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).height).toBe('64px')
		await expect(getComputedStyle(plain).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).borderTopLeftRadius).not.toBe('9999px')
		await expect(classed).toHaveClass('base-fab', 'story-themed-fab')
		await expect(classed.querySelector('.base-fab__icon')).toHaveClass('story-themed-icon')
	},
}
