import { computed, ref, watch } from 'vue'
import { formatMediaTime } from '@utils/mediaUtils'
import { usePlayerContext } from './usePlayerContext'
import type { MediaSeekPreviewProps, MediaThumbnailCue } from '../types/MediaPreview.types'

const FRAME_WIDTH = 160

const FRAME_HEIGHT = 90

function thumbnailStyles(cue: MediaThumbnailCue | null) {
	if (!cue) return null
	const image = `url("${cue.url.replace(/"/g, '%22')}")`
	if (!cue.area) {
		return {
			frame: { width: `${FRAME_WIDTH}px`, height: `${FRAME_HEIGHT}px` },
			sprite: { width: '100%', height: '100%', backgroundImage: image, backgroundSize: 'cover', backgroundPosition: 'center' },
		}
	}
	const { x, y, width, height } = cue.area
	const scale = FRAME_WIDTH / width
	return {
		frame: { width: `${FRAME_WIDTH}px`, height: `${Math.round(height * scale)}px` },
		sprite: {
			width: `${width}px`,
			height: `${height}px`,
			backgroundImage: image,
			backgroundPosition: `-${x}px -${y}px`,
			transform: `scale(${scale})`,
			transformOrigin: '0 0',
		},
	}
}

export function useMediaSeekPreview(props: MediaSeekPreviewProps) {
	const player = usePlayerContext()
	const canvasRef = ref<HTMLCanvasElement | null>(null)
	const thumbnail = computed(() => thumbnailStyles(player.previewThumbnail(props.time)))
	const draw = (): void => {
		const canvas = canvasRef.value
		const frame = player.previewFrame.value
		if (!canvas || !frame) return
		canvas.width = frame.width
		canvas.height = frame.height
		canvas.getContext('2d')?.drawImage(frame, 0, 0)
	}
	watch(
		() => props.time,
		time => player.requestPreviewFrame(time),
		{ immediate: true },
	)
	watch([player.previewFrame, canvasRef], draw, { flush: 'post' })

	return {
		canvasRef,
		thumbnail,
		hasFrame: computed(() => thumbnail.value === null && player.hasPreviewFrames.value),
		isFrameReady: computed(() => player.previewFrame.value !== null),
		chapter: computed(() => player.chapterTitleAt(props.time)),
		timeText: computed(() => formatMediaTime(props.time, player.state.duration)),
	}
}
