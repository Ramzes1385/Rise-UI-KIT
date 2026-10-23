import { UI_ROADMAP } from '@/locales/messages'
import { normalizeRoadmapProgress, ROADMAP_STORAGE_PREFIX } from './roadmapProgress'
import type { RoadmapProgress, RoadmapProgressStorage } from '../../types/roadmapData.types'

function resolveStorage(custom: Storage | undefined): Storage | null {
	if (custom) return custom
	try {
		return typeof window === 'undefined' ? null : window.localStorage
	} catch {
		return null
	}
}

export function createLocalStorageProgress(options: { prefix?: string; storage?: Storage } = {}): RoadmapProgressStorage {
	const prefix = options.prefix ?? ROADMAP_STORAGE_PREFIX
	return {
		load(key: string): RoadmapProgress | null {
			const storage = resolveStorage(options.storage)
			if (!storage) return null
			try {
				const raw = storage.getItem(prefix + key)
				return raw === null ? null : normalizeRoadmapProgress(JSON.parse(raw))
			} catch {
				return null
			}
		},
		save(key: string, progress: RoadmapProgress): void {
			const storage = resolveStorage(options.storage)
			if (!storage) throw new Error(UI_ROADMAP.STORAGE_UNAVAILABLE)
			storage.setItem(prefix + key, JSON.stringify(progress))
		},
	}
}
