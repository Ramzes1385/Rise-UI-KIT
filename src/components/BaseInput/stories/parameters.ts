import { source } from './render'
import type BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Однострочное поле ввода с подписью, ошибкой, префиксом/постфиксом, маской и режимом пароля.',
				'',
				'- Подпись (`label`) связана с полем: клик по ней ставит фокус, скринридер озвучивает её как имя поля.',
				'- Ошибка (`error`) помечает поле `aria-invalid` и связана с ним через `aria-describedby`.',
				'- Высота поля при `sizeScale` = 100 — 36px, как у кнопки: поле и кнопку можно ставить в один ряд.',
				'',
				'Для полей, которые валидирует форма, используйте `BaseForm` + `BaseFormField`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseInput>['parameters']
