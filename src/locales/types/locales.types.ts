import type { ru } from '../ru'
import type { LOCALES } from '../state'

type Base = typeof ru

/** Строки раздела словаря: ключи как в русском словаре, значения — строки */
type Section<K extends keyof Base> = { readonly [P in keyof Base[K]]: string }

/** Формы слова для чисел: ключи — категории `Intl.PluralRules` (`one`, `few`, `many`, `other`…), `{n}` — число */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { readonly other: string }

/**
 * Язык кита: строки интерфейса, языковой тег для Intl и первый день недели.
 * Свой язык — `defineLocale(en, { … })` поверх готового словаря.
 */
export interface UiKitLocale {
	/** Код языка: `ru`, `en` */
	code: string
	/** Языковой тег для Intl (даты, числа, множественное число): `ru-RU`, `en-US` */
	intl: string
	/** Первый день недели в календаре: 0 — воскресенье, 1 — понедельник */
	firstDayOfWeek: number
	text: Section<'text'>
	aria: Section<'aria'>
	tour: Section<'tour'>
	stepper: Section<'stepper'>
	filter: Section<'filter'>
	calendar: Section<'calendar'>
	colorPicker: Section<'colorPicker'>
	rating: Section<'rating'>
	player: Section<'player'>
	audio: Section<'audio'>
	subtitles: Section<'subtitles'>
	chat: Section<'chat'>
	editor: Section<'editor'>
	table: Section<'table'>
	markdown: Section<'markdown'>
	ai: Section<'ai'>
	emoji: Section<'emoji'>
	mention: Section<'mention'>
	kanban: Section<'kanban'>
	filterBuilder: Section<'filterBuilder'>
	checklist: Section<'checklist'>
	phoneInput: Section<'phoneInput'>
	requisites: Section<'requisites'>
	dadata: Section<'dadata'>
	commandPalette: Section<'commandPalette'>
	charts: Section<'charts'>
	imageCompare: Section<'imageCompare'>
	imageViewer: Section<'imageViewer'>
	carousel: Section<'carousel'>
	fileUpload: Section<'fileUpload'>
	jsonViewer: Section<'jsonViewer'>
	map: Section<'map'>
	textDiff: Section<'textDiff'>
	qrCode: Section<'qrCode'>
	marquee: Section<'marquee'>
	signaturePad: Section<'signaturePad'>
	avatarCropper: Section<'avatarCropper'>
	valueWarnings: Section<'valueWarnings'>
	notificationCenter: Section<'notificationCenter'>
	commentThread: Section<'commentThread'>
	countdown: Section<'countdown'>
	warnings: Section<'warnings'>
	plural: { readonly [P in keyof Base['plural']]: PluralForms }
}

export type LocaleSection = Exclude<keyof UiKitLocale, 'code' | 'intl' | 'firstDayOfWeek' | 'plural'>

export type LocaleOverrides = Partial<Pick<UiKitLocale, 'code' | 'intl' | 'firstDayOfWeek'>> & {
	[K in LocaleSection | 'plural']?: Partial<UiKitLocale[K]>
}

export type LocaleInput = keyof typeof LOCALES | UiKitLocale
