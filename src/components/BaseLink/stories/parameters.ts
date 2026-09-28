import type BaseLink from '../ui/BaseLink.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Ссылка: маршрут приложения (`to`) или внешний адрес (`href`).',
				'',
				'- `to` рендерит компонент ссылок приложения: проп `linkComponent`, `createUiKitPlugin({ linkComponent })`',
				'  или RouterLink, если подключён vue-router. Без роутера — `<a href>`. Внешний адрес в `to` (`https://…`)',
				'  всегда обычная ссылка.',
				'- `href` — всегда `<a href>`. `target="_blank"` добавляет `rel="noopener noreferrer"`, стрелку и подсказку',
				'  «откроется в новой вкладке» для скринридера.',
				'- Небезопасные схемы (`javascript:`, `data:`) не попадают в адрес: ссылка показывается отключённой,',
				'  в консоли — предупреждение.',
				'- Шрифт и размер берутся у окружающего текста, `sizeScale` масштабирует их. `default` — цвет ссылки',
				'  и тонкое подчёркивание: в тексте ссылку видно не только по цвету. `ghost` — цвет текста вокруг,',
				'  подчёркивание при наведении: для навигации и списков ссылок, не для сплошного текста.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseLink>['parameters']
