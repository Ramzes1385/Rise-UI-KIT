import { safeUrl } from '../playback/timeline'
import { formatMediaTime } from '@utils/media/mediaUtils'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useScrollableRegion } from '@composables/interaction/useScrollableRegion'
import type { BasePresentationPlayerProps } from '../../types/BasePresentationPlayer.types'
import type { PresentationPanelSource, PresentationPanelView, PresentationSlideCard } from '../../types/PresentationModel.types'

const TRIGGERS: Record<PresentationPanelView, string> = {
	slides: '.base-presentation-player__slides-button',
	notes: '.base-presentation-player__notes-button',
}

const FOCUS: Record<PresentationPanelView, string[]> = {
	slides: ['[aria-current="true"]', '.base-media-player__episode-card'],
	notes: ['.base-presentation-player__notes'],
}

function useOutsidePress(panelRef: Readonly<{ value: HTMLElement | null }>, isOpen: () => boolean, close: () => void): void {
	const onPointerDown = (event: PointerEvent): void => {
		const target = event.target as Element
		const isTrigger = Object.values(TRIGGERS).some(selector => target.closest?.(selector))
		if (!panelRef.value?.contains(target) && !isTrigger) close()
	}
	const stop = (): void => document.removeEventListener('pointerdown', onPointerDown, true)
	watch(isOpen, open => (open ? document.addEventListener('pointerdown', onPointerDown, true) : stop()))
	onBeforeUnmount(stop)
}

function useSlideCards(props: BasePresentationPlayerProps, source: PresentationPanelSource) {
	return computed<PresentationSlideCard[]>(() =>
		props.slides.map((slide, index) => ({
			id: slide.id,
			index,
			number: index + 1,
			title: slide.title,
			image: safeUrl(slide.image),
			duration: slide.duration ? formatMediaTime(slide.duration) : '',
			isCurrent: index === source.index(),
			isCompleted: source.isCompleted(index),
			isLocked: !source.canGoTo(index),
		})),
	)
}

export function usePresentationPanel(props: BasePresentationPlayerProps, source: PresentationPanelSource) {
	const panelRef = ref<HTMLElement | null>(null)
	const notesRef = ref<HTMLElement | null>(null)
	const view = ref<PresentationPanelView | null>(null)
	const opened = ref<PresentationPanelView>('slides')
	const leave = (): void => {
		const hadFocus = panelRef.value?.contains(document.activeElement)
		view.value = null
		notesRef.value = null
		if (hadFocus) source.root()?.querySelector<HTMLElement>(TRIGGERS[opened.value])?.focus()
	}
	const open = (name: PresentationPanelView): void => {
		view.value = name
		opened.value = name
		void nextTick(() => {
			notesRef.value = panelRef.value?.querySelector<HTMLElement>(FOCUS.notes[0]) ?? null
			FOCUS[name]
				.map(selector => panelRef.value?.querySelector<HTMLElement>(selector))
				.find(Boolean)
				?.focus()
		})
	}
	useOutsidePress(panelRef, () => view.value !== null, leave)
	const notes = computed(() => props.slides[source.index()]?.notes?.trim() ?? '')

	return {
		panelRef,
		isNotesScrollable: useScrollableRegion({ elementRef: notesRef }).isScrollable,
		panelView: view,
		hasNotes: computed(() => props.slides.some(slide => Boolean(slide.notes?.trim()))),
		notesParagraphs: computed(() => (notes.value ? notes.value.split(/\n\s*\n/).map(text => text.trim()) : [])),
		slideCards: useSlideCards(props, source),
		togglePanel: (name: PresentationPanelView): void => (view.value === name ? leave() : open(name)),
		showPanelView: (name: PresentationPanelView): void => open(name),
		closePanel: leave,
		chooseSlide(index: number): void {
			if (!source.canGoTo(index)) return source.onLocked()
			leave()
			source.goTo(index)
		},
		onPanelKeydown(event: KeyboardEvent): void {
			if (event.key !== 'Escape') return
			event.stopPropagation()
			leave()
		},
	}
}
