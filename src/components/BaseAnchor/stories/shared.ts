import type { AnchorItem } from '../types/BaseAnchor.types'

const TEXT = 'Кит подключается как плагин Vue: компоненты регистрируются глобально, тема и язык берутся из настроек.'

export const sections = [
	{ key: 'intro', tag: 'h2', title: 'Введение', text: `${TEXT} Здесь — что входит в пакет и как он устроен.` },
	{
		key: 'install',
		tag: 'h2',
		title: 'Установка',
		text: 'Пакет ставится из npm, стили подключаются одной строкой в точке входа приложения.',
	},
	{ key: 'npm', tag: 'h3', title: 'Через npm', text: 'npm install @ramzes1385/rise-ui-kit — затем createUiKitPlugin() в main.ts.' },
	{ key: 'cdn', tag: 'h3', title: 'Без сборщика', text: 'Готовый ES-модуль можно подключить тегом script type="module" на странице.' },
	{ key: 'theme', tag: 'h2', title: 'Настройка темы', text: `${TEXT} Цвета, радиусы и тени задаются токенами --rise-*.` },
	{ key: 'faq', tag: 'h2', title: 'Вопросы и ответы', text: 'Частые вопросы о сборке, SSR и поддержке браузеров собраны в одном месте.' },
]

export const items: AnchorItem[] = [
	{ id: 'overview', label: 'Обзор' },
	{ id: 'payment', label: 'Оплата', children: [{ id: 'payment-card', label: 'Картой' }] },
	{ id: 'delivery', label: 'Доставка' },
]
