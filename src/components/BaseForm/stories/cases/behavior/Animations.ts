import type meta from '../../BaseForm.stories'
import BaseForm from '../../../ui/BaseForm.vue'
import { expect, waitFor } from 'storybook/test'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'
import { BaseFormField } from '@components/BaseFormField'

const NAME_ERROR = 'Введите имя'
const EMAIL_ERROR = 'Укажите почту'

const motion = motionPresetsStory({
	item: `
		<BaseForm v-bind="args">
			<div class="story-col">
				<BaseFormField label="Имя" description="Как к вам обращаться" :error="isChecked ? '${NAME_ERROR}' : ''">
					<BaseInput model-value="" />
				</BaseFormField>
				<BaseFormField label="Почта" :error="isChecked ? '${EMAIL_ERROR}' : ''">
					<BaseInput model-value="" type="email" />
				</BaseFormField>
			</div>
		</BaseForm>
	`,
	components: { BaseForm, BaseFormField, BaseInput, BaseButton },
	imports: ['BaseForm', 'BaseFormField', 'BaseInput'],
	state: { isChecked: false },
	action: 'isChecked = !isChecked',
	trigger: `{{ isChecked ? 'Сбросить' : 'Проверить' }}`,
	slots: ['default'],
	omit: ['default'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { variant: 'outline' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'У формы своего движения нет — двигаются поля. «Проверить» показывает ошибки BaseFormField, «Сбросить» убирает их:',
					'строка ошибки раскрывается и сворачивается без прыжка высоты, описание и ошибка сменяют друг друга растворением.',
					'Слой загрузки (`isLoading`) проявляется по `opacity`. Длительности — токены `--rise-duration` и `--rise-duration-slow`.',
					"Выключить движение — `createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка",
					'«уменьшить движение» действует всегда — ошибки появляются сразу.',
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
		await waitFor(() => expect(canvas.getAllByText(NAME_ERROR)).toHaveLength(4))
		await waitFor(() => expect(canvas.getAllByText(EMAIL_ERROR)).toHaveLength(4))
		for (const input of canvas.getAllByRole('textbox', { name: 'Имя' })) await expect(input).toHaveAccessibleDescription(NAME_ERROR)
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить' }))
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-form-field__error')).toHaveLength(0))
		await waitFor(() => expect(canvas.getAllByText('Как к вам обращаться')).toHaveLength(4))
	},
}
