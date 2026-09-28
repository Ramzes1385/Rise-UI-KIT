import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Многоуровневое меню сайта: панель с колонками ссылок (`layout="columns"`) или горизонтальная навигация',
				'с выпадающими панелями (`layout="dropdown"`). Вложенность узлов не ограничена.',
				'',
				'- Узлы с `children` раскрываются по клику (`trigger="click"`) или наведению (`trigger="hover"`); в columns —',
				'  вниз, в dropdown — каскадом вбок. На узком экране меню становится аккордеоном.',
				'- Лист с `to` или `href` — ссылка (`BaseLink`): RouterLink приложения или `<a href>`, открывается и в новой',
				'  вкладке. Клик эмитит `navigate(url)`, `item-click` — клик по любому узлу.',
				'- Узлы с детьми — кнопки (`role="button"`, Enter/Space, `aria-expanded`), пункты навигации — `BaseButton`.',
				'  Закрытия по Escape и клику вне меню пока нет.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseMegaMenu>['parameters']
