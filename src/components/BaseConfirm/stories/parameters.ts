import type { Meta } from '@storybook/vue3-vite'
import type BaseConfirm from '../ui/BaseConfirm.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Окно подтверждения: вопрос, последствия и две кнопки. Для действий, которые трудно отменить: удаление,',
				'публикация, выход без сохранения.',
				'',
				'- Из кода — `useConfirm()` внутри `<BaseApp>`: `if (await confirm({ title, description })) …`.',
				'  Промис получает `true` при подтверждении и `false` при отмене, Escape, крестике и клике по подложке.',
				'- В шаблоне — `v-model:is-open`, события `confirm` и `cancel`, `close(result)`.',
				'- `isDanger` — необратимое действие: кнопка подтверждения цвета ошибки, фокус при открытии на «Отмене»,',
				'  чтобы случайный Enter ничего не удалил. Без `isDanger` фокус на кнопке подтверждения.',
				'- Доступность: `role="alertdialog"`, имя — вопрос из `title`, описание — `description`: скринридер',
				'  читает их вместе. Фокус не выходит из окна и после закрытия возвращается на кнопку, которая его открыла.',
				'',
				'Окно с формой или своим содержимым — `BaseModal` (или `useOverlay()` для открытия из кода).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseConfirm>['parameters']
