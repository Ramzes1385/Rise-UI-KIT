const GLYPHS: Record<string, string> = {
	server: 'M3.5 2.5h9a1.25 1.25 0 0 1 1.25 1.25v2a1.25 1.25 0 0 1-1.25 1.25h-9A1.25 1.25 0 0 1 2.25 5.75v-2A1.25 1.25 0 0 1 3.5 2.5zM3.5 9h9a1.25 1.25 0 0 1 1.25 1.25v2a1.25 1.25 0 0 1-1.25 1.25h-9a1.25 1.25 0 0 1-1.25-1.25v-2A1.25 1.25 0 0 1 3.5 9zM5 4.75h.01M5 11.25h.01',
	web: 'M3.5 3h9A1.5 1.5 0 0 1 14 4.5V10a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 10V4.5A1.5 1.5 0 0 1 3.5 3zM5.5 14h5M8 11.5V14',
	mobile: 'M6.25 1.5h3.5a1.75 1.75 0 0 1 1.75 1.75v9.5a1.75 1.75 0 0 1-1.75 1.75h-3.5A1.75 1.75 0 0 1 4.5 12.75v-9.5A1.75 1.75 0 0 1 6.25 1.5zM7.25 12.25h1.5',
	gateway: 'M2 4.5h3.5l5 7H14M2 11.5h3.5l1.25-1.75M9.25 6.25l1.25-1.75H14M12 2.5l2 2-2 2M12 9.5l2 2-2 2',
	auth: 'M8 1.75 13 3.6v3.9c0 3-2.1 5.35-5 6.75-2.9-1.4-5-3.75-5-6.75V3.6zM5.75 8l1.5 1.5 3-3',
	service: 'M8 1.75 13.5 4.6v6.8L8 14.25 2.5 11.4V4.6zM2.5 4.6 8 7.45l5.5-2.85M8 7.45v6.8',
	card: 'M3.5 3.5h9a1.75 1.75 0 0 1 1.75 1.75v5.5a1.75 1.75 0 0 1-1.75 1.75h-9a1.75 1.75 0 0 1-1.75-1.75v-5.5A1.75 1.75 0 0 1 3.5 3.5zM1.75 6.75h12.5M4.5 10h2.5',
	globe: 'M14.25 8A6.25 6.25 0 1 1 1.75 8a6.25 6.25 0 0 1 12.5 0zM1.75 8h12.5M8 1.75c1.75 1.85 2.6 3.9 2.6 6.25S9.75 12.4 8 14.25C6.25 12.4 5.4 10.35 5.4 8S6.25 3.6 8 1.75z',
	bell: 'M4 6.75a4 4 0 0 1 8 0c0 3.25 1.5 4.5 1.5 4.5h-11S4 10 4 6.75zM6.6 13.6a1.5 1.5 0 0 0 2.8 0',
	bolt: 'M9.25 1.5 3.5 9.25h4.25L6.75 14.5l5.75-7.75H8.25z',
	database:
		'M13.25 3.75c0 1.1-2.35 2-5.25 2s-5.25-.9-5.25-2 2.35-2 5.25-2 5.25.9 5.25 2zM2.75 3.75v8.5c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2v-8.5M2.75 8c0 1.1 2.35 2 5.25 2s5.25-.9 5.25-2',
	queue: 'M8 1.75 14.25 5 8 8.25 1.75 5zM1.75 8.1 8 11.35l6.25-3.25M1.75 11.1 8 14.35l6.25-3.25',
}

const ALIASES: Record<string, string> = {
	db: 'database',
	postgres: 'database',
	storage: 'database',
	cache: 'bolt',
	redis: 'bolt',
	kafka: 'queue',
	layers: 'queue',
	broker: 'queue',
	shield: 'auth',
	box: 'service',
	payments: 'card',
	bank: 'globe',
	external: 'globe',
	notify: 'bell',
	monitor: 'web',
	phone: 'mobile',
	route: 'gateway',
}

export function glyphPath(name: string | null | undefined): string | null {
	if (!name) return null
	return GLYPHS[ALIASES[name] ?? name] ?? null
}
