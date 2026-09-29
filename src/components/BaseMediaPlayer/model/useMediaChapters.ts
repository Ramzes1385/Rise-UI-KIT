import { computed } from 'vue'
import type { MediaChapter, MediaChapterRange, MediaChaptersOptions } from '../types/MediaPlaylist.types'

function normalizeChapters(chapters: MediaChapter[] | undefined, duration: number): MediaChapterRange[] {
	const end = Number.isFinite(duration) ? duration : Number.POSITIVE_INFINITY
	const sorted = (chapters ?? []).filter(chapter => Number.isFinite(chapter.start)).sort((a, b) => a.start - b.start)
	return sorted.map((chapter, index) => ({ ...chapter, end: chapter.end ?? sorted[index + 1]?.start ?? end }))
}

export function useMediaChapters(options: MediaChaptersOptions) {
	const chapters = computed(() => normalizeChapters(options.chapters(), options.state.duration))
	const chapterAt = (time: number): MediaChapterRange | null =>
		chapters.value.find(chapter => chapter.start <= time && time < chapter.end) ?? null
	const current = computed(() => chapterAt(options.state.currentTime))

	return {
		chapters,
		currentChapter: current,
		chapterMarks: computed(() => chapters.value.map(chapter => chapter.start)),
		chapterAt,
		skipChapter: computed(() => (current.value?.kind ? current.value : null)),
	}
}
