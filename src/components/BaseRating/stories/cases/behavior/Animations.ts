import { fillOf, starOf } from '../../shared'
import type meta from '../../BaseRating.stories'
import { expect, waitFor } from 'storybook/test'
import BaseRating from '../../../ui/BaseRating.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const OMIT = ['modelValue', 'isValueShown', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseRating v-bind="args" :model-value="isHigh ? 4.5 : 1" is-value-shown />
	`,
	components: { BaseRating, BaseButton },
	imports: ['BaseRating'],
	state: { isHigh: false },
	action: 'isHigh = !isHigh',
	trigger: 'Изменить оценку',
	slots: OMIT,
	omit: OMIT,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { step: 0.5 },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'icon'] },
		docs: {
			description: {
				story: [
					'«Изменить оценку» ставит 4,5 и 1 по очереди: заливка звёзд плывёт (`clip-path`), число меняется без сдвига соседей —',
					'его ширина рассчитана на самую длинную подпись. Наведение увеличивает звезду, нажатие — уменьшает (`transform: scale`).',
					'Длительности — токены `--rise-duration` и `--rise-duration-fast`, масштаб — `--rise-motion-scale-from`.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда — оценка меняется сразу, звёзды не масштабируются.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const ratings = () => [...canvasElement.querySelectorAll<HTMLElement>('.base-rating')]
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Изменить оценку' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(ratings().map(rating => fillOf(starOf(rating, 4)))).toEqual(['50%', '50%', '50%', '50%']))
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(ratings().map(rating => fillOf(starOf(rating, 1)))).toEqual(['0%', '0%', '0%', '0%']))
	},
}
