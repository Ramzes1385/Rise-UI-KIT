import type { Meta } from '@storybook/vue3-vite'
import type BaseTextarea from '../ui/BaseTextarea.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Многострочное поле ввода: комментарии, описания, отзывы. Выглядит и ведёт себя как `BaseInput`.',
				'',
				'- Подпись (`label`) связана с полем: клик по ней ставит фокус, скринридер озвучивает её как имя поля.',
				'- Ошибка (`error`) помечает поле `aria-invalid` и связана с ним через `aria-describedby`.',
				'- Высота задаётся `rows` (при `rows` = 1 — 32px, как у инпута) или подстраивается под текст (`isAutosize`).',
				'- С `maxlength` под полем появляется счётчик символов «введено/максимум».',
				'',
				'Для однострочного ввода используйте `BaseInput`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTextarea>['parameters']
