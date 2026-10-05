import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="slide-up">
			<BaseCard v-bind="args" is-hoverable title="Отчёт за май">Наведите курсор — карточка приподнимется</BaseCard>
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseCard, BaseButton },
	imports: ['BaseAnimation', 'BaseCard'],
	slots: ['default', 'title', 'subtitle', 'isHoverable'],
	omit: ['default', 'title', 'subtitle', 'isHoverable'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Карточка с `isHoverable` (или обработчиком `@click`) при наведении приподнимается на четверть',
					'`--rise-motion-distance` (в `standard` — 2px) вместе со сменой рамки и тени за `--rise-duration-fast`.',
					'«Повторить» показывает появление через BaseAnimation (`slide-up`). В пресете `none` и при «уменьшить движение»',
					"карточка не сдвигается. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-card--hoverable')).toHaveLength(4))
		for (const card of canvas.getAllByText('Отчёт за май')) await waitFor(() => expect(card).toBeVisible())
	},
}
