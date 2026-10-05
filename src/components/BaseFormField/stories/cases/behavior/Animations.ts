import { expect, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import type meta from '../../BaseFormField.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import BaseFormField from '../../../ui/BaseFormField.vue'

const ERROR = 'Введите имя полностью'

const motion = motionPresetsStory({
	item: `
		<BaseFormField v-bind="args" :error="isChecked ? '${ERROR}' : ''">
			<BaseInput model-value="" />
		</BaseFormField>
	`,
	components: { BaseFormField, BaseInput, BaseButton },
	imports: ['BaseFormField', 'BaseInput'],
	state: { isChecked: false },
	action: 'isChecked = !isChecked',
	trigger: `{{ isChecked ? 'Сбросить' : 'Проверить' }}`,
	slots: ['error'],
	omit: ['error'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { label: 'Имя', description: 'Как в паспорте' },
	parameters: {
		controls: { include: ['description', 'variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'«Проверить» показывает ошибку, «Сбросить» убирает её. Описание и ошибка сменяют друг друга без прыжка высоты:',
					'строка сворачивается и раскрывается (`grid-template-rows`) с растворением, свёрнутая скрыта и от скринридера.',
					'Длительности — токены `--rise-duration` и `--rise-duration-slow`, кривые — `--rise-ease-emphasized`, `--rise-ease-out`,',
					"`--rise-ease-in`. Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`;",
					'системная настройка «уменьшить движение» действует всегда — смена сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.tab()
		await expect(canvas.getByRole('button', { name: 'Проверить' })).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(canvas.getAllByText(ERROR)).toHaveLength(4))
		for (const input of canvas.getAllByRole('textbox', { name: 'Имя' })) await expect(input).toHaveAccessibleDescription(ERROR)
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-form-field__error')).toHaveLength(0))
		await waitFor(() => expect(canvas.getAllByText('Как в паспорте')).toHaveLength(4))
	},
}
