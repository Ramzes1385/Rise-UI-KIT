import type meta from '../../BaseSwitch.stories'
import { expect, waitFor } from 'storybook/test'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const OWN_ARGS = ['modelValue', 'label', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseSwitch v-bind="args" v-model="isOn" label="Уведомления" />
	`,
	components: { BaseSwitch, BaseButton },
	imports: ['BaseSwitch'],
	state: { isOn: false },
	action: 'isOn = !isOn',
	trigger: 'Переключить',
	slots: OWN_ARGS,
	omit: OWN_ARGS,
})

const handleShifts = (canvasElement: HTMLElement) =>
	[...canvasElement.querySelectorAll('.base-switch__handle')].map(handle =>
		Math.abs(new DOMMatrix(getComputedStyle(handle).transform).m41),
	)

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Переключатели: бегунок в четырёх пресетах движения. «Переключить» (или щелчок, пробел) включает все четыре переключателя:',
					'бегунок едет только через `transform: translateX()` за `--rise-duration` с кривой `--rise-ease`, дорожка меняет цвет за',
					"`--rise-duration-fast`. Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или",
					"`reducedMotion: 'always'`; системная настройка «уменьшить движение» действует всегда — бегунок сразу на месте.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(handleShifts(canvasElement)).toEqual([0, 0, 0, 0])
		await userEvent.click(canvas.getByRole('button', { name: 'Переключить' }))
		await waitFor(() => expect(handleShifts(canvasElement).every(shift => shift > 0)).toBe(true))
		for (const toggle of canvas.getAllByRole('switch', { name: 'Уведомления' })) await expect(toggle).toBeChecked()

		canvas.getAllByRole('switch', { name: 'Уведомления' })[0]!.focus()
		await userEvent.keyboard(' ')
		await waitFor(() => expect(handleShifts(canvasElement)).toEqual([0, 0, 0, 0]))
	},
}
