import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import { render, fireEvent, screen } from '@testing-library/vue'
import FlowInspector3DSection from '../../ui/parts/FlowInspector3DSection.vue'

const PickerStub = defineComponent({
	emits: ['update:modelValue', 'reset'],
	setup:
		(_props, { emit }) =>
		() =>
			h('div', [
				h('button', { onClick: () => emit('update:modelValue', '#112233') }, 'выбрать'),
				h('button', { onClick: () => emit('reset') }, 'сбросить'),
			]),
})

describe('FlowInspector3DSection', () => {
	it('свой цвет и сброс сообщают `tint` со значением и с null', async () => {
		const { emitted } = render(FlowInspector3DSection, {
			props: {
				node: { id: 'a', label: 'Узел', kind: 'service' },
				modelTitle: 'Сервис',
				modelKey: 'service',
				hasSwap: false,
				x: 0,
				y: 0,
			},
			global: { stubs: { BaseColorPicker: PickerStub } },
		})
		await fireEvent.click(screen.getByText('выбрать'))
		await fireEvent.click(screen.getByText('сбросить'))
		expect(emitted().tint).toEqual([['#112233'], [null]])
	})
})
