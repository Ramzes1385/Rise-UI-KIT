import { isSafeUrl } from '@utils/data/urlUtils'
import { UI_PLAYER, formatMessage } from '../messages'
import type { MediaActor, MediaActorCard, MediaActorLinkItem, MediaActorNetworkSpec } from '../../types/content/MediaPlaylist.types'

const LINK_PROTOCOLS = ['http:', 'https:'] as const

const PHOTO_PROTOCOLS = ['http:', 'https:', 'blob:', 'data:'] as const

const brand = (label: string) => () => label

const NETWORKS: readonly MediaActorNetworkSpec[] = [
	{ hosts: ['instagram.com'], label: brand('Instagram'), icon: 'instagram', color: '#e1306c' },
	{ hosts: ['vk.com', 'vk.ru'], label: () => UI_PLAYER.SHARE_VK, icon: 'vk', color: '#0077ff' },
	{ hosts: ['t.me', 'telegram.me'], label: brand('Telegram'), icon: 'telegram', color: '#229ed9' },
	{ hosts: ['x.com', 'twitter.com'], label: brand('X'), icon: 'x', color: '#0f0f0f' },
	{ hosts: ['facebook.com', 'fb.com'], label: brand('Facebook'), icon: 'facebook', color: '#0866ff' },
	{ hosts: ['youtube.com', 'youtu.be'], label: brand('YouTube'), icon: 'youtube', color: '#e62117' },
	{ hosts: ['tiktok.com'], label: brand('TikTok'), icon: 'tiktok', color: '#0f0f0f' },
	{ hosts: ['threads.net', 'threads.com'], label: brand('Threads'), icon: 'threads', color: '#0f0f0f' },
	{ hosts: ['imdb.com'], label: brand('IMDb'), icon: 'imdb', color: '#a67c00' },
	{ hosts: ['ok.ru'], label: () => UI_PLAYER.SHARE_OK, icon: 'odnoklassniki', color: '#ee8208' },
]

const WEBSITE: MediaActorNetworkSpec = { label: () => UI_PLAYER.ACTOR_WEBSITE, icon: 'globe', color: '#52525b' }

function networkOf(url: string): MediaActorNetworkSpec {
	const host = new URL(url, window.location.href).hostname.replace(/^www\./, '')
	return NETWORKS.find(network => network.hosts?.some(name => host === name || host.endsWith(`.${name}`))) ?? WEBSITE
}

function actorLink(url: string, actor: MediaActor): MediaActorLinkItem {
	const { label, icon, color } = networkOf(url)
	const network = label()
	return { url, label: network, ariaLabel: formatMessage(UI_PLAYER.ACTOR_LINK, { network, name: actor.name }), icon, color }
}

export function actorCards(actors: readonly MediaActor[] | undefined): MediaActorCard[] {
	return (actors ?? []).map((actor, index) => ({
		id: actor.id ?? `${index}:${actor.name}`,
		name: actor.name,
		role: actor.role,
		photo: actor.photo && isSafeUrl(actor.photo, PHOTO_PROTOCOLS) ? actor.photo : undefined,
		links: (actor.links ?? []).filter(url => isSafeUrl(url, LINK_PROTOCOLS)).map(url => actorLink(url, actor)),
	}))
}
