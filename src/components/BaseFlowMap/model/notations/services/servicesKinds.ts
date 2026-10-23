import { SERVICES_ICONS } from './servicesIcons'
import { UI_FLOW_SERVICES } from '@/locales/messages'
import { SERVICES_PLATFORMS } from '../../../types/notations/architecture/services.types'
import type { ServicesNodeKind, ServicesPlatform } from '../../../types/notations/architecture/services.types'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef, FlowPropDef } from '../../../types/api/flowNotation.types'

const CARD_SIZE = { width: 160, height: 56 }

const PLATFORM_LABELS: Record<ServicesPlatform, () => string> = {
	web: () => UI_FLOW_SERVICES.PLATFORM_WEB,
	mobile: () => UI_FLOW_SERVICES.PLATFORM_MOBILE,
}

const PLATFORM_PROP: FlowPropDef = {
	label: () => UI_FLOW_SERVICES.PROP_PLATFORM,
	type: 'select',
	options: SERVICES_PLATFORMS.map(value => ({ value, label: PLATFORM_LABELS[value] })),
	default: 'web',
}

function card(
	kind: ServicesNodeKind,
	options: Pick<FlowNodeKindDef, 'label' | 'paletteGroup' | 'model3d'> & Partial<FlowNodeKindDef>,
): FlowNodeKindDef {
	return { render: 'html', shape: { shape: 'round-rect' }, size: CARD_SIZE, icon: SERVICES_ICONS[kind], ...options }
}

export const SERVICES_NODE_KINDS: Record<ServicesNodeKind, FlowNodeKindDef> = {
	user: card('user', { label: () => UI_FLOW_SERVICES.NODE_USER, paletteGroup: 'clients', model3d: 'user' }),
	client: card('client', {
		label: () => UI_FLOW_SERVICES.NODE_CLIENT,
		paletteGroup: 'clients',
		model3d: 'auto',
		props: { platform: PLATFORM_PROP },
	}),
	gateway: card('gateway', { label: () => UI_FLOW_SERVICES.NODE_GATEWAY, paletteGroup: 'perimeter', model3d: 'gateway' }),
	balancer: card('balancer', { label: () => UI_FLOW_SERVICES.NODE_BALANCER, paletteGroup: 'perimeter', model3d: 'scales' }),
	service: card('service', { label: () => UI_FLOW_SERVICES.NODE_SERVICE, paletteGroup: 'services', model3d: 'auto' }),
	function: card('function', { label: () => UI_FLOW_SERVICES.NODE_FUNCTION, paletteGroup: 'services', model3d: 'auto' }),
	database: card('database', { label: () => UI_FLOW_SERVICES.NODE_DATABASE, paletteGroup: 'data', model3d: 'db' }),
	cache: card('cache', { label: () => UI_FLOW_SERVICES.NODE_CACHE, paletteGroup: 'data', model3d: 'ram' }),
	queue: card('queue', { label: () => UI_FLOW_SERVICES.NODE_QUEUE, paletteGroup: 'data', model3d: 'conveyor' }),
	storage: card('storage', { label: () => UI_FLOW_SERVICES.NODE_STORAGE, paletteGroup: 'data', model3d: 'bucket' }),
	external: card('external', {
		label: () => UI_FLOW_SERVICES.NODE_EXTERNAL,
		paletteGroup: 'services',
		model3d: 'cloud',
		isExternal: true,
	}),
	note: {
		label: () => UI_FLOW_SERVICES.NODE_NOTE,
		render: 'svg',
		shape: { shape: 'note', fill: 'var(--rise-bg-muted)', stroke: 'var(--rise-border-accented)' },
		size: CARD_SIZE,
		labelPlacement: 'inside',
		icon: SERVICES_ICONS.note,
		paletteGroup: 'notes',
	},
}

export const SERVICES_EDGE_KINDS: Record<string, FlowEdgeKindDef> = {
	call: {
		label: () => UI_FLOW_SERVICES.EDGE_CALL,
		stroke: 'solid',
		endMarker: 'arrow',
		routing: 'curved',
		traffic: { rate: 1, speed: 120 },
		effect: 'travel',
	},
	event: {
		label: () => UI_FLOW_SERVICES.EDGE_EVENT,
		stroke: 'dashed',
		endMarker: 'arrow',
		color: 'var(--rise-flow-map-edge-async-border, var(--rise-warning))',
		routing: 'curved',
		traffic: { rate: 0.6, speed: 90 },
		effect: 'travel',
	},
	data: {
		label: () => UI_FLOW_SERVICES.EDGE_DATA,
		stroke: 'dotted',
		endMarker: 'open-arrow',
		routing: 'curved',
		traffic: { rate: 0.5, speed: 80 },
		effect: 'draw',
	},
}

export const SERVICES_GROUP_KINDS: Record<string, FlowGroupKindDef> = {
	lane: { label: () => UI_FLOW_SERVICES.GROUP_LANE, layout: 'tier', header: 'start', border: 'solid' },
	layer: { label: () => UI_FLOW_SERVICES.GROUP_LAYER, layout: 'tier', header: 'start', border: 'solid' },
	zone: { label: () => UI_FLOW_SERVICES.GROUP_ZONE, layout: 'box', header: 'top', border: 'dashed' },
}
