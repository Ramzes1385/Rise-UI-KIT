import '@testing-library/jest-dom/vitest'
import BaseSignaturePad from '../ui/BaseSignaturePad.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const STROKE = [
	{ x: 10, y: 20 },
	{ x: 50, y: 60 },
]

function fitRect(surface: Element): Element {
	vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 400, height: 160 } as DOMRect)
	return surface
}

async function draw(surface: Element, points: [number, number][]): Promise<void> {
	const [[startX, startY], ...rest] = points
	fitRect(surface)
	await fireEvent.pointerDown(surface, { button: 0, clientX: startX, clientY: startY })
	for (const [clientX, clientY] of rest) await fireEvent.pointerMove(window, { clientX, clientY })
	await fireEvent.pointerUp(window)
}

describe('BaseSignaturePad unit', () => {
	it('группа «Подпись» с пустой картинкой, подсказкой и отключёнными кнопками', () => {
		render(BaseSignaturePad)
		expect(screen.getByRole('group', { name: 'Подпись' })).toBeInTheDocument()
		expect(screen.getByRole('img', { name: 'Подписи нет' })).toBeInTheDocument()
		expect(screen.getByText('Распишитесь мышью, пальцем или пером')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Отменить штрих' })).toBeDisabled()
		expect(screen.getByRole('button', { name: 'Очистить' })).toBeDisabled()
	})

	it('label — видимая подпись и имя группы, placeholder — своя подсказка', () => {
		render(BaseSignaturePad, { props: { label: 'Подпись клиента', placeholder: 'Распишитесь здесь' } })
		expect(screen.getByRole('group', { name: 'Подпись клиента' })).toBeInTheDocument()
		expect(screen.getByText('Распишитесь здесь')).toBeInTheDocument()
	})

	it('штрих: нажатие, движение и отпускание дают штрих в v-model и change', async () => {
		const { emitted } = render(BaseSignaturePad)
		await draw(screen.getByRole('img'), [
			[10, 20],
			[50, 60],
			[50.5, 60.5],
			[90, 30],
		])
		const strokes = [
			[
				{ x: 10, y: 20 },
				{ x: 50, y: 60 },
				{ x: 90, y: 30 },
			],
		]
		expect(emitted()['update:modelValue']).toEqual([[strokes]])
		expect(emitted().change).toEqual([[strokes]])
	})

	it('во время штриха путь рисуется сразу, картинка называет число штрихов', async () => {
		const { container, emitted } = render(BaseSignaturePad, { props: { modelValue: [STROKE] } })
		const surface = fitRect(screen.getByRole('img', { name: 'Подпись: 1 штрих' }))
		await fireEvent.pointerDown(surface, { button: 0, clientX: 100, clientY: 100 })
		expect(screen.getByRole('img', { name: 'Подпись: 2 штриха' })).toBeInTheDocument()
		expect(container.querySelector('path')).toHaveAttribute('d', 'M10 20L50 60M100 100h0.1')
		await fireEvent.pointerDown(surface, { button: 0, clientX: 5, clientY: 5 })
		expect(container.querySelector('path')).toHaveAttribute('d', 'M10 20L50 60M100 100h0.1')
		await fireEvent.pointerUp(window)
		expect(emitted()['update:modelValue']).toEqual([[[STROKE, [{ x: 100, y: 100 }]]]])
		expect(container.querySelector('path')).toHaveAttribute('d', 'M10 20L50 60')
	})

	it('другой указатель во время штриха не продолжает и не заканчивает его', async () => {
		const { emitted } = render(BaseSignaturePad)
		const surface = fitRect(screen.getByRole('img'))
		await fireEvent.pointerDown(surface, { button: 0, pointerId: 1, clientX: 10, clientY: 10 })
		await fireEvent.pointerMove(window, { pointerId: 2, clientX: 300, clientY: 100 })
		await fireEvent.pointerUp(window, { pointerId: 2 })
		expect(emitted()['update:modelValue']).toBeUndefined()
		await fireEvent.pointerCancel(window, { pointerId: 1 })
		expect(emitted()['update:modelValue']).toEqual([[[[{ x: 10, y: 10 }]]]])
	})

	it('правая кнопка и отключённое поле не рисуют; движение без нажатия ничего не делает', async () => {
		const { emitted, rerender } = render(BaseSignaturePad)
		await fireEvent.pointerDown(screen.getByRole('img'), { button: 2, clientX: 10, clientY: 10 })
		await fireEvent.pointerMove(window, { clientX: 20, clientY: 20 })
		await fireEvent.pointerUp(window)
		await rerender({ isDisabled: true })
		await draw(screen.getByRole('img'), [
			[10, 20],
			[30, 40],
		])
		expect(emitted()['update:modelValue']).toBeUndefined()
		expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
	})

	it('«Отменить штрих» убирает последний штрих, «Очистить» — все', async () => {
		const other = [{ x: 1, y: 1 }]
		const { emitted } = render(BaseSignaturePad, { props: { modelValue: [STROKE, other] } })
		await fireEvent.click(screen.getByRole('button', { name: 'Отменить штрих' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Очистить' }))
		expect(emitted()['update:modelValue']).toEqual([[[STROKE]], [[]]])
	})

	it('отключённое поле: кнопки недоступны, методы через ref ничего не меняют', async () => {
		const { mount } = await import('@vue/test-utils')
		const wrapper = mount(BaseSignaturePad, { props: { modelValue: [STROKE], isDisabled: true } })
		expect(wrapper.findAll('button').every(button => button.attributes('disabled') !== undefined)).toBe(true)
		wrapper.vm.undo()
		wrapper.vm.clear()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		await wrapper.setProps({ modelValue: [], isDisabled: false })
		wrapper.vm.undo()
		wrapper.vm.clear()
		expect(wrapper.emitted('update:modelValue')).toBeUndefined()
		wrapper.unmount()
	})

	it('ошибка: красная рамка и описание группы', () => {
		render(BaseSignaturePad, { props: { error: 'Распишитесь' } })
		expect(screen.getByRole('group')).toHaveAccessibleDescription('Распишитесь')
		expect(screen.getByRole('group')).toHaveClass('base-signature-pad--error')
	})

	it('размер поля, пропорции, цвет чернил и толщина линии', () => {
		const { container } = render(BaseSignaturePad, {
			props: { modelValue: [STROKE], width: 300, height: 100, penColor: '#1d4ed8', lineWidth: 3 },
		})
		const root = container.firstElementChild as HTMLElement
		expect(root.style.getPropertyValue('--signature-width')).toBe('300px')
		expect(root.style.getPropertyValue('--signature-ratio')).toBe('300 / 100')
		expect(root.style.getPropertyValue('--signature-pen')).toBe('#1d4ed8')
		expect(container.querySelector('svg')).toHaveAttribute('viewBox', '0 0 300 100')
		expect(container.querySelector('path')).toHaveAttribute('stroke-width', '3')
	})

	it('toSvg через ref: цвет из penColor или чёрный, свой цвет и фон из параметров', async () => {
		const { mount } = await import('@vue/test-utils')
		const wrapper = mount(BaseSignaturePad, { props: { modelValue: [STROKE] } })
		expect(wrapper.vm.toSvg()).toContain('stroke="#000000"')
		expect(wrapper.vm.toSvg({ color: '#ff0000', background: '#ffffff' })).toContain('stroke="#ff0000"')
		await wrapper.setProps({ penColor: '#1d4ed8' })
		expect(wrapper.vm.toSvg()).toContain('stroke="#1d4ed8"')
		await expect(wrapper.vm.toPng()).resolves.toBeNull()
		wrapper.unmount()
	})

	it('вариант и customClass', () => {
		const { container } = render(BaseSignaturePad, {
			props: { variant: 'soft', customClass: { root: 'my-root', surface: 'my-surface' } },
		})
		expect(container.firstElementChild).toHaveClass('base-signature-pad--soft', 'my-root')
		expect(container.querySelector('.base-signature-pad__surface')).toHaveClass('my-surface')
	})
})
