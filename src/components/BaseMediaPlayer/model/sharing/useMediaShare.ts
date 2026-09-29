import { UI_PLAYER } from '../messages'
import { onBeforeUnmount, ref } from 'vue'

const FLASH_DURATION = 2000

export async function writeClipboard(text: string): Promise<boolean> {
	const isCopied = await navigator.clipboard?.writeText(text).then(
		() => true,
		() => false,
	)
	return Boolean(isCopied)
}

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
		flash((await writeClipboard(text)) ? success : failure)
	}
	const link = (time?: number): string => {
		const url = new URL(options.shareUrl() ?? window.location.href, window.location.href)
		url.searchParams.delete(options.timeParam())
		if (time !== undefined) url.searchParams.set(options.timeParam(), String(Math.floor(time)))
		return url.toString()
	}
	onBeforeUnmount(() => clearTimeout(timer))

	return {
		flashMessage,
		flash,
		copyText: (text: string) => copy(text, UI_PLAYER.COPIED, UI_PLAYER.COPY_FAILED),
		shareLink: link,
		copyLink: () => copy(link(), UI_PLAYER.LINK_COPIED),
		copyLinkAtTime: () => copy(link(options.currentTime()), UI_PLAYER.LINK_COPIED),
	}
}
