import type { Meta } from '@storybook/vue3-vite'
import type BaseBreadcrumbs from '../ui/BaseBreadcrumbs.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Хлебные крошки показывают путь до текущей страницы и позволяют вернуться на любой уровень выше.',
				'',
				'- Корень — ориентир `<nav aria-label="Хлебные крошки">`, текущая страница помечена `aria-current="page"`.',
				'- Крошки — ссылки: `to` рендерит компонент ссылок приложения (`linkComponent`, плагин или RouterLink',
				'  подключённого vue-router), без роутера — `<a href>`; `href` открывается в новой вкладке (`target` меняет это).',
				'  Крошка без адреса — кнопка с событием `item-click`. `navigate(url)` сообщает о переходе.',
				'- `maxItems` сворачивает начало пути в «…», `showHome` добавляет перед крошками ссылку-иконку «домой».',
				'- Варианты: `default` — ссылки; `ghost` — ссылки-кнопки; `outline`, `shadow`, `soft` — крошки в контейнере высотой с контрол.',
				'- Раскрытые из «…» крошки проявляются на токенах движения (история «Анимации»).',
				'- Перекраска — токены `--rise-breadcrumbs-*`, классы частей — проп `ui` (история «Токены»).',
				'',
				'`seo` добавляет разметку schema.org `BreadcrumbList` (JSON-LD) для поисковых систем — история «Seo». По умолчанию разметки нет.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBreadcrumbs>['parameters']
