import { docsFrame } from '../../shared'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { expect, screen, waitFor } from 'storybook/test'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'

const motion = motionPresetsStory({
	item: `
		<div style="padding-top: 150px;">
			<BasePopconfirm v-bind="args" :is-open="isOpen">
				<BaseButton variant="outline">Снять с публикации</BaseButton>
			</BasePopconfirm>
		</div>
	`,
	state: { isOpen: true },
	action: 'isOpen = !isOpen',
	trigger: 'Открыть или закрыть',
	components: { BasePopconfirm, BaseButton },
	imports: ['BasePopconfirm'],
	slots: [],
	omit: ['isOpen', 'onUpdate:isOpen'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale', description: undefined },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление и уход вопроса в четырёх пресетах движения: пресет берётся из области кнопки (`data-rise-motion`).',
					'Проп `animation`: `scale` (по умолчанию) — масштаб от стрелки, `fade` — прозрачность, `slide` — сдвиг от кнопки',
					'на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу. Кнопка в колонке открывает и закрывает свой вопрос,',
					'кнопка сверху — все сразу. В `none` и при «уменьшить движение» вопрос появляется сразу.',
				].join('\n'),
			},
			...docsFrame(300),
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(screen.getAllByRole('alertdialog')).toHaveLength(4))
		await userEvent.click(canvas.getByRole('button', { name: 'Открыть или закрыть' }))
		await waitFor(() => expect(screen.queryAllByRole('alertdialog')).toHaveLength(0))
		await userEvent.click(canvas.getAllByRole('button', { name: 'Снять с публикации' })[0])
		await waitFor(() => expect(screen.getAllByRole('alertdialog')).toHaveLength(1))
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryAllByRole('alertdialog')).toHaveLength(0))
	},
}
