import { UI_FLOW_EVENT_STORMING } from '@/locales/messages'
import type { EventStormingNodeKind } from '../../../types/notations/architecture/eventStorming.types'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef } from '../../../types/api/flowNotation.types'

const INK = 'var(--rise-flow-ink)'
const STICKER = { width: 148, height: 76 }

function sticker(token: string, options: Pick<FlowNodeKindDef, 'label' | 'model3d'> & Partial<FlowNodeKindDef>): FlowNodeKindDef {
	return {
		render: 'html',
		size: STICKER,
		paletteGroup: 'event-storming',
		shape: { shape: 'note', fill: `var(${token})`, stroke: `color-mix(in srgb, var(${token}) 60%, ${INK})`, text: INK },
		...options,
	}
}

export const eventStormingNodeKinds: Record<EventStormingNodeKind, FlowNodeKindDef> = {
	'domain-event': sticker('--rise-flow-es-event', { label: () => UI_FLOW_EVENT_STORMING.DOMAIN_EVENT, model3d: 'auto' }),
	command: sticker('--rise-flow-es-command', { label: () => UI_FLOW_EVENT_STORMING.COMMAND, model3d: 'auto' }),
	actor: sticker('--rise-flow-es-actor', {
		label: () => UI_FLOW_EVENT_STORMING.ACTOR,
		size: { width: 112, height: 64 },
		model3d: 'user',
	}),
	aggregate: sticker('--rise-flow-es-aggregate', {
		label: () => UI_FLOW_EVENT_STORMING.AGGREGATE,
		size: { width: 164, height: 76 },
		model3d: 'auto',
	}),
	policy: sticker('--rise-flow-es-policy', { label: () => UI_FLOW_EVENT_STORMING.POLICY, model3d: 'auto' }),
	'read-model': sticker('--rise-flow-es-read-model', { label: () => UI_FLOW_EVENT_STORMING.READ_MODEL, model3d: 'auto' }),
	'external-system': sticker('--rise-flow-es-external', {
		label: () => UI_FLOW_EVENT_STORMING.EXTERNAL_SYSTEM,
		isExternal: true,
		model3d: 'cloud',
	}),
	hotspot: sticker('--rise-flow-es-hotspot', { label: () => UI_FLOW_EVENT_STORMING.HOTSPOT, model3d: 'auto' }),
	opportunity: sticker('--rise-flow-es-opportunity', { label: () => UI_FLOW_EVENT_STORMING.OPPORTUNITY, model3d: 'auto' }),
}

export const eventStormingGroupKinds: Record<string, FlowGroupKindDef> = {
	context: { label: () => UI_FLOW_EVENT_STORMING.CONTEXT, layout: 'box', header: 'top', border: 'dashed' },
}

export const eventStormingEdgeKinds: Record<string, FlowEdgeKindDef> = {
	flow: {
		label: () => UI_FLOW_EVENT_STORMING.FLOW,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'curved',
		traffic: { rate: 0.5, speed: 110 },
		effect: 'travel',
	},
}
