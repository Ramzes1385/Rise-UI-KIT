import { useAnchorSpy } from './useAnchorSpy'
import { useUi } from '@composables/base/useUi'
import { useMotion } from '@composables/app/useMotion'
import { computed, onMounted, ref, shallowRef, useId, watch } from 'vue'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import { useSlidingIndicator } from '@composables/interaction/useSlidingIndicator'
import type { AnchorLink, AnchorProps, BaseAnchorEmits } from '../types/BaseAnchor.types'
import { collectHeadings, flattenItems, focusSection, isPlainClick, resolveElement, scrollToSection } from './anchorDom'

function resolveContent(props: AnchorProps): Element {
	return resolveElement(props.content) ?? resolveElement(props.target) ?? document.querySelector('main') ?? document.body
}

function useAnchorIndicator(getActiveIndex: () => number) {
	const rootRef = ref<HTMLElement | null>(null)
	const indicator = useSlidingIndicator(rootRef, getActiveIndex)
	const motion = useMotion(rootRef)
	return {
		rootRef,
		indicatorStyle: indicator.style,
		isIndicatorVisible: indicator.isVisible,
		isIndicatorInstant: computed(() => indicator.isInstant.value || motion.isReduced.value),
	}
}

export function useBaseAnchor(props: AnchorProps, emit: BaseAnchorEmits) {
	const idPrefix = `rise-anchor${useId()}`
	const links = shallowRef<AnchorLink[]>(props.items ? flattenItems(props.items) : [])
	const activeId = ref(props.active)

	const setActive = (id: string): void => {
		if (id === activeId.value) return
		activeId.value = id
		emit('update:active', id)
	}

	const spy = useAnchorSpy({ getLinks: () => links.value, getOffset: () => props.offset, onChange: setActive })

	const refresh = (): void => {
		links.value = props.items ? flattenItems(props.items) : collectHeadings(resolveContent(props), props.headings, idPrefix)
		spy.start(resolveElement(props.target) ?? window)
	}

	const scrollTo = (id: string): void => {
		const element = document.getElementById(id)
		if (!element) return
		spy.lockUntilScrollEnd()
		setActive(id)
		scrollToSection(spy.getTarget(), element, props.offset)
		focusSection(element)
		if (props.isHashSynced) history.replaceState(history.state, '', `#${id}`)
	}

	onMounted(refresh)
	watch([() => props.items, () => props.target, () => props.content, () => props.headings, () => props.offset], refresh, {
		flush: 'post',
	})
	watch(
		() => props.active,
		value => {
			activeId.value = value
		},
	)

	return {
		...useStandardBaseComponent('base-anchor', props, ['root', 'list', 'item', 'link']),
		...useAnchorIndicator(() => links.value.findIndex(link => link.id === activeId.value)),
		ui: useUi(props, 'base-anchor'),
		links,
		isActive: (link: AnchorLink): boolean => link.id === activeId.value,
		handleClick(link: AnchorLink, event: MouseEvent): void {
			emit('click', link, event)
			if (event.defaultPrevented || !isPlainClick(event)) return
			event.preventDefault()
			scrollTo(link.id)
		},
		refresh,
		scrollTo,
	}
}
