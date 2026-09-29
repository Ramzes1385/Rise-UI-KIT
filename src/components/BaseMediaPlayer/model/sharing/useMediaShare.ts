import { UI_PLAYER } from '../messages'
import { onBeforeUnmount, ref } from 'vue'

const FLASH_DURATION = 2000

export function useMediaShare(options: { shareUrl: () => string | undefined; timeParam: () => string; currentTime: () => number }) {
	const flashMessage = ref('')
	let timer: ReturnType<typeof setTimeout> | undefined
	const flash = (message: string): void => {
		flashMessage.value = message
		clearTimeout(timer)
		timer = setTimeout(() => {
			flashMessage.value = ''
		}, FLASH_DURATION)
	}
	const copy = async (text: string, success: string, failure = UI_PLAYER.COPY_FAILED): Promise<void> => {
		const isCopied = await navigator.clipboard?.writeText(text).then(
			() => true,
			() => false,
		)
		flash(isCopied ? success : failure)
	}
	const link = (withTime: boolean): string => {
		const url = new URL(options.shareUrl() ?? window.location.href, window.location.href)
		url.searchParams.delete(options.timeParam())
		if (withTime) url.searchParams.set(options.timeParam(), String(Math.floor(options.currentTime())))
		return url.toString()
	}
	onBeforeUnmount(() => clearTimeout(timer))

	return {
		flashMessage,
		flash,
		copyText: (text: string) => copy(text, UI_PLAYER.COPIED, UI_PLAYER.COPY_FAILED),
		copyLink: () => copy(link(false), UI_PLAYER.LINK_COPIED),
		copyLinkAtTime: () => copy(link(true), UI_PLAYER.LINK_COPIED),
	}
}
