import { source } from './render'
import type BaseModal from '../ui/BaseModal.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Модальное окно — диалог поверх страницы: подтверждение действия, короткая форма, детали записи.',
				'',
				'- Открытие и закрытие — `v-model:is-open`. Окно закрывают кнопка «Закрыть» в шапке (есть при `title`),',
				'  Escape и клик по подложке (`closeOnOverlay`).',
				'- Доступность: `role="dialog"`, `aria-modal`, имя из `title`. При открытии фокус переходит в окно, Tab не выходит',
				'  за его пределы, после закрытия фокус возвращается на кнопку, которая открыла окно. Прокрутка страницы блокируется.',
				'- `isContained` — окно внутри блока (без телепорта, немодальное); `fullScreen` — на всю ширину, высоту или экран.',
				'- `color` красит окно; компоненты в теле и подвале сохраняют свои цвета.',
				'',
				'Панель у края экрана — `BaseSlideover`, подсказка с содержимым у элемента — `BasePopover`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseModal>['parameters']
