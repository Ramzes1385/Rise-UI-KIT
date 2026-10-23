import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { UI_FLOW_SERVICES } from '@/locales/messages'
import { flowServices } from '../../model/notations/services'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { SERVICES_ICONS } from '../../model/notations/services/servicesIcons'
import { SERVICES_NODE_KINDS as NODE_KIND_IDS } from '../../types/notations/architecture/services.types'
import { SERVICES_EDGE_KINDS, SERVICES_GROUP_KINDS, SERVICES_NODE_KINDS } from '../../model/notations/services/servicesKinds'

guardConsole()

describe('нотация «Карта сервисов»', () => {
	it('описание нотации: id, название, виды по умолчанию, раскладка, правила и их краткая запись', () => {
		expect(flowServices).toMatchObject({
			id: 'services',
			defaultNodeKind: 'service',
			defaultEdgeKind: 'call',
			layout: { algorithm: 'layered', direction: 'TB', routing: 'curved' },
		})
		expect(flowServices.label()).toBe(UI_FLOW_SERVICES.NAME)
		expect(flowServices.rulesSummary?.()).toBe(UI_FLOW_SERVICES.RULES_SUMMARY)
		expect(flowServices.nodeKinds).toBe(SERVICES_NODE_KINDS)
		expect(flowServices.edgeKinds).toBe(SERVICES_EDGE_KINDS)
		expect(flowServices.groupKinds).toBe(SERVICES_GROUP_KINDS)
		expect(flowServices.rules?.canConnect).toBeTypeOf('function')
		expect('semantics' in flowServices).toBe(false)
	})

	it('виды узлов: по записи на каждый вид, с названием, значком, группой палитры и моделью 3D', () => {
		expect(Object.keys(SERVICES_NODE_KINDS)).toEqual([...NODE_KIND_IDS])
		for (const [id, def] of Object.entries(SERVICES_NODE_KINDS)) {
			expect(def.label(), id).not.toBe('')
			expect(def.icon, id).toBe(SERVICES_ICONS[id as keyof typeof SERVICES_ICONS])
			expect(def.paletteGroup, id).toBeTruthy()
			expect(def.size).toEqual({ width: 160, height: 56 })
		}
	})

	it('все значки видов есть в наборе значков', () => {
		const missing = Object.entries(SERVICES_ICONS).filter(
			([, icon]) => !existsSync(resolve(__dirname, '../../../../icons/svg', `${icon}.svg`)),
		)
		expect(missing).toEqual([])
	})

	it('карточки рисуются HTML, заметка — SVG-фигурой «note» с подписью внутри', () => {
		expect(SERVICES_NODE_KINDS.service).toMatchObject({ render: 'html', shape: { shape: 'round-rect' }, model3d: 'auto' })
		expect(SERVICES_NODE_KINDS.note).toMatchObject({ render: 'svg', shape: { shape: 'note' }, labelPlacement: 'inside' })
		expect(SERVICES_NODE_KINDS.note.model3d).toBeUndefined()
		expect(SERVICES_NODE_KINDS.external.isExternal).toBe(true)
		expect(SERVICES_NODE_KINDS.service.isExternal).toBeUndefined()
	})

	it('у клиента есть свойство «платформа»: веб по умолчанию, выбор веб и мобильное приложение', () => {
		const platform = SERVICES_NODE_KINDS.client.props?.platform
		expect(platform).toMatchObject({ type: 'select', default: 'web' })
		expect(platform?.label()).toBe(UI_FLOW_SERVICES.PROP_PLATFORM)
		expect(platform?.options?.map(option => [option.value, option.label()])).toEqual([
			['web', UI_FLOW_SERVICES.PLATFORM_WEB],
			['mobile', UI_FLOW_SERVICES.PLATFORM_MOBILE],
		])
		expect(SERVICES_NODE_KINDS.service.props).toBeUndefined()
	})

	it('виды связей: вызов, событие, поток данных; различаются штрихом, у данных эффект «прорисовка»', () => {
		expect(Object.keys(SERVICES_EDGE_KINDS)).toEqual(['call', 'event', 'data'])
		expect(SERVICES_EDGE_KINDS.call).toMatchObject({ stroke: 'solid', effect: 'travel' })
		expect(SERVICES_EDGE_KINDS.event).toMatchObject({ stroke: 'dashed', effect: 'travel' })
		expect(SERVICES_EDGE_KINDS.data).toMatchObject({ stroke: 'dotted', effect: 'draw', endMarker: 'open-arrow' })
		expect(SERVICES_EDGE_KINDS.call.label()).toBe(UI_FLOW_SERVICES.EDGE_CALL)
		expect(SERVICES_EDGE_KINDS.event.label()).toBe(UI_FLOW_SERVICES.EDGE_EVENT)
		expect(SERVICES_EDGE_KINDS.data.label()).toBe(UI_FLOW_SERVICES.EDGE_DATA)
	})

	it('виды групп: дорожка и слой — ярусы, зона — пунктирная рамка', () => {
		expect(SERVICES_GROUP_KINDS.lane).toMatchObject({ layout: 'tier', header: 'start', border: 'solid' })
		expect(SERVICES_GROUP_KINDS.layer).toMatchObject({ layout: 'tier', border: 'solid' })
		expect(SERVICES_GROUP_KINDS.zone).toMatchObject({ layout: 'box', header: 'top', border: 'dashed' })
		expect(SERVICES_GROUP_KINDS.lane.label()).toBe(UI_FLOW_SERVICES.GROUP_LANE)
		expect(SERVICES_GROUP_KINDS.layer.label()).toBe(UI_FLOW_SERVICES.GROUP_LAYER)
		expect(SERVICES_GROUP_KINDS.zone.label()).toBe(UI_FLOW_SERVICES.GROUP_ZONE)
	})
})
