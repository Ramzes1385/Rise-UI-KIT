import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Главное меню сайта: строка разделов и под ней широкая панель раздела — колонки ссылок с иконками и пояснениями',
				'и промо-блок справа. Для шапки лендинга, магазина, документации.',
				'',
				'- Раздел с `groups` (и `promo`) — кнопка, открывающая панель; раздел с `to` или `href` — обычная ссылка.',
				'- `trigger="hover"` (по умолчанию): панель открывается наведением через `openDelay`, закрывается через `closeDelay`',
				'  после ухода курсора, клик закрепляет её. `trigger="click"` — только кликом. `v-model:openKey` — открытый раздел.',
				'- Клавиатура (паттерн APG «disclosure navigation»): стрелки влево и вправо — между разделами, вниз — в панель,',
				'  в панели стрелки ходят по ссылкам и колонкам, Escape закрывает панель и возвращает фокус. Клик вне и уход фокуса',
				'  тоже закрывают. Ссылки — BaseLink (RouterLink приложения или `<a href>`); выбор — событие `select`.',
				'- Уже `mobileBreakpoint` (md) строка сворачивается в кнопку «Меню», панели раскрываются под разделом. Слот `end` —',
				'  правая часть строки, `link` и `promo` — своё содержимое ссылки и промо-блока.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMegaMenu>['parameters']
