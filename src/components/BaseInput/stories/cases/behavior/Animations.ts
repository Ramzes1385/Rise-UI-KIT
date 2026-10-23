import type meta from '../../BaseInput.stories'
import { expect, waitFor } from 'storybook/test'
import BaseInput from '../../../ui/BaseInput.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { motionPresetsStory } from '@/stories/helpers'

const motion = motionPresetsStory({
	item: `
		<BaseInput v-bind="args" v-model="password" />
	`,
	components: { BaseInput, BaseButton },
	imports: ['BaseInput'],
	state: { password: '' },
	action: "password = password ? '' : 'Rise2026'",
	trigger: 'Ввести или стереть пароль',
	slots: ['modelValue', 'onUpdate:modelValue'],
	omit: ['modelValue', 'onUpdate:modelValue'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: {
		label: 'Новый пароль',
		type: 'password',
		placeholder: '',
		passwordRules: [
			{ key: 'length', label: 'Не меньше 8 символов', validate: (value: string) => value.length >= 8 },
			{ key: 'digit', label: 'Есть цифра', validate: (value: string) => /\d/.test(value) },
			{ key: 'upper', label: 'Есть заглавная буква', validate: (value: string) => /[A-ZА-ЯЁ]/.test(value) },
		],
	},
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Правила пароля в четырёх пресетах движения: `none`, `subtle`, `standard` (по умолчанию), `expressive`.',
					'Кнопка вводит пароль, который проходит все правила, и стирает его: цвет правила меняется плавно',
					'(`--rise-duration`, `--rise-ease`), значок «нет» гаснет, а «выполнено» появляется с увеличением',
					'(`--rise-motion-scale-from`, `--rise-ease-spring` — перелёт только в `expressive`). Появление списка правил —',
					'сдвиг на `--rise-motion-distance` с проявлением. Выключить движение в приложении —',
					"`createUiKitPlugin({ motion: 'none' })` или `reducedMotion: 'always'`; системная настройка «уменьшить движение»",
					'действует всегда: состояние правил меняется сразу.',
				].join('\n'),
			},
			source: motion.source,
		},
	},
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const button = canvas.getByRole('button', { name: 'Ввести или стереть пароль' })
		const valid = () => canvasElement.querySelectorAll('.base-input__password-rule--valid')
		const icons = () => canvasElement.querySelectorAll('.base-input__password-rule-icon .base-icon')

		await expect(canvasElement.querySelectorAll('.base-input__password-rule')).toHaveLength(12)
		await userEvent.click(button)
		await waitFor(() => expect(valid()).toHaveLength(12))
		await waitFor(() => expect(icons()).toHaveLength(12))
		await userEvent.click(button)
		await waitFor(() => expect(valid()).toHaveLength(0))
		await waitFor(() => expect(icons()).toHaveLength(12))
	},
}
