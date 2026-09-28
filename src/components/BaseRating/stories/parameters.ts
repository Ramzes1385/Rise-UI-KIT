import type { Meta } from '@storybook/vue3-vite'
import type BaseRating from '../ui/BaseRating.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Оценка звёздами: выбор кликом или с клавиатуры, дробные значения (`step` 0.5 или 0.1), режим только для чтения.',
				'',
				'- `v-model` — число от 0 до `max`. Клик записывает оценку с шагом `step`; `isHoverSmooth` делает плавным',
				'  только предпросмотр под курсором.',
				'- Доступность: интерактивный рейтинг — `slider`: стрелки меняют оценку на `step`, Home — 0, End — максимум,',
				'  значение озвучивается как «3 из 5». Только чтение (`isReadonly`) — изображение с именем «Оценка 4.5 из 5».',
				'- Иконки — `icon` и `iconFilled` из спрайта; цвет заполненных звёзд — `color.text`.',
				'',
				'Подпись и описание в форме даёт `BaseFormField`. `<fieldset disabled>` рейтинг не блокирует — используйте `isDisabled`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseRating>['parameters']
