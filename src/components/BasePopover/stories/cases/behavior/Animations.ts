import { BaseText } from '@components/BaseText'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { motionPresetsStory, docsFrame } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BasePopover v-bind="args" :is-open="isOpen">
			<template #trigger><BaseButton variant="outline">Подробнее</BaseButton></template>
			<BaseText>Поповер</BaseText>
		</BasePopover>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BasePopover, BaseButton, BaseText },
	imports: ['BasePopover', 'BaseText'],
	slots: [],
	omit: ['isOpen', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход поповера в четырёх пресетах движения: пресет берётся из области триггера (`data-rise-motion`).',
					'Проп `animation`: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от триггера',
					'на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу. Кнопка в колонке открывает и закрывает свой поповер,',
					'кнопка сверху — все сразу. В `none` и при «уменьшить движение» поповер появляется сразу.',
				].join('\n'),
			},
			...docsFrame(240),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0))
		const [first] = canvas.getAllByRole('button', { name: 'Подробнее' })
		first.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0))
	},
}
