import type meta from '../BaseLoader.stories'
import BaseLoader from '../../ui/BaseLoader.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<div :key="replay" class="story-row">
			<BaseLoader v-bind="args" variant="spinner" />
			<BaseLoader v-bind="args" variant="dots" />
			<BaseLoader v-bind="args" variant="pulse" />
			<BaseLoader v-bind="args" variant="bars" />
		</div>
	`,
	components: { BaseButton, BaseLoader },
	imports: ['BaseLoader'],
	slots: ['variant'],
	omit: ['variant'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Индикаторы в колонках четырёх пресетов движения; «Повторить» монтирует их заново. Период петель — кратное токена',
					'`--rise-duration-loop` (1s): спиннер — 0.8 периода, точки, пульс и столбики — 1.2. Пресеты и «уменьшить движение»',
					'этот токен не обнуляют: индикатор загрузки должен оставаться живым. Спиннер крутится всегда; точки, пульс и столбики —',
					"декоративные петли: при системной настройке «уменьшить движение», в пресете `none` и при `reducedMotion: 'always'`",
					'они замирают в спокойном положении (`--rise-motion-loop-state`). Темп меняется',
					'токеном `--rise-duration-loop` на `:root`, в теме или на контейнере.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(16))
		const spinners = [...canvasElement.querySelectorAll<SVGElement>('.base-loader__spinner')]
		await expect(spinners).toHaveLength(4)
		for (const spinner of spinners) {
			await expect(getComputedStyle(spinner).animationName).toBe('base-loader-spin')
			await expect(getComputedStyle(spinner).animationDuration).toBe('0.8s')
			await expect(getComputedStyle(spinner).animationPlayState).toBe('running')
		}
		const dot = (preset: string) => canvasElement.querySelector(`[data-rise-motion="${preset}"] .base-loader__dot`)!
		await expect(getComputedStyle(dot('none')).animationPlayState).toBe('paused')
		await expect(getComputedStyle(dot('standard')).animationPlayState).toBe('running')
	},
}
