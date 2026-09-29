import type { MediaIconName } from '../controls/MediaIcon.types'

/** Соцсети и мессенджеры окна «Поделиться» — в порядке по умолчанию */
export const MEDIA_SHARE_NETWORKS = [
	'vk',
	'telegram',
	'whatsapp',
	'odnoklassniki',
	'viber',
	'x',
	'facebook',
	'reddit',
	'linkedin',
	'pinterest',
	'tumblr',
	'threads',
	'bluesky',
	'line',
	'weibo',
	'xing',
	'hacker-news',
	'flipboard',
	'email',
] as const

/** Соцсеть, мессенджер или почта в окне «Поделиться» */
export type MediaShareNetwork = (typeof MEDIA_SHARE_NETWORKS)[number]

/** Чем поделился зритель */
export interface MediaShareEvent {
	/** Куда: соцсеть или мессенджер, `copy` — скопировал ссылку, `system` — системное окно «Поделиться» */
	target: MediaShareNetwork | 'copy' | 'system'
	/** Ссылка, которой поделился */
	url: string
	/** Позиция в секундах, если ссылка — с текущего момента */
	time?: number
}

/** Что отправляется в соцсеть */
export interface MediaShareContent {
	/** Ссылка */
	url: string
	/** Текст: название записи */
	text: string
	/** Картинка записи для Pinterest */
	image?: string
}

/** Кнопка соцсети в окне «Поделиться» */
export interface MediaShareItem {
	network: MediaShareNetwork
	label: string
	href: string
	icon: MediaIconName
	color: string
	isExternal: boolean
}

/** Как устроена соцсеть в окне: название, цвет плитки, значок и адрес «поделиться» */
export interface MediaShareNetworkSpec {
	label: () => string
	color: string
	icon: MediaIconName
	build: (content: MediaShareContent) => string
}
