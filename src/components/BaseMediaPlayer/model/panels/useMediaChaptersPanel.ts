import { computed } from 'vue'
import { formatMediaTime } from '@utils/mediaUtils'
import { useMediaSidePanel } from './useMediaSidePanel'
import { usePlayerContext } from '../player/usePlayerContext'
import type { MediaChapterItem } from '../../types/playback/MediaScreen.types'
import type { MediaChapterRange } from '../../types/content/MediaPlaylist.types'

function progressOf(chapter: MediaChapterRange, time: number): number {
	if (time >= chapter.end) return 1
	if (time <= chapter.start || !Number.isFinite(chapter.end)) return 0
	return (time - chapter.start) / (chapter.end - chapter.start)
}

export function useMediaChaptersPanel() {
	const { isChaptersOpen, chapters, currentChapter, state, actions, closeChapters } = usePlayerContext()
	const panel = useMediaSidePanel({
		trigger: '.base-media-player__chapter',
		focus: ['[aria-current="true"]', '.base-media-player__chapter-item'],
		isOpen: () => isChaptersOpen.value,
		close: closeChapters,
	})

	return {
		...panel,
		isChaptersOpen,
		chapterItems: computed<MediaChapterItem[]>(() =>
			chapters.value.map((chapter, index) => ({
				id: String(index),
				title: chapter.title,
				start: chapter.start,
				time: formatMediaTime(chapter.start),
				color: chapter.color ?? 'var(--media-primary)',
				isCurrent: chapter.start === currentChapter.value?.start,
				progress: progressOf(chapter, state.currentTime),
			})),
		),
		chooseChapter(start: number): void {
			panel.leave(() => {
				actions.seek(start)
				closeChapters()
			})
		},
	}
}
