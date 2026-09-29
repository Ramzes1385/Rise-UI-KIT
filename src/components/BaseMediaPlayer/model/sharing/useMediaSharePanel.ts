import type { ComputedRef } from 'vue'
import { shareItems } from './shareNetworks'
import { writeClipboard } from './useMediaShare'
import { UI_PLAYER, formatMessage } from '../messages'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { usePlayerContext } from '../player/usePlayerContext'
import { MEDIA_SHARE_NETWORKS } from '../../types/panels/MediaShare.types'
import type { MediaShareEvent } from '../../types/panels/MediaShare.types'
import type { MediaPlayerContext } from '../../types/BaseMediaPlayer.types'

const COPIED_DURATION = 2000

const SCROLL_PAGE = 0.8

function scrollBehavior(): 'auto' | 'smooth' {
	return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function useShareScroller() {
	const listRef = ref<HTMLElement | null>(null)
	const canScrollBack = ref(false)
	const canScrollForward = ref(false)
	const measure = (list: Element): void => {
		canScrollBack.value = list.scrollLeft > 1
		canScrollForward.value = list.scrollLeft + list.clientWidth < list.scrollWidth - 1
	}
	let observer: ResizeObserver | undefined
	watch(listRef, list => {
		observer?.disconnect()
		if (!list || typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(() => measure(list))
		observer.observe(list)
	})
	onBeforeUnmount(() => observer?.disconnect())
	return {
		listRef,
		canScrollBack,
		canScrollForward,
		updateScroll: (event: Event): void => measure(event.currentTarget as Element),
		scrollNetworks(direction: number): void {
			const list = listRef.value
			list?.scrollBy({ left: direction * list.clientWidth * SCROLL_PAGE, behavior: scrollBehavior() })
		},
	}
}

function useCopiedState() {
	const isCopied = ref(false)
	let timer: ReturnType<typeof setTimeout> | undefined
	onBeforeUnmount(() => clearTimeout(timer))
	return {
		isCopied,
		markCopied(): void {
			isCopied.value = true
			clearTimeout(timer)
			timer = setTimeout(() => {
				isCopied.value = false
			}, COPIED_DURATION)
		},
	}
}

function absoluteUrl(path: string | undefined): string | undefined {
	return path ? new URL(path, window.location.href).toString() : undefined
}

function useShareActions(player: MediaPlayerContext, share: { link: ComputedRef<string>; time: ComputedRef<number | undefined> }) {
	const copied = useCopiedState()
	const linkRef = ref<HTMLInputElement | null>(null)
	const send = (target: MediaShareEvent['target']): void => {
		const { link, time } = share
		player.emitShare(time.value === undefined ? { target, url: link.value } : { target, url: link.value, time: time.value })
	}
	return {
		...copied,
		linkRef,
		onNetwork: send,
		canShareSystem: typeof navigator !== 'undefined' && typeof navigator.share === 'function',
		async copyShareLink(): Promise<void> {
			if (!(await writeClipboard(share.link.value))) {
				linkRef.value?.select()
				return
			}
			copied.markCopied()
			send('copy')
		},
		async shareSystem(): Promise<void> {
			const isShared = await navigator.share({ title: player.accessibleName.value, url: share.link.value }).then(
				() => true,
				() => false,
			)
			if (isShared) send('system')
		},
	}
}

export function useMediaSharePanel() {
	const player = usePlayerContext()
	const startTime = ref(0)
	const isAtTime = ref(false)
	watch(player.isShareOpen, isOpen => {
		if (!isOpen) return
		startTime.value = Math.floor(player.state.currentTime)
		isAtTime.value = false
	})
	const time = computed(() => (isAtTime.value ? startTime.value : undefined))
	const link = computed(() => player.shareLink(time.value))

	return {
		...useShareScroller(),
		...useShareActions(player, { link, time }),
		isShareOpen: player.isShareOpen,
		closeShare: (): void => {
			player.isShareOpen.value = false
		},
		shareLink: link,
		isAtTime,
		atTimeLabel: computed(() => formatMessage(UI_PLAYER.SHARE_AT_TIME, { time: formatMediaTime(startTime.value) })),
		shareItems: computed(() =>
			shareItems(player.props.shareNetworks ?? MEDIA_SHARE_NETWORKS, {
				url: link.value,
				text: player.accessibleName.value,
				image: absoluteUrl(player.posterSrc.value),
			}),
		),
		selectLink(event: FocusEvent): void {
			;(event.target as HTMLInputElement).select()
		},
	}
}
