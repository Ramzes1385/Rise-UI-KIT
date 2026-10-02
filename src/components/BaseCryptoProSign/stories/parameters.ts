import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Электронная подпись через КриптоПро ЭЦП Browser plug-in: диагностика плагина по шагам, выбор сертификата, подпись',
				'CAdES присоединённая или отсоединённая (`v-model:detached`), большой файл — по хэшу, файл `.sig` и проверка подписи (`mode="verify"`).',
				'Построен на `useCryptoPro`; npm-пакеты КриптоПро не нужны.',
				'',
				'**Как подключить `cadesplugin_api.js`.** Скрипт КриптоПро (https://www.cryptopro.ru/sites/default/files/products/cades/cadesplugin_api.js)',
				'положите в `public/` приложения и подключите одним из способов:',
				'',
				'- тегом в `index.html`: `<script src="/cadesplugin_api.js"></script>` — до загрузки приложения;',
				'- пропом `script-url="/cadesplugin_api.js"` или для всех экземпляров настройкой плагина',
				"  `createUiKitPlugin({ defaults: { BaseCryptoProSign: { scriptUrl: '/cadesplugin_api.js' } } })` — скрипт загрузится при первой проверке.",
				'',
				'У пользователя должны быть КриптоПро CSP, расширение браузера и сам плагин: чего не хватает — компонент показывает шаг с ошибкой',
				'и ссылку на установку. Сертификаты — из личного хранилища; недоступные (истёкшие, без закрытого ключа) видны, но не выбираются.',
				'',
				'- Документ больше `hashThreshold` (10 МБ) подписывается по хэшу ГОСТ Р 34.11-2012 (256 или 512 по ключу) — только отсоединённой подписью.',
				'- Уровни `level`: `bes`, `t` и `xlt1` (два последних — со штампом времени, нужен `tsa-address`).',
				'- События `signed`, `verified`, `error`; методы `check()`, `sign()`, `verify()`.',
				'- Доступность: корень — `section` с именем «Электронная подпись», ход и итог объявляются в `role="status"`.',
				'',
				'**В историях плагин эмулирован:** `createCryptoProSignEmulation(options).install()` из пакета ставит `window.cadesplugin`',
				'с четырьмя сертификатами (действующий, истекающий, истёкший, без ключа) — так же можно разрабатывать и тестировать без КриптоПро.',
				'Эмуляция — окружение, а не код примера, поэтому в «Show code» её нет. Каждая история открывается в своём iframe: `window.cadesplugin` один на страницу.',
			].join('\n'),
		},
		story: { inline: false, height: '420px' },
	},
} satisfies Meta<typeof BaseCryptoProSign>['parameters']
