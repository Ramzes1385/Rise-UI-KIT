import { UI_FLOW_C4 } from '@/locales/messages'
import type { C4NodeKind } from '../../../types/notations/architecture/c4.types'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef, FlowPropDef } from '../../../types/api/flowNotation.types'

const INK = 'var(--rise-flow-ink)'
const PAPER = 'var(--rise-flow-paper)'
const CARD_SIZE = { width: 176, height: 72 }

const TECHNOLOGY: FlowPropDef = { label: () => UI_FLOW_C4.PROP_TECHNOLOGY, type: 'text' }

function card(
	token: string,
	text: string,
	options: Pick<FlowNodeKindDef, 'label' | 'icon' | 'model3d'> & Partial<FlowNodeKindDef>,
): FlowNodeKindDef {
	return {
		render: 'html',
		size: CARD_SIZE,
		paletteGroup: 'c4',
		shape: { shape: 'round-rect', fill: `var(${token})`, stroke: `color-mix(in srgb, var(${token}) 55%, ${INK})`, text },
		...options,
	}
}

export const c4NodeKinds: Record<C4NodeKind, FlowNodeKindDef> = {
	person: card('--rise-flow-c4-person', PAPER, { label: () => UI_FLOW_C4.PERSON, icon: 'user', model3d: 'user' }),
	'software-system': card('--rise-flow-c4-system', PAPER, {
		label: () => UI_FLOW_C4.SOFTWARE_SYSTEM,
		icon: 'server',
		model3d: 'auto',
	}),
	container: card('--rise-flow-c4-container', INK, {
		label: () => UI_FLOW_C4.CONTAINER,
		icon: 'box',
		model3d: 'auto',
		props: { technology: TECHNOLOGY },
	}),
	component: card('--rise-flow-c4-component', INK, {
		label: () => UI_FLOW_C4.COMPONENT,
		icon: 'code',
		model3d: 'auto',
		props: { technology: TECHNOLOGY },
	}),
	'external-person': card('--rise-flow-c4-external', INK, {
		label: () => UI_FLOW_C4.EXTERNAL_PERSON,
		icon: 'user',
		isExternal: true,
		model3d: 'user',
	}),
	'external-system': card('--rise-flow-c4-external', INK, {
		label: () => UI_FLOW_C4.EXTERNAL_SYSTEM,
		icon: 'cloud',
		isExternal: true,
		model3d: 'cloud',
	}),
}

const boundary = (label: () => string): FlowGroupKindDef => ({ label, layout: 'box', header: 'top', border: 'dashed' })

export const c4GroupKinds: Record<string, FlowGroupKindDef> = {
	'enterprise-boundary': boundary(() => UI_FLOW_C4.ENTERPRISE_BOUNDARY),
	'system-boundary': boundary(() => UI_FLOW_C4.SYSTEM_BOUNDARY),
	'container-boundary': boundary(() => UI_FLOW_C4.CONTAINER_BOUNDARY),
}

export const c4EdgeKinds: Record<string, FlowEdgeKindDef> = {
	relationship: {
		label: () => UI_FLOW_C4.RELATIONSHIP,
		stroke: 'dashed',
		endMarker: 'arrow',
		routing: 'orthogonal',
		traffic: { rate: 0.5, speed: 110 },
		effect: 'travel',
	},
}
