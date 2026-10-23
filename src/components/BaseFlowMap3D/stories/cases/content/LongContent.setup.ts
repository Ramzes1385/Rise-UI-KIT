import type { FlowMapData, FlowNode } from '@components/BaseFlowMap'

const TEAMS = ['Заказы', 'Каталог', 'Платежи', 'Доставка', 'Склад', 'Поддержка', 'Аналитика', 'Рекомендации']
const ROLES = [
	'Сервис обработки заказов',
	'База данных истории статусов',
	'Очередь событий оформления',
	'Шлюз внешних партнёрских интеграций',
	'Кеш остатков и цен',
	'Сервис расчёта стоимости доставки',
	'Планировщик фоновых задач',
	'Хранилище документов и квитанций',
]
const KINDS = ['service', 'database', 'queue', 'gateway', 'cache', 'service', 'service', 'database']

export function setup() {
	const nodes: FlowNode[] = TEAMS.flatMap((team, teamIndex) =>
		ROLES.map((role, roleIndex) => ({
			id: `n-${teamIndex}-${roleIndex}`,
			kind: KINDS[roleIndex],
			label: `${role} команды «${team}»`,
			group: `team-${teamIndex}`,
			status: (teamIndex + roleIndex) % 11 === 0 ? 'warning' : 'ok',
		})),
	)
	const data: FlowMapData = {
		version: 1,
		notation: 'services',
		title: 'Платформа интернет-магазина: 64 узла',
		layout: { algorithm: 'layered', direction: 'LR', routing: 'curved' },
		groups: TEAMS.map((team, index) => ({ id: `team-${index}`, kind: 'lane', label: `Команда «${team}»`, order: index })),
		nodes,
		edges: nodes.flatMap((node, index) =>
			index % ROLES.length === ROLES.length - 1
				? []
				: [{ id: `e-${index}`, kind: 'call', source: node.id, target: nodes[index + 1].id }],
		),
	}

	return { data }
}
