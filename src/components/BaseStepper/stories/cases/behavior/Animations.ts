import { SLOT_KEYS } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseStepper.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { motionPresetsStory } from '@/stories/helpers'

const HIDDEN = [...SLOT_KEYS, 'modelValue', 'onUpdate:modelValue']

const motion = motionPresetsStory({
	item: `
		<BaseStepper v-bind="args" :model-value="step" @update:model-value="step = $event" />
	`,
	components: { BaseButton, BaseStepper },
	imports: ['BaseStepper'],
	state: { step: 2 },
	action: 'step = step % 4 + 1',
	trigger: 'Следующий шаг',
	slots: HIDDEN,
	omit: HIDDEN,
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'orientation', 'shape', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Смена шага в четырёх пресетах движения: «Следующий шаг» или клик по шагу. Линия между шагами заполняется',
					'`transform: scaleX` (по вертикали — `scaleY`) от предыдущего шага к новому: сначала исходящая половина, затем входящая',
					'(`--rise-ease-in`, затем `--rise-ease-out`) — за `--rise-duration` у варианта `default` и за `--rise-duration-slow`',
					'у `animated`; назад — в обратном порядке. Индикатор нового шага меняет цвет за `--rise-duration-fast` и коротко',
					'«вырастает» от `--rise-motion-scale-from` на кривой `--rise-ease-spring`; при первом показе — без анимации.',
					'Отдельного скользящего индикатора у степпера нет: текущий шаг выделен самим кружком.',
					"В `none` и при «уменьшить движение» всё встаёт сразу. Выключить в приложении — `createUiKitPlugin({ motion: 'none' })`",
					"или `reducedMotion: 'always'`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий шаг' }))
		await waitFor(() =>
			expect(
				canvas.getAllByRole('button', { name: /Оплата/ }).filter(step => step.getAttribute('aria-current') === 'step'),
			).toHaveLength(4),
		)
		const filled = [...canvasElement.querySelectorAll('.base-stepper__step--active .base-stepper__line-fill--start')]
		await waitFor(() => expect(filled.map(fill => getComputedStyle(fill).transform)).toEqual(['none', 'none', 'none', 'none']), {
			timeout: 3000,
		})
	},
}
