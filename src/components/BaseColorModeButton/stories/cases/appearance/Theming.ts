import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseColorModeButton.stories'
import { FRAME_SOURCE, useFrameColorMode } from '../../shared'
import BaseColorModeButton from '../../../ui/BaseColorModeButton.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-mode', icon: 'story-themed-icon' }

const template = `
	<div ref="frame" class="story-frame story-row" style="background: var(--rise-bg);">
		<BaseColorModeButton v-bind="args" label="По умолчанию" :color-mode="colorMode" />
		<div style="--rise-color-mode-button-padding: 12px; --rise-color-mode-button-text: var(--rise-warning); --rise-color-mode-button-ring: var(--rise-warning);">
			<BaseColorModeButton v-bind="args" label="Токены на контейнере" :color-mode="colorMode" />
		</div>
		<BaseColorModeButton v-bind="args" label="Классы через ui" :color-mode="colorMode" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-color-mode-button-*` кит только читает: `padding` — отступ вокруг иконки,',
					'`text` и `text-hover` — цвет иконки, `ring` — кольцо фокуса. Фон, рамка и радиус — от BaseButton (`--rise-button-*`),',
					'размер иконки — `--rise-icon-icon-size`. Задайте токены на `:root`, в теме или на контейнере — как здесь.',
					'Проп `ui` добавляет классы к частям (`root`, `icons` — обёртка, `icon`); глобально — `defaults.BaseColorModeButton.ui`.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseColorModeButton'],
				...FRAME_SOURCE,
				script: `${FRAME_SOURCE.script}\nconst ui = ${literal(ui)}`,
				omit: ['label'],
			}),
		},
	},
	render: args => {
		const setup = useStorySetup(args, { slots: ['label'], data: { ui } })
		return {
			components: { BaseColorModeButton },
			setup: () => ({ ...setup(), ...useFrameColorMode() }),
			template,
		}
	},
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('button', { name: 'По умолчанию' })
		const themed = canvas.getByRole('button', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('button', { name: 'Классы через ui' })
		const iconColor = (button: HTMLElement) => getComputedStyle(button.querySelector('.base-color-mode-button__icons')!).color

		await expect(getComputedStyle(themed).paddingTop).toBe('12px')
		await expect(getComputedStyle(plain).paddingTop).toBe('7px')
		await expect(iconColor(themed)).not.toBe(iconColor(plain))
		await expect(classed).toHaveClass('base-color-mode-button', 'story-themed-mode')
		await expect(classed.querySelector('.base-color-mode-button__icon')).toHaveClass('story-themed-icon')
	},
}
