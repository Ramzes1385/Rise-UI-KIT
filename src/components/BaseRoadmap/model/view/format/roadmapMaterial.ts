import { formatMinutes } from './roadmapText'
import { UI_ROADMAP } from '@/locales/messages'
import type { RoadmapMaterial, RoadmapMaterialKind } from '../../../types/roadmapData.types'

const ABSOLUTE_URL = /^https?:\/\//i

const MATERIAL_KIND_TEXT: Record<RoadmapMaterialKind, () => string> = {
	doc: () => UI_ROADMAP.MATERIAL_DOC,
	article: () => UI_ROADMAP.MATERIAL_ARTICLE,
	video: () => UI_ROADMAP.MATERIAL_VIDEO,
	course: () => UI_ROADMAP.MATERIAL_COURSE,
	book: () => UI_ROADMAP.MATERIAL_BOOK,
	practice: () => UI_ROADMAP.MATERIAL_PRACTICE,
	link: () => UI_ROADMAP.MATERIAL_LINK,
}

const MATERIAL_ICON_PATHS: Record<RoadmapMaterialKind, string> = {
	doc: 'M4 1.75h5.5l3 3v9.5H4zM9.5 1.75v3h3M6 8.5h4.5M6 11h4.5',
	article: 'M2.5 3.5h11v9h-11zM5 6.5h6M5 9.5h4',
	video: 'M2.5 4h8v8h-8zM10.5 7l3-1.75v5.5L10.5 9',
	course: 'M8 2 1.5 5.25 8 8.5l6.5-3.25zM4 7.5v3.25C4 11.75 5.75 13 8 13s4-1.25 4-2.25V7.5',
	book: 'M3 2.5h8.5a1.5 1.5 0 0 1 1.5 1.5v9.5H4.5A1.5 1.5 0 0 1 3 12zM3 12a1.5 1.5 0 0 1 1.5-1.5H13',
	practice: 'M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5M9 3 7 13',
	link: 'M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2.5-2.5a2.5 2.5 0 0 0-3.5-3.5l-.75.75M9.5 6.5a2.5 2.5 0 0 0-3.5 0L3.5 9a2.5 2.5 0 0 0 3.5 3.5l.75-.75',
}

export function isExternalUrl(url: string | undefined, origin: string | undefined = globalOrigin()): boolean {
	if (!url || !ABSOLUTE_URL.test(url)) return false
	if (origin === undefined) return true
	return new URL(url).origin !== origin
}

function globalOrigin(): string | undefined {
	return typeof location === 'undefined' ? undefined : location.origin
}

export function materialKindText(kind: RoadmapMaterialKind): string {
	return (MATERIAL_KIND_TEXT[kind] ?? MATERIAL_KIND_TEXT.link)()
}

export function materialIconPath(kind: RoadmapMaterialKind): string {
	return MATERIAL_ICON_PATHS[kind] ?? MATERIAL_ICON_PATHS.link
}

export function materialMetaText(material: RoadmapMaterial): string {
	const kind = materialKindText(material.kind)
	return material.minutes === undefined ? kind : `${kind} · ${formatMinutes(material.minutes)}`
}
