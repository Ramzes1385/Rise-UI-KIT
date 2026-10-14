import { BaseText } from '@components/BaseText'
import type meta from '../../BaseDropdown.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdown from '../../../ui/BaseDropdown.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { motionPresetsStory, docsFrame } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseDropdown v-bind="args" :is-open="isOpen">
			<BaseButton variant="outline" @click="isOpen = !isOpen">Меню</BaseButton>
			<template #dropdown><BaseText>Панель</BaseText></template>
		</BaseDropdown>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseDropdown, BaseButton, BaseText },
	imports: ['BaseDropdown', 'BaseText'],
	slots: [],
	omit: ['isOpen', 'onUpdate:isOpen'],
})

const panels = () => document.querySelectorAll('.base-dropdown__panel')

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход панели в четырёх пресетах движения: пресет берётся из области триггера (`data-rise-motion`).',
					'Проп `animation`: `scale` (по умолчанию) — масштаб от угла у триггера, `fade` — прозрачность, `slide` — сдвиг от триггера',
					'на `--rise-motion-distance` (сторона — фактическая, после переворота у края окна), `pop` — масштаб с пружиной, `none` — сразу.',
					'Длительность — `--rise-duration-fast`; в `none` и при «уменьшить движение» панель появляется сразу.',
				].join('\n'),
			},
			...docsFrame(240),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(panels()).toHaveLength(4))
		await expect(screen.getAllByText('Панель')[0].closest('[data-rise-motion]')).not.toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(panels()).toHaveLength(0))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Меню' })[0])
		await waitFor(() => expect(panels()).toHaveLength(4))
	},
}
