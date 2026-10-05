import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { BaseAnimation } from '@components/BaseAnimation'

const motion = motionPresetsStory({
	item: `
		<BaseAnimation :key="replay" name="scale">
			<BaseBankCard v-bind="args" />
		</BaseAnimation>
	`,
	components: { BaseAnimation, BaseBankCard, BaseButton },
	imports: ['BaseAnimation', 'BaseBankCard'],
	slots: ['default', 'cover'],
	omit: ['default', 'cover'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { isCompact: true },
	parameters: {
		controls: { include: ['brand', 'isCompact', 'variant'] },
		docs: {
			description: {
				story: [
					'Своего движения у карты нет: она статична. «Повторить» показывает появление через BaseAnimation (`scale`) —',
					'прозрачность и масштаб от `--rise-motion-scale-from` за `--rise-duration`. Так же карту можно показать в списке',
					'(`BaseAnimation` с `isGroup`). В `none` и при «уменьшить движение» карта появляется сразу. Выключить движение',
					"в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-bank-card')).toHaveLength(4))
		for (const number of canvas.getAllByText('•••• 4242')) await waitFor(() => expect(number).toBeVisible())
	},
}
