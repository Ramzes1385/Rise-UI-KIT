import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseSignaturePad.stories'
import { motionPresetsStory } from '@/stories/helpers'
import BaseSignaturePad from '../../../ui/BaseSignaturePad.vue'

const HINT = 'Распишитесь мышью, пальцем или пером'

const motion = motionPresetsStory({
	item: `
		<BaseSignaturePad v-bind="args" v-model="strokes" />
	`,
	components: { BaseSignaturePad, BaseButton },
	imports: ['BaseSignaturePad'],
	state: {
		strokes: [],
		sample: [
			[
				{ x: 40, y: 90 },
				{ x: 90, y: 40 },
				{ x: 140, y: 90 },
				{ x: 190, y: 40 },
			],
		],
	},
	action: 'strokes = strokes.length ? [] : sample',
	trigger: 'Подписать или очистить',
	omit: ['modelValue', 'label'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { width: 240, height: 120 },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Пустое и подписанное поле в четырёх пресетах движения: кнопка задаёт штрихи через `v-model` или очищает их.',
					'Подсказка в пустом поле появляется и уходит прозрачностью: появление — `--rise-duration` и `--rise-ease-out`,',
					'уход — `--rise-duration-fast` и `--rise-ease-in`; рамка поля меняет цвет за `--rise-duration-fast`.',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Подписать или очистить' })
		await expect(canvas.getAllByText(HINT)).toHaveLength(4)
		trigger.focus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getAllByRole('img', { name: 'Подпись: 1 штрих' })).toHaveLength(4))
		await waitFor(() => expect(canvas.queryAllByText(HINT)).toHaveLength(0))
		await userEvent.click(trigger)
		await waitFor(() => expect(canvas.getAllByRole('img', { name: 'Подписи нет' })).toHaveLength(4))
		for (const hint of canvas.getAllByText(HINT)) await waitFor(() => expect(hint).toBeVisible())
	},
}
