import type { Meta } from '@storybook/vue3-vite'
import type BaseBanner from '../ui/BaseBanner.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Полоса объявления на всю ширину: акция, плановые работы, важная новость. Обычно стоит над шапкой или внизу страницы.',
				'',
				'- `type` — роль и иконка: `primary` (по умолчанию), `info`, `success`, `warning`, `error`.',
				'- `variant` — `default` (заливка роли), `soft` (мягкий фон), `outline` (светлая полоса с рамкой роли).',
				'- Текст — проп `text` или слот `default`; слот `icon` заменяет иконку, слот `action` — ссылка или кнопка справа от текста.',
				'- `isClosable` добавляет кнопку «Закрыть»: полоса уходит с анимацией по высоте и сообщает `update:isOpen` и `close`;',
				'  показом управляет `v-model:is-open`.',
				'- `storageKey` запоминает закрытие в `localStorage` под ключом `rise-banner:<ключ>`: закрытое объявление не появляется снова.',
				'- `position="sticky"` прилипает к верху окна или контейнера прокрутки.',
				'- Доступность: корень — `role="region"` с именем `label` (по умолчанию «Объявление»); если на странице несколько объявлений,',
				'  задайте им разные `label`.',
				'- Перекраска — токены `--rise-banner-*`, классы частей — проп `ui` (история «Токены»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseBanner>['parameters']
