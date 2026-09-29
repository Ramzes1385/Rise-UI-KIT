import { UI_PLAYER } from '../messages'
import type { MediaShareContent, MediaShareItem, MediaShareNetwork, MediaShareNetworkSpec } from '../../types/panels/MediaShare.types'

function encode(params: Record<string, string | undefined>): string {
	return Object.entries(params)
		.flatMap(([key, value]) => (value ? [`${key}=${encodeURIComponent(value)}`] : []))
		.join('&')
}

const message = (content: MediaShareContent): string => [content.text, content.url].filter(Boolean).join(' ')

const brand = (label: string) => () => label

const NETWORKS: Record<MediaShareNetwork, MediaShareNetworkSpec> = {
	vk: {
		label: () => UI_PLAYER.SHARE_VK,
		color: '#0077ff',
		icon: 'vk',
		build: content => `https://vk.com/share.php?${encode({ url: content.url, title: content.text })}`,
	},
	telegram: {
		label: brand('Telegram'),
		color: '#229ed9',
		icon: 'telegram',
		build: content => `https://t.me/share/url?${encode({ url: content.url, text: content.text })}`,
	},
	whatsapp: {
		label: brand('WhatsApp'),
		color: '#25d366',
		icon: 'whatsapp',
		build: content => `https://wa.me/?${encode({ text: message(content) })}`,
	},
	odnoklassniki: {
		label: () => UI_PLAYER.SHARE_OK,
		color: '#ee8208',
		icon: 'odnoklassniki',
		build: content => `https://connect.ok.ru/offer?${encode({ url: content.url, title: content.text })}`,
	},
	viber: {
		label: brand('Viber'),
		color: '#7360f2',
		icon: 'viber',
		build: content => `viber://forward?${encode({ text: message(content) })}`,
	},
	x: {
		label: brand('X'),
		color: '#0f0f0f',
		icon: 'x',
		build: content => `https://x.com/intent/tweet?${encode({ text: content.text, url: content.url })}`,
	},
	facebook: {
		label: brand('Facebook'),
		color: '#0866ff',
		icon: 'facebook',
		build: content => `https://www.facebook.com/sharer/sharer.php?${encode({ u: content.url })}`,
	},
	reddit: {
		label: brand('Reddit'),
		color: '#ff4500',
		icon: 'reddit',
		build: content => `https://www.reddit.com/submit?${encode({ url: content.url, title: content.text })}`,
	},
	linkedin: {
		label: brand('LinkedIn'),
		color: '#0a66c2',
		icon: 'linkedin',
		build: content => `https://www.linkedin.com/sharing/share-offsite/?${encode({ url: content.url })}`,
	},
	pinterest: {
		label: brand('Pinterest'),
		color: '#e60023',
		icon: 'pinterest',
		build: content =>
			`https://www.pinterest.com/pin/create/button/?${encode({ url: content.url, media: content.image, description: content.text })}`,
	},
	tumblr: {
		label: brand('Tumblr'),
		color: '#36465d',
		icon: 'tumblr',
		build: content => `https://www.tumblr.com/widgets/share/tool?${encode({ canonicalUrl: content.url, title: content.text })}`,
	},
	threads: {
		label: brand('Threads'),
		color: '#0f0f0f',
		icon: 'threads',
		build: content => `https://www.threads.net/intent/post?${encode({ text: message(content) })}`,
	},
	bluesky: {
		label: brand('Bluesky'),
		color: '#1185fe',
		icon: 'bluesky',
		build: content => `https://bsky.app/intent/compose?${encode({ text: message(content) })}`,
	},
	line: {
		label: brand('LINE'),
		color: '#06c755',
		icon: 'line',
		build: content => `https://social-plugins.line.me/lineit/share?${encode({ url: content.url })}`,
	},
	weibo: {
		label: brand('Weibo'),
		color: '#e6162d',
		icon: 'weibo',
		build: content => `https://service.weibo.com/share/share.php?${encode({ url: content.url, title: content.text })}`,
	},
	xing: {
		label: brand('XING'),
		color: '#006567',
		icon: 'xing',
		build: content => `https://www.xing.com/spi/shares/new?${encode({ url: content.url })}`,
	},
	'hacker-news': {
		label: brand('Hacker News'),
		color: '#ff6600',
		icon: 'hacker-news',
		build: content => `https://news.ycombinator.com/submitlink?${encode({ u: content.url, t: content.text })}`,
	},
	flipboard: {
		label: brand('Flipboard'),
		color: '#e12828',
		icon: 'flipboard',
		build: content => `https://share.flipboard.com/bookmarklet/popout?${encode({ v: '2', url: content.url, title: content.text })}`,
	},
	email: {
		label: () => UI_PLAYER.SHARE_EMAIL,
		color: '#52525b',
		icon: 'email',
		build: content => `mailto:?${encode({ subject: content.text, body: content.url })}`,
	},
}

export function shareItems(networks: readonly MediaShareNetwork[], content: MediaShareContent): MediaShareItem[] {
	return [...new Set(networks)]
		.filter(network => network in NETWORKS)
		.map(network => {
			const { label, color, icon, build } = NETWORKS[network]
			const href = build(content)
			return { network, label: label(), color, icon, href, isExternal: href.startsWith('https:') }
		})
}
