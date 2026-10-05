/**
 * Ключ Яндекс Карт для историй BaseMap из `.env.local`: `STORYBOOK_YANDEX_MAPS_API_KEY=…` (Storybook отдаёт в браузер
 * только переменные с префиксом `STORYBOOK_`; шаблон — `.env.example`). Значение ключа не попадает в репозиторий, код,
 * истории, «Show code», Controls и снимки. Ключ читается при двух условиях:
 * - **dev-сервер.** Сборщик подставляет значение переменной в код как строку: в статической сборке (`build-storybook`)
 *   она осталась бы открытым текстом. Чтение стоит за `import.meta.env.DEV` — в сборке условие ложно, и ветку с ключом
 *   сборщик вырезает вместе со значением;
 * - **обычный браузер.** Скриншот-тесты, e2e и `check-stories` идут через Playwright (`navigator.webdriver`): им нужна карта
 *   без ключа — снимки не зависят от тайлов Яндекса и сети, а у владельца с ключом в `.env.local` эталоны остаются прежними.
 * Ключ подаётся как `defaults.BaseMap.apiKey` плагина — так задают ключ приложения; `apiKey` из Controls или `args` его перекрывает.
 * Ключ действует на холсте и в рамке на Docs (`docs.story.inline: false`): `window.ymaps3` один на страницу, и у истории
 * прямо на странице Docs демо-поставщик соседних историй подменил бы настоящий API — там ни ключа, ни подсказки.
 */

import { defineComponent, h, provide } from 'vue'
import type { Decorator } from '@storybook/vue3-vite'
import { DEFAULTS_KEY } from '@composables/base/useDefaults/useDefaults'

const KEY_HINT =
	'Ключ Яндекс Карт не задан. Положите его в .env.local — STORYBOOK_YANDEX_MAPS_API_KEY=… — и перезапустите npm run storybook: в статическую сборку ключ не попадает.'

/** Ключ для историй: пустая строка — ключа нет или прогон автоматический */
export const resolveYandexMapsKey = (value: string | undefined, isAutomated: boolean): string => (isAutomated ? '' : (value?.trim() ?? ''))

const envKey: string | undefined = import.meta.env.DEV ? import.meta.env.STORYBOOK_YANDEX_MAPS_API_KEY : undefined

/** Ключ Яндекс Карт текущего прогона историй; пустая строка — карта без ключа (заглушка) */
export const STORY_YANDEX_MAPS_KEY = resolveYandexMapsKey(envKey, navigator.webdriver === true)

/** Обёртка превью: с ключом — `defaults.BaseMap.apiKey` для карт внутри, с подсказкой — строка под превью */
const StoryYandexMapsKey = defineComponent({
	name: 'StoryYandexMapsKey',
	props: { apiKey: { type: String, default: '' }, hint: { type: String, default: '' } },
	setup(props, { slots }) {
		if (props.apiKey) provide(DEFAULTS_KEY, { BaseMap: { apiKey: props.apiKey } })
		return () =>
			props.hint
				? h('div', { class: 'story-stack' }, [slots.default?.(), h('p', { class: 'story-hint' }, props.hint)])
				: slots.default?.()
	},
})

/** Ключ и подсказка — на холсте и в рамке на Docs; у истории прямо на странице Docs — ни того, ни другого */
function scopeProps(key: string, viewMode: string | undefined): { apiKey: string; hint: string } {
	if (viewMode === 'docs') return { apiKey: '', hint: '' }
	return { apiKey: key, hint: key ? '' : KEY_HINT }
}

/** Декоратор истории с ключом `apiKey`: с ключом — `defaults.BaseMap.apiKey`, без — подсказка под превью про `.env.local` */
export const createYandexMapsKeyDecorator =
	(key: string): Decorator =>
	(_story, context) => ({
		components: { StoryYandexMapsKey },
		setup: () => scopeProps(key, context.viewMode),
		template: '<StoryYandexMapsKey :api-key="apiKey" :hint="hint"><story /></StoryYandexMapsKey>',
	})

/** Декоратор истории BaseMap «Default»: ключ из `.env.local` или подсказка, как его положить */
export const withYandexMapsKey: Decorator = createYandexMapsKeyDecorator(STORY_YANDEX_MAPS_KEY)
