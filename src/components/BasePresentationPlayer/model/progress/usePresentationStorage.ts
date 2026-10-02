import { onMounted, ref, watch } from 'vue'
import type { PresentationStorageSource } from '../../types/PresentationModel.types'
import type { BasePresentationPlayerProps, PresentationSavedProgress } from '../../types/BasePresentationPlayer.types'

const STORAGE_PREFIX = 'rise-presentation:'

function readSaved(key: string): PresentationSavedProgress | null {
	try {
		const value = JSON.parse(localStorage.getItem(key) ?? 'null') as Partial<PresentationSavedProgress> | null
		if (!value || typeof value.index !== 'number' || !Array.isArray(value.completed)) return null
		return { index: value.index, completed: value.completed.filter(id => typeof id === 'string') }
	} catch {
		return null
	}
}

function writeSaved(key: string, value: PresentationSavedProgress): void {
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {
		return
	}
}

export function usePresentationStorage(props: BasePresentationPlayerProps, source: PresentationStorageSource) {
	const resumeIndex = ref<number | null>(null)
	const key = (): string | null => (props.storageKey ? `${STORAGE_PREFIX}${props.storageKey}` : null)

	onMounted(() => {
		const storageKey = key()
		const saved = storageKey ? readSaved(storageKey) : null
		if (!saved) return
		const ids = new Set(props.slides.map(slide => slide.id))
		source.restore(saved.completed.filter(id => ids.has(id)))
		if (saved.index > 0 && saved.index < props.slides.length && saved.index !== source.index()) resumeIndex.value = saved.index
	})
	watch([source.index, source.completed, source.isFinished], () => {
		const storageKey = key()
		if (!storageKey) return
		const index = resumeIndex.value ?? (source.isFinished() ? 0 : source.index())
		writeSaved(storageKey, { index, completed: source.completed() })
	})
	watch(source.index, () => {
		resumeIndex.value = null
	})

	return {
		resumeIndex,
		resume(): void {
			const index = resumeIndex.value
			resumeIndex.value = null
			if (index !== null) source.goTo(index)
		},
		dismissResume(): void {
			resumeIndex.value = null
		},
	}
}
