import type { Meta } from '@storybook/vue3-vite'
import type BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Центр уведомлений: список с непрочитанными сверху по данным приложения, «Прочитать все» и фильтр «Все / Непрочитанные».',
				'Обычно открывается из кнопки с колокольчиком в шапке — в BasePopover (история InPopover).',
				'',
				'- `v-model:items` — уведомления; клик по уведомлению отмечает его прочитанным и даёт событие `select`,',
				'  кнопка справа переключает «прочитано». События `read` и `unread` передают id — для записи на сервер.',
				'- Время — «5 минут назад», «вчера», дальше недели — дата (`formatRelativeTime` из utils); `now` — точка отсчёта.',
				'- Непрочитанное — точка, полужирный заголовок и подложка; для скринридера в названии кнопки — «не прочитано»,',
				'  число новых в шапке — `role="status"`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseNotificationCenter>['parameters']
