import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseColorModeButton.stories'
import { DETACHED_SOURCE, useDetachedColorMode } from '../shared'
import BaseColorModeButton from '../../ui/BaseColorModeButton.vue'
import { motionPresetsStory, storySource } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseColorModeButton v-bind="args" :color-mode="colorMode" />
	`,
	components: { BaseColorModeButton, BaseButton },
	imports: ['BaseColorModeButton'],
	action: 'colorMode.toggle()',
	trigger: 'Переключить тему',
	slots: [],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Солнце и луна сменяют друг друга перекрёстно: уходящая иконка гаснет и поворачивается, новая проявляется',
					'с обратным поворотом (`--rise-duration`, `--rise-ease`, поворот — `--rise-ease-spring`, масштаб — `--rise-motion-scale-from`).',
					'Здесь у кнопок общее управление темой без цели (`target: () => null`): страница не перекрашивается.',
					'В пресете `none` и при «уменьшить движение» иконка меняется сразу. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: storySource({ template: motion.template, imports: ['BaseButton', 'BaseColorModeButton'], ...DETACHED_SOURCE }),
		},
	},
	render: args => {
		const story = motion.render(args)
		return { ...story, setup: () => ({ ...story.setup(), ...useDetachedColorMode() }) }
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить тему' }))
		await waitFor(() => expect(canvas.getAllByRole('button', { name: 'Тёмная тема', pressed: true })).toHaveLength(4))
		for (const button of canvas.getAllByRole('button', { name: 'Тёмная тема' })) {
			await waitFor(() => expect(button.querySelectorAll('.base-color-mode-button__icon')).toHaveLength(1))
		}
	},
}
