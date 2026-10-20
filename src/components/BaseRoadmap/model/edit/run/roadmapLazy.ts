import { shallowRef } from 'vue'
import { warn } from '@/locales/warn'
import { UI_ROADMAP } from '@/locales/messages'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { RoadmapLazy } from '../../../types/internal/roadmapEdit.internal.types'

export function createRoadmapLazy<T>(factory: () => Promise<T>, name: string): RoadmapLazy<T> {
	const error = shallowRef(false)
	let pending: Promise<T> | null = null
	function load(): Promise<T> {
		pending ??= factory().then(
			value => {
				error.value = false
				return value
			},
			(reason: unknown) => {
				pending = null
				error.value = true
				if (isDevelopmentBuild()) warn(UI_ROADMAP.LOAD_FAILED, { name, error: String(reason) })
				throw reason
			},
		)
		return pending
	}
	return {
		load,
		error,
		retry: () => {
			error.value = false
			load().catch(() => undefined)
		},
	}
}
