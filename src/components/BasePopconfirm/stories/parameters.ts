import type { Meta } from '@storybook/vue3-vite'
import type BasePopconfirm from '../ui/BasePopconfirm.vue'

export const parameters = {
	layout: 'centered',
	docs: {
		description: {
			component: [
				'Вопрос у кнопки перед действием: «Снять с публикации?», «Удалить комментарий?». Легче окна',
				'`BaseConfirm`: не закрывает страницу и стоит рядом с тем, что подтверждают.',
				'',
				'- Кнопка — слот по умолчанию: клик открывает вопрос, кнопке ставятся `aria-haspopup`, `aria-expanded`',
				'  и `aria-controls`. Панель — `role="alertdialog"` с именем из `title` и описанием из `description`.',
				'- Ответ — события `confirm` и `cancel`. Escape и клик снаружи — отмена. После ответа фокус',
				'  возвращается на кнопку.',
				'- `isDanger` — необратимое действие: значок предупреждения, кнопка цвета ошибки, фокус при открытии на',
				'  «Отмене». Иначе фокус на подтверждении.',
				'- Tab ходит между кнопками по кругу. У края окна панель переворачивается и сдвигается; стрелка (`showArrow`,',
				'  по умолчанию включена) переходит на край, обращённый к кнопке, и остаётся напротив её середины.',
				'',
				'Подтверждение, которое требует внимания всей страницы, — `BaseConfirm` или `useConfirm()`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BasePopconfirm>['parameters']
