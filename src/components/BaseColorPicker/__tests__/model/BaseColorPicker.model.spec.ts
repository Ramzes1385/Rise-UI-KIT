import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { render } from '@testing-library/vue'
import { useEyeDropper } from '../../model/useEyeDropper'
import { useColorPicker } from '@composables/form/useColorPicker'
import { useColorPickerArea } from '../../model/useColorPickerArea'
import { useColorPickerFields } from '../../model/useColorPickerFields'
import type { ColorPickerProps } from '../../types/BaseColorPicker.types'

function createPicker() {
	return useColorPicker({ getValue: () => '#ff0000', getFormat: () => 'hex', hasAlpha: () => true, onChange: vi.fn() })
}

describe('BaseColorPicker: model', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('область без элемента не меняет цвет и не начинает перетаскивание окна', () => {
		const picker = createPicker()
		const setSaturationValue = vi.spyOn(picker, 'setSaturationValue')
		const isDragging = ref(false)
		let area: ReturnType<typeof useColorPickerArea> | undefined
		render(
			defineComponent({
				setup() {
					area = useColorPickerArea(picker, isDragging)
					return () => null
				},
			}),
		)

		area!.handleAreaPointerDown(new PointerEvent('pointerdown'))
		expect(setSaturationValue).not.toHaveBeenCalled()
		expect(isDragging.value).toBe(true)
		window.dispatchEvent(new Event('pointerup'))
		expect(isDragging.value).toBe(false)
	})

	it('поле прозрачности меняет альфу, событие без поля ввода игнорируется', () => {
		const picker = createPicker()
		const setAlpha = vi.spyOn(picker, 'setAlpha')
		const props = { formats: ['rgb'], format: 'rgb', hasAlpha: true } as unknown as ColorPickerProps
		const fields = useColorPickerFields(props, picker)
		const alpha = fields.channels.value.find(channel => channel.key === 'a')!
		const input = document.createElement('input')
		input.value = '40'

		fields.handleChannelChange(alpha, { target: input } as unknown as Event)
		fields.handleChannelChange(alpha, { target: document.createElement('div') } as unknown as Event)

		expect(setAlpha).toHaveBeenCalledOnce()
		expect(setAlpha).toHaveBeenCalledWith(0.4)
	})

	it('пипетка без EyeDropper API и без window — недоступна, вызов ничего не делает', async () => {
		const picker = createPicker()
		const setHex = vi.spyOn(picker, 'setHex')

		const dropper = useEyeDropper(picker)
		expect(dropper.isEyeDropperSupported).toBe(false)
		await dropper.pickFromScreen()
		expect(setHex).not.toHaveBeenCalled()

		vi.stubGlobal('window', undefined)
		expect(useEyeDropper(picker).isEyeDropperSupported).toBe(false)
	})
})
