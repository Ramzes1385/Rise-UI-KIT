import '../helpers/lazySettle.test-utils'
import { mount } from '@vue/test-utils'
import BaseFlowMap from '../../ui/BaseFlowMap.vue'
import FlowCanvas from '../../ui/canvas/FlowCanvas.vue'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import type { FlowMapData } from '../../types/data/flowData.types'

guardConsole()

const data: FlowMapData = { version: 1, title: 'Заказы', nodes: [], edges: [] }

function canvasParticles(props: { particles?: boolean | number }): unknown {
	const wrapper = mount(BaseFlowMap, { props: { data, ...props }, global: { stubs: { FlowCanvas: true } } })
	const value = wrapper.findComponent(FlowCanvas).props('particles')
	wrapper.unmount()
	return value
}

describe('BaseFlowMap: проп particles передаётся в холст', () => {
	it('по умолчанию — предел 400', () => {
		expect(canvasParticles({})).toBe(400)
	})

	it('число и false доходят без изменений', () => {
		expect(canvasParticles({ particles: 12 })).toBe(12)
		expect(canvasParticles({ particles: false })).toBe(false)
	})
})
