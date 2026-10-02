import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'`useCryptoPro` — адаптер КриптоПро ЭЦП Browser plug-in без npm-пакетов: диагностика по шагам (`status`), личные',
				'сертификаты (`getCertificates()`) и подпись CAdES-BES в Base64 (`sign(data, { thumbprint, detached })`). Ошибки —',
				'`CryptoProError` с кодом (`noExtension`, `noCertificates`, `cancelled`…) и текстом из словаря `cryptopro`.',
				'',
				'**Как подключить `cadesplugin_api.js`.** Кит скрипт не содержит: скачайте его с сайта КриптоПро',
				'(cryptopro.ru, раздел «КриптоПро ЭЦП Browser plug-in») и раздавайте из своего приложения, например из `public/`.',
				'Дальше — один из двух способов:',
				'',
				'- подключить скрипт на странице самому: `<script src="/cadesplugin_api.js"></script>` в `index.html` — composable',
				'  увидит готовый `window.cadesplugin` и ничего не загружает;',
				"- передать адрес: `useCryptoPro({ scriptUrl: '/cadesplugin_api.js' })` — скрипт загрузится при первой проверке, один",
				'  раз на адрес; не загрузился за `timeout` (30 с) — ошибка `scriptFailed`, следующий вызов `check()` пробует снова.',
				'',
				'До `onMounted` composable не трогает `window` и `document` (SSR); `checkOnMount: false` — диагностика только по `check()`.',
				'У пользователя должны быть установлены расширение для браузера, КриптоПро ЭЦП Browser plug-in и КриптоПро CSP.',
				'',
				'**Истории работают на эмуляции плагина** `createCryptoProEmulation({ scenario })` — она публичная, ею удобно',
				'показывать демо и писать тесты приложения. `install()` ставит `window.cadesplugin` и возвращает функцию отката;',
				'подпись эмуляции фиктивная. На этой странице несколько историй, а `window.cadesplugin` один, поэтому эмуляция',
				'ставится только на время `check()` (плагин запоминается при первом обращении) и `checkOnMount: false`.',
				'В приложении с настоящим плагином достаточно `const { status, certificates, sign } = useCryptoPro()`.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
