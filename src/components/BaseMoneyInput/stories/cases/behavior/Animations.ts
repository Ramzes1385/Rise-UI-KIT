import { expect, waitFor } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type meta from '../../BaseMoneyInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseMoneyInput from '../../../ui/BaseMoneyInput.vue'

const motion = motionPresetsStory({
	item: `<BaseMoneyInput v-bind="args" :model-value="isOver ? 1500000 : 15000" :error="isOver ? 'Больше лимита' : ''" />`,
	components: { BaseMoneyInput, BaseButton },
	imports: ['BaseMoneyInput'],
	state: { isOver: false },
	action: 'isOver = !isOver',
	trigger: 'Сменить сумму',
	slots: ['modelValue', 'error', 'onUpdate:modelValue'],
	omit: ['modelValue', 'error', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'currency', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Поле суммы в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'«Сменить сумму» переключает сумму в пределах лимита и сверх него. Своей анимации у поля нет: сумма не «прокручивается»,',
					'чтобы не мешать вводу, а рамка и фон внутреннего BaseInput плавно меняют цвет (`--rise-duration-fast`, `--rise-ease`).',
					"Выключить движение в приложении — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сменить сумму' }))
		await waitFor(() => expect(canvas.getAllByText('Больше лимита')).toHaveLength(4))
		for (const field of canvas.getAllByLabelText('Сумма')) await expect((field as HTMLInputElement).value).toMatch(/^1\s500\s000$/)
	},
}
