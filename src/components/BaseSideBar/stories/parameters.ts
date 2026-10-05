import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSideBar from '../ui/BaseSideBar.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Боковая панель приложения: заголовок, навигация, произвольное содержимое и подвал; сворачивается до полосы иконок.',
				'',
				'- Навигацию задаёт `items`: пункты с `to` — ссылки (`linkComponent`: `a` или RouterLink), без `to` — кнопки;',
				'  `children` — вложенный уровень, `badge`, `hasDivider`, `isDisabled`. Пункт без `to` с детьми раскрывается по клику.',
				'- Текущий пункт определяют `activePath` + `activeMatch`, `activeKey` или `isActive`; он помечен `aria-current="page"`.',
				'- `v-model:isCollapsed` управляет свёрнутым состоянием; без него панель сворачивается сама. В свёрнутой панели у пунктов',
				'  остаются иконки, подсказки и доступные имена.',
				'- Разделы — пункты `type: group`: подпись и пункты под ней. Бейдж — `badge` и `badgeColor`; в свёрнутой панели — точка',
				'  у иконки, а пункт с детьми открывает меню справа (BaseDropdownMenu).',
				'- Навигация — ориентир `<nav>` с именем `navigationLabel` или `title`. `mobileBreakpoint` включает мобильный режим:',
				'  на узком экране панель выезжает слева (BaseSlideover), её открывает `v-model:isMobileOpen`.',
				'- Сайдбар занимает всю высоту родителя. Варианты: `default` — панель с рамкой справа; `ghost` — без фона и рамки;',
				'  `outline`, `shadow` — отдельная панель со скруглением; `soft` — мягкий фон.',
				'- Сворачивание и подменю анимированы на токенах движения (история «Анимации»): подписи гаснут до сужения и проявляются',
				'  после расширения, подменю раскрывается по высоте. Перекраска — токены `--rise-side-bar-*`, классы частей — проп `ui`',
				'  (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSideBar>['parameters']
