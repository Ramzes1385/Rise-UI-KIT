import { nextTick } from 'vue'
import type { FlowEditEnv } from '../../../types/internal/edit/flowEdit.types'

const VIEWPORT = '[role="graphics-document"]'

function isLost(active: Element | null): boolean {
	return !active || active === document.body || !active.isConnected
}

export async function restoreFocus(env: FlowEditEnv): Promise<void> {
	await nextTick()
	const root = env.element.value
	if (!root || !isLost(document.activeElement)) return
	const target = root.querySelector<HTMLElement>('[data-flow-id][tabindex="0"]') ?? root.querySelector<HTMLElement>(VIEWPORT) ?? root
	if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
	target.focus({ preventScroll: true })
}
