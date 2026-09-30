import type { Meta } from '@storybook/vue3-vite'
import type BaseFooter from '../ui/BaseFooter.vue'

export const parameters = {
	layout: 'fullscreen',
	docs: {
		description: {
			component: [
				'Подвал сайта или приложения: копирайт, ссылки на документы, соцсети.',
				'',
				'- `<footer>` вне `<main>` — ориентир `contentinfo`: скринридер переходит к нему одной командой.',
				'- Слоты `start`, default и `end` — начало, середина и конец; на экране уже 768px зоны встают столбиком.',
				'- `containerSize` — ширина содержимого, как у BaseContainer; `variant` — `default` (линия сверху), `soft`, `ghost`.',
				'- Верхняя часть: `columns` — колонки ссылок (каждая — `<nav>` с именем по заголовку), слот `top` — описание, подписка,',
				'  приложения; нижняя строка отделяется линией. `isCompact` — меньше отступы для рабочих экранов.',
				'',
				'В каркасе страницы подвал кладут в слот `footer` у BaseLayout: он прижат к низу окна даже на короткой странице.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFooter>['parameters']
