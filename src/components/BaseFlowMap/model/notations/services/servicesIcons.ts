import type { ServicesNodeKind } from '../../../types/notations/architecture/services.types'

export const SERVICES_ICONS: Record<ServicesNodeKind, string> = {
	user: 'user',
	client: 'monitor',
	gateway: 'shield',
	balancer: 'shuffle',
	service: 'server',
	function: 'code',
	database: 'database',
	cache: 'zap',
	queue: 'inbox',
	storage: 'hard-drive',
	external: 'cloud',
	note: 'sticky-note',
}
