import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		story: { inline: false, height: '460px' },
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
				'**Истории работают на эмуляции плагина** — внутренней эмуляции кита: она ставит `window.cadesplugin` до показа',
				'истории и убирает после, подпись эмуляции фиктивная. В пакет эмуляция не входит, поэтому в «Show code» её нет:',
				'там тот же код, что в приложении с настоящим плагином. Каждая история открывается в своём iframe:',
				'`window.cadesplugin` один на страницу.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
