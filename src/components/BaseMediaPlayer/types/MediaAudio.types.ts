import type { Ref } from 'vue'
import type { MediaElementRef } from './MediaCore.types'

export interface MediaAudioTrackItem {
	/**
	 * Аудиофайл озвучки: играет синхронно с видео, звук самого видео при этом выключен.
	 * Без адреса — звук самого видео («Оригинал»). Адрес — относительный или со схемой из `allowedProtocols`
	 */
	src?: string
	/** Название в меню «Озвучка»: «Оригинал», «AniLibria», «Русский дубляж» */
	label: string
	/** Язык дорожки (BCP 47): `ja`, `ru` */
	srclang?: string
	/** MIME аудиофайла, например `audio/mp4; codecs="mp4a.40.2"`: дорожку, которую браузер не воспроизводит, меню не показывает */
	type?: string
	/** Включить при загрузке, если `audioTrack` не задан */
	isDefault?: boolean
}

/** Озвучка в меню: адрес файла, null — звук самого видео, `embedded:<id>` или `embedded:#<номер>` — дорожка внутри файла */
export interface MediaAudioOption {
	id: string | null
	label: string
}

/** Звуковая дорожка внутри файла (`HTMLMediaElement.audioTracks`: Safari, в Chrome — за флагом) */
export interface MediaEmbeddedAudioTrack {
	id: string
	label: string
	language: string
	enabled: boolean
}

export interface MediaEmbeddedAudioTrackList extends EventTarget {
	readonly length: number
	[index: number]: MediaEmbeddedAudioTrack
}

/** Медиаэлемент со списком звуковых дорожек, если браузер его поддерживает */
export type MediaElementWithAudioTracks = HTMLMediaElement & { audioTracks?: MediaEmbeddedAudioTrackList }

/** Дорожки внутри файла или потока для меню «Озвучка» */
export interface MediaAudioProvider {
	options: Readonly<Ref<MediaAudioOption[]>>
	activeId: Readonly<Ref<string | null>>
	enable: (id: string) => void
}

export interface MediaAudioTracksOptions {
	/** Озвучки из props */
	tracks: () => MediaAudioTrackItem[] | undefined
	/** Выбранная озвучка из props: undefined — не задана */
	audioTrack: () => string | null | undefined
	/** Разрешённые схемы адресов аудиофайлов */
	allowedProtocols: () => readonly string[]
	video: MediaElementRef
	audio: Readonly<Ref<HTMLAudioElement | null>>
	/** Элемент, который сейчас звучит: null — само видео */
	sound: Ref<HTMLMediaElement | null>
	/** Сообщить о смене озвучки (`update:audioTrack`) */
	emitTrack: (id: string | null) => void
	/** Короткое сообщение поверх кадра */
	flash: (message: string) => void
	/** Дорожки потока (HLS): важнее дорожек внутри файла */
	stream?: MediaAudioProvider
}

export interface MediaAudioSyncOptions {
	video: MediaElementRef
	audio: Readonly<Ref<HTMLAudioElement | null>>
	/** Адрес звучащего аудиофайла; null — звучит само видео */
	src: () => string | null
	/** Аудиофайл не загрузился */
	onError: () => void
}
