import '@testing-library/jest-dom/vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'

vi.mock('../../ui/parts/FlowMap3DDock.vue', async () => {
	const { defineComponent, h } = await import('vue')
	return {
		__esModule: true,
		default: defineComponent({
			emits: ['camera'],
			setup:
				(_props, { emit }) =>
				() =>
					h('div', [
						h('button', { onClick: () => emit('camera', 'нет такого') }, 'чужой'),
						h('button', { onClick: () => emit('camera', 'top') }, 'верх'),
					]),
		}),
	}
})

const env = useFlowMap3DEnvironment()

describe('BaseFlowMap3D: выбор вида камеры', () => {
	it('неизвестный вид из дока игнорируется, известный сообщается', async () => {
		const onCamera = vi.fn()
		await env.renderMap({ 'onUpdate:camera': onCamera })
		await fireEvent.click(screen.getByText('чужой'))
		expect(onCamera).not.toHaveBeenCalled()
		await fireEvent.click(screen.getByText('верх'))
		expect(onCamera).toHaveBeenCalledWith('top')
	})
})
