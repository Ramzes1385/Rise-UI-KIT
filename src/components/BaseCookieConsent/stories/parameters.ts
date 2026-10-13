import type { Meta } from '@storybook/vue3-vite'
import type BaseCookieConsent from '../ui/BaseCookieConsent.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Окно согласия на cookies: заголовок, описание и три кнопки — «Настроить», «Только выбранные», «Принять все».',
				'',
				'- `categories` — категории (`id`, `label`, `description`, `isRequired`). Обязательные всегда включены, их переключатель отключён,',
				'  рядом пометка «Всегда включены». Выбор — `v-model` (массив `id`), решение — событие `accept(ids)`: окно закрывается.',
				'- «Настроить» раскрывает список категорий (`v-model:is-settings-open`); кнопка получает `aria-expanded`, `aria-controls` — только пока список раскрыт.',
				'- `storageKey` запоминает решение в `localStorage` (`rise-cookie-consent:<ключ>`): при следующей загрузке окно не показывается, выбор восстанавливается.',
				'- `position` — `bottom`, `bottom-left`, `bottom-right`. Окно закреплено в окне браузера (`position: fixed`); `isContained` закрепляет его',
				'  в ближайшем контейнере с `position: relative` — в историях везде так, окно остаётся внутри рамки.',
				'- Доступность: `role="dialog"` без модальности (`aria-modal="false"`), имя и описание — заголовок и текст. Фокус окно не перехватывает и не удерживает:',
				'  страница остаётся доступной.',
				'- Перекраска — токены `--rise-cookie-consent-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCookieConsent>['parameters']
