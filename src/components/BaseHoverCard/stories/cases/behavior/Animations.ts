import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { docsFrame, motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseHoverCard v-bind="args" :is-open="isOpen">
			<template #trigger><BaseButton variant="outline">Подробнее</BaseButton></template>
			<BaseText>Карточка</BaseText>
		</BaseHoverCard>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BaseHoverCard, BaseButton, BaseText },
	imports: ['BaseHoverCard', 'BaseText'],
	slots: [],
	omit: ['isOpen', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		layout: 'padded',
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход карточки в четырёх пресетах движения: пресет берётся из области триггера (`data-rise-motion`).',
					'Проп `animation`: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от триггера',
					'на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу; переключайте его в Controls. Кнопка сверху открывает и закрывает',
					'все карточки сразу. В пресете `none` и при «уменьшить движение» карточка появляется сразу.',
				].join('\n'),
			},
			...docsFrame(240),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(screen.getAllByText('Карточка')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(screen.queryAllByText('Карточка')).toHaveLength(0))
		const [first] = canvas.getAllByRole('button', { name: 'Подробнее' })
		first.focus()
		await waitFor(() => expect(screen.getAllByText('Карточка')).toHaveLength(1))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryAllByText('Карточка')).toHaveLength(0))
	},
}
