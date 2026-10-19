import { defineComponent, h } from 'vue'
import { render } from '@testing-library/vue'
import { useFlowDetails } from '../../../model/panels/useFlowDetails'
import { createFakeContext, provideContext } from '../../fixtures/panelsContext'

function setup(options: Parameters<typeof createFakeContext>[0] = {}) {
	const fake = createFakeContext(options)
	let result!: ReturnType<typeof useFlowDetails>
	const Host = defineComponent({
		setup() {
			result = useFlowDetails()
			return () => h('div')
		},
	})
	render(Host, { global: provideContext(fake.context) })
	return { ...fake, result }
}

describe('useFlowDetails: свойства слота details', () => {
	it('для узла слот получает цель и узел, для связи — цель и связь; закрытие сбрасывает цель', () => {
		const { result, details, openDetails } = setup({ details: { entity: 'node', id: 'api' } })
		expect(result.slotProps.value).toMatchObject({ target: { entity: 'node', id: 'api' }, node: { id: 'api' }, edge: undefined })
		details.value = { entity: 'edge', id: 'e1' }
		expect(result.slotProps.value).toMatchObject({ target: { entity: 'edge', id: 'e1' }, node: undefined, edge: { id: 'e1' } })
		result.slotProps.value.close()
		expect(openDetails).toHaveBeenCalledWith(null)
	})

	it('без цели ни узла, ни связи нет', () => {
		const { result } = setup()
		expect(result.slotProps.value.node).toBeUndefined()
		expect(result.slotProps.value.edge).toBeUndefined()
	})
})
