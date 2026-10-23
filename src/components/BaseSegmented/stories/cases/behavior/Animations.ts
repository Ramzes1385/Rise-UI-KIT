import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseSegmented.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSegmented from '../../../ui/BaseSegmented.vue'

const OWN_ARGS = ['modelValue', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseSegmented v-bind="args" v-model="period" />
	`,
	components: { BaseSegmented, BaseButton },
	imports: ['BaseSegmented'],
	state: { period: 'day', order: ['day', 'week', 'month'] },
	action: 'period = order[(order.indexOf(period) + 1) % order.length]',
	trigger: 'Следующий',
	slots: OWN_ARGS,
	omit: OWN_ARGS,
})

const isAligned = (canvasElement: HTMLElement, label: string) =>
	[...canvasElement.querySelectorAll('.base-segmented__track')].every(track => {
		const indicator = track.querySelector('.base-segmented__indicator')!.getBoundingClientRect()
		const checked = track.querySelector('.base-segmented__segment--checked')!
		return checked.textContent?.trim() === label && Math.abs(indicator.left - checked.getBoundingClientRect().left) < 1
	})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isBlock', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Индикаторы: подложка выбранного сегмента — один элемент на дорожку (`useSlidingIndicator`), при смене выбора',
					'переезжает к новому сегменту. «Следующий» переводит выбор по кругу «День → Неделя → Месяц»; стрелки на сегменте —',
					'то же с клавиатуры. Положение — `transform`, ширина — размер абсолютного индикатора (миксин `sliding-indicator`),',
					'длительность `--rise-duration`, кривая `--rise-ease-spring` (перелёт — в `expressive`). Первый замер — без перехода:',
					"индикатор не въезжает из угла. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда — индикатор сразу на месте.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(isAligned(canvasElement, 'День')).toBe(true))
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий' }))
		await waitFor(() => expect(isAligned(canvasElement, 'Неделя')).toBe(true))

		canvas.getAllByRole('radio', { name: 'Неделя' })[0]!.focus()
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(isAligned(canvasElement, 'Месяц')).toBe(true))
		for (const radio of canvas.getAllByRole('radio', { name: 'Месяц' })) await expect(radio).toBeChecked()
	},
}
