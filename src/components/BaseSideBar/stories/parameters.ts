import type { Meta } from '@storybook/vue3-vite'
import type BaseSideBar from '../ui/BaseSideBar.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Боковая панель приложения: заголовок, навигация, произвольное содержимое и подвал; сворачивается до полосы иконок.',
				'',
				'- Навигацию задаёт `items`: пункты с `to` — ссылки (`linkComponent`: `a` или RouterLink), без `to` — кнопки;',
				'  `children` — вложенный уровень, `badge`, `hasDivider`, `isDisabled`. Пункт без `to` с детьми раскрывается по клику.',
				'- Текущий пункт определяют `activePath` + `activeMatch`, `activeKey` или `isActive`; он помечен `aria-current="page"`.',
				'- `v-model:isCollapsed` управляет свёрнутым состоянием; без него панель сворачивается сама. В свёрнутой панели у пунктов',
				'  остаются иконки, подсказки и доступные имена.',
				'- Сайдбар занимает всю высоту родителя. Варианты: `default` — панель с рамкой справа; `ghost` — без фона и рамки;',
				'  `outline`, `shadow` — отдельная панель со скруглением; `soft` — мягкий фон.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSideBar>['parameters']
