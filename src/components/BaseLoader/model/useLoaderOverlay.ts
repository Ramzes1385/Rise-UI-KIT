import { onBeforeUnmount, onMounted, type Ref, watch } from 'vue'
import type { LoaderCoveredElement as CoveredElement } from '../types/BaseLoader.types'

function isCoverable(element: Element, root: HTMLElement): boolean {
	return element !== root && !element.hasAttribute('inert') && !element.classList.contains('base-loader--overlay')
}

function cover(root: HTMLElement): CoveredElement[] {
	const siblings = Array.from(root.parentElement?.children ?? []).filter(element => isCoverable(element, root))
	return siblings.map(element => {
		const busy = element.getAttribute('aria-busy')
		element.setAttribute('inert', '')
		element.setAttribute('aria-busy', 'true')
		return { element, busy }
	})
}

function uncover(covered: CoveredElement[]): void {
	covered.forEach(({ element, busy }) => {
		element.removeAttribute('inert')
		if (busy === null) element.removeAttribute('aria-busy')
		else element.setAttribute('aria-busy', busy)
	})
}

export function useLoaderOverlay(rootRef: Ref<HTMLElement | null>, getIsOverlay: () => boolean): void {
	let covered: CoveredElement[] = []
	const release = (): void => {
		uncover(covered)
		covered = []
	}

	const apply = (): void => {
		release()
		if (rootRef.value && getIsOverlay()) covered = cover(rootRef.value)
	}

	onMounted(apply)
	watch(getIsOverlay, apply, { flush: 'post' })
	onBeforeUnmount(release)
}
