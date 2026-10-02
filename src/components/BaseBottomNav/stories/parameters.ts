import type { Meta } from '@storybook/vue3-vite'
import type BaseBottomNav from '../ui/BaseBottomNav.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Нижние вкладки для телефона и PWA: 3–5 главных разделов приложения, значок и подпись.',
				'',
				'- Корень — ориентир `<nav aria-label="Нижняя навигация">` со списком; выбранный пункт (`v-model`) помечен `aria-current="page"`.',
				'- Пункт с `to` — ссылка компонента ссылок приложения (`linkComponent`, плагин или RouterLink), с `href` — `<a href>`,',
				'  без адреса — кнопка. `select` приходит при выборе, `navigate` — при переходе по ссылке.',
				'- `badge` — счётчик (BaseBadge) на значке; скринридер слышит подпись и описание «3 новых» (`aria-describedby`, `badgeLabel` меняет его).',
				'- `isFixed` (по умолчанию) закрепляет панель внизу окна; отступ безопасной зоны `env(safe-area-inset-bottom)` есть всегда —',
				'  для PWA добавьте `viewport-fit=cover` в meta viewport. Нижний отступ содержимого страницы задаёт приложение.',
				'- `hideOnScroll` прячет панель при прокрутке окна вниз и возвращает при прокрутке вверх и при фокусе внутри.',
				'- Меньше 3 или больше 5 пунктов — предупреждение в консоли: остальное вынесите в пункт «Ещё».',
				'',
				'В историях `isFixed` выключен, чтобы панели не перекрывали страницу; закреплённая панель — история «HideOnScroll».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBottomNav>['parameters']
