import type BaseFab from '../ui/BaseFab.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Плавающая кнопка главного действия страницы: «Новая задача», «Написать». Стоит в углу окна поверх контента.',
				'',
				'- Круглая с иконкой — имя из `label` (`aria-label`); `isExtended` — широкая с подписью.',
				'- `position` — угол, отступ 24px с учётом безопасной зоны телефона; слой — под окнами и панелями.',
				'- `isContained` — в углу контейнера (`position: absolute`); `to`/`href` — ссылка.',
				'- Одна такая кнопка на экран: для второстепенных действий — обычные кнопки.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFab>['parameters']
