import { ref } from 'vue'
import { isSubtitleFile } from './subtitles'
import { UI_PLAYER } from '@/locales/messages'
import { useCaptionStyle } from './useCaptionStyle'
import { useMediaSubtitles } from './useMediaSubtitles'
import type { MediaState, MediaElementRef } from '../types/MediaCore.types'
import type { MediaCaptionFilesOptions } from '../types/MediaSubtitles.types'
import type { MediaPlayerProps, BaseMediaPlayerEmits } from '../types/BaseMediaPlayer.types'

const CAPTION_ACCEPT = '.srt,.vtt'

function useCaptionFiles(options: MediaCaptionFilesOptions) {
	const inputRef = ref<HTMLInputElement | null>(null)
	const isDropTarget = ref(false)
	const hasFiles = (event: DragEvent): boolean => options.isEnabled() && Boolean(event.dataTransfer?.types.includes('Files'))
	const loadFirst = (files: File[]): void => {
		const file = files.find(item => isSubtitleFile(item.name))
		if (file) void options.load(file)
		else options.flash(UI_PLAYER.CAPTIONS_ERROR)
	}
	return {
		captionInputRef: inputRef,
		captionAccept: CAPTION_ACCEPT,
		isDropTarget,
		openCaptionFile: () => inputRef.value?.click(),
		onCaptionFileChange(event: Event): void {
			const input = event.target as HTMLInputElement
			const files = [...(input.files ?? [])]
			input.value = ''
			if (files.length > 0) loadFirst(files)
		},
		onCaptionDragOver(event: DragEvent): void {
			if (!hasFiles(event)) return
			event.preventDefault()
			isDropTarget.value = true
		},
		onCaptionDragLeave(event: DragEvent): void {
			if (!options.root.value?.contains(event.relatedTarget as Node | null)) isDropTarget.value = false
		},
		onCaptionDrop(event: DragEvent): void {
			isDropTarget.value = false
			if (!hasFiles(event)) return
			event.preventDefault()
			loadFirst([...(event.dataTransfer as DataTransfer).files])
		},
	}
}

export function usePlayerCaptions(
	props: MediaPlayerProps,
	emit: BaseMediaPlayerEmits,
	player: {
		state: Readonly<MediaState>
		media: MediaElementRef
		root: Readonly<{ value: HTMLElement | null }>
		flash: (message: string) => void
	},
) {
	const subtitles = useMediaSubtitles({
		tracks: () => props.tracks,
		textTrack: () => props.textTrack,
		state: player.state,
		media: player.media,
		credentials: () => (props.crossorigin === 'use-credentials' ? 'include' : 'same-origin'),
		flash: player.flash,
		emitTrack: id => emit('update:textTrack', id),
	})
	return {
		...subtitles,
		...useCaptionStyle(),
		...useCaptionFiles({
			isEnabled: () => props.hasCaptionUpload,
			root: player.root,
			load: subtitles.loadCaptionFile,
			flash: player.flash,
		}),
	}
}
