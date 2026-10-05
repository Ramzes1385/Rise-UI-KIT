import type meta from '../../BaseRange.stories'
import { expect, waitFor } from 'storybook/test'
import BaseRange from '../../../ui/BaseRange.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const OMIT = ['modelValue', 'thumb', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseRange v-bind="args" :model-value="isHigh ? 80 : 20" />
	`,
	components: { BaseRange, BaseButton },
	imports: ['BaseRange'],
	state: { isHigh: false },
	action: 'isHigh = !isHigh',
	trigger: 'Сдвинуть',
	slots: OMIT,
	omit: OMIT,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'isVertical'] },
		docs: {
			description: {
				story: [
					'«Сдвинуть» меняет значение с 20 на 80 и обратно: ползунок едет (`transform`), заполнение раскрывается (`clip-path`).',
					'Так же движутся шаг с клавиатуры и клик по дорожке; при перетаскивании ползунок идёт за указателем без задержки.',
					'Длительность — токен `--rise-duration-fast`, кривая — `--rise-ease-out`. Выключить движение —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда — значение меняется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Сдвинуть' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() =>
			expect(canvas.getAllByRole('slider').map(thumb => thumb.getAttribute('aria-valuenow'))).toEqual(['80', '80', '80', '80']),
		)
		await userEvent.click(canvas.getByRole('button', { name: 'Сдвинуть' }))
		await waitFor(() =>
			expect(canvas.getAllByRole('slider').map(thumb => thumb.getAttribute('aria-valuenow'))).toEqual(['20', '20', '20', '20']),
		)
	},
}
