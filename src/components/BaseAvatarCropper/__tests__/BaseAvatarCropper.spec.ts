import '@testing-library/jest-dom/vitest'
import BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { AvatarCrop } from '../types/BaseAvatarCropper.types'

const SRC = 'data:image/png;base64,AAAA'

async function loadImage(container: Element, size = { width: 800, height: 500 }): Promise<HTMLImageElement> {
	const image = container.querySelector('img') as HTMLImageElement
	Object.defineProperty(image, 'naturalWidth', { value: size.width, configurable: true })
	Object.defineProperty(image, 'naturalHeight', { value: size.height, configurable: true })
	await fireEvent.load(image)
	return image
}

function areaOf(): HTMLElement {
	const area = screen.getByRole('group', { name: 'Кадрирование фото' })
	vi.spyOn(area, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 250, height: 250 } as DOMRect)
	return area
}

const lastCrop = (emitted: Record<string, unknown[][]>) => emitted['update:crop']?.at(-1)?.[0] as AvatarCrop | undefined

describe('BaseAvatarCropper unit', () => {
	it('до загрузки: фото скрыто, ползунок недоступен, подсказка связана с областью', () => {
		const { container } = render(BaseAvatarCropper, { props: { src: SRC } })
		expect(container.firstElementChild).toHaveClass('base-avatar-cropper--loading', 'base-avatar-cropper--square')
		const area = screen.getByRole('group', { name: 'Кадрирование фото' })
		expect(area).toHaveAttribute('aria-roledescription', 'область кадрирования')
		expect(area).toHaveAccessibleDescription(/Стрелки сдвигают фото/)
		expect(area).toHaveAttribute('tabindex', '0')
	})

	it('после загрузки: кадр по центру в v-model, положение фото — transform', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC } })
		const image = await loadImage(container)
		expect(lastCrop(emitted())).toEqual({ x: 150, y: 0, size: 500 })
		expect(image.style.transform).toBe('translate(-17.2%, 12.8%) scale(1.344)')
		expect(container.firstElementChild).not.toHaveClass('base-avatar-cropper--loading')
	})

	it('начальный кадр из v-model не переотправляется', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC, crop: { x: 300, y: 125, size: 250 } } })
		const image = await loadImage(container)
		expect(emitted()['update:crop']).toBeUndefined()
		expect(image.style.transform).toContain('scale(2.688)')
	})

	it('клавиши: стрелки сдвигают фото, плюс и минус меняют масштаб, ноль сбрасывает', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC } })
		await loadImage(container)
		const area = areaOf()
		await fireEvent.keyDown(area, { key: '+' })
		expect(lastCrop(emitted())).toEqual({ x: 173, y: 23, size: 455 })
		await fireEvent.keyDown(area, { key: 'ArrowLeft' })
		expect(lastCrop(emitted())).toEqual({ x: 194, y: 23, size: 455 })
		await fireEvent.keyDown(area, { key: 'ArrowDown', shiftKey: true })
		expect(lastCrop(emitted())).toEqual({ x: 194, y: 0, size: 455 })
		await fireEvent.keyDown(area, { key: '-' })
		expect(lastCrop(emitted())?.size).toBe(500)
		await fireEvent.keyDown(area, { key: '=' })
		await fireEvent.keyDown(area, { key: '0' })
		expect(lastCrop(emitted())).toEqual({ x: 150, y: 0, size: 500 })
		const count = emitted()['update:crop'].length
		await fireEvent.keyDown(area, { key: 'a' })
		expect(emitted()['update:crop']).toHaveLength(count)
	})

	it('колёсико меняет масштаб, горизонтальная прокрутка — нет', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC } })
		await loadImage(container)
		const area = areaOf()
		await fireEvent.wheel(area, { deltaY: -500 })
		expect(lastCrop(emitted())?.size).toBe(184)
		const count = emitted()['update:crop'].length
		await fireEvent.wheel(area, { deltaX: 100, deltaY: 0 })
		expect(emitted()['update:crop']).toHaveLength(count)
	})

	it('перетаскивание: фото едет за указателем до отпускания', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC, crop: { x: 300, y: 125, size: 250 } } })
		await loadImage(container)
		const area = areaOf()
		await fireEvent.pointerDown(area, { button: 0, clientX: 100, clientY: 100 })
		expect(container.firstElementChild).toHaveClass('base-avatar-cropper--dragging')
		await fireEvent.pointerMove(window, { clientX: 142, clientY: 79 })
		expect(lastCrop(emitted())).toEqual({ x: 250, y: 150, size: 250 })
		await fireEvent.pointerUp(window)
		await fireEvent.pointerMove(window, { clientX: 0, clientY: 0 })
		expect(emitted()['update:crop']).toHaveLength(1)
		expect(container.firstElementChild).not.toHaveClass('base-avatar-cropper--dragging')
	})

	it('новое фото во время перетаскивания: движение не меняет кадр, пока фото не загрузится', async () => {
		const { container, emitted, rerender } = render(BaseAvatarCropper, { props: { src: SRC } })
		await loadImage(container)
		const area = areaOf()
		await fireEvent.pointerDown(area, { button: 0, clientX: 100, clientY: 100 })
		await rerender({ src: 'data:image/png;base64,BBBB' })
		await fireEvent.pointerMove(window, { clientX: 150, clientY: 150 })
		await fireEvent.pointerUp(window)
		expect(emitted()['update:crop']).toHaveLength(1)
	})

	it('отключено и до загрузки: перетаскивание, клавиши и колёсико не работают', async () => {
		const { container, emitted, rerender } = render(BaseAvatarCropper, { props: { src: SRC } })
		const area = areaOf()
		await fireEvent.keyDown(area, { key: '+' })
		await fireEvent.pointerDown(area, { button: 0, clientX: 1, clientY: 1 })
		await loadImage(container)
		await rerender({ src: SRC, isDisabled: true })
		await fireEvent.keyDown(area, { key: '+' })
		await fireEvent.wheel(area, { deltaY: -100 })
		await fireEvent.pointerDown(area, { button: 0, clientX: 1, clientY: 1 })
		await fireEvent.pointerDown(area, { button: 2, clientX: 1, clientY: 1 })
		expect(emitted()['update:crop']).toHaveLength(1)
		expect(area).not.toHaveAttribute('tabindex')
		expect(area).toHaveAttribute('aria-disabled', 'true')
	})

	it('новый кадр из v-model двигает фото без события, новое фото — снова загрузка', async () => {
		const { container, emitted, rerender } = render(BaseAvatarCropper, { props: { src: SRC } })
		const image = await loadImage(container)
		await rerender({ src: SRC, crop: { x: 300, y: 125, size: 250 } })
		expect(image.style.transform).toContain('scale(2.688)')
		await rerender({ src: SRC, crop: { x: 300, y: 125, size: 250 } })
		expect(emitted()['update:crop']).toHaveLength(1)
		await rerender({ src: 'data:image/png;base64,BBBB', crop: undefined })
		expect(container.firstElementChild).toHaveClass('base-avatar-cropper--loading')
	})

	it('фото не загрузилось: сообщение и событие error', async () => {
		const { container, emitted } = render(BaseAvatarCropper, { props: { src: SRC } })
		await fireEvent.error(container.querySelector('img') as HTMLImageElement)
		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить фото')
		expect(emitted().error).toHaveLength(1)
	})

	it('ползунок «Масштаб» меняет увеличение', async () => {
		const { mount } = await import('@vue/test-utils')
		const { BaseRange } = await import('@components/BaseRange')
		const wrapper = mount(BaseAvatarCropper, { props: { src: SRC } })
		await loadImage(wrapper.element)
		await wrapper.findComponent(BaseRange).vm.$emit('update:modelValue', 2)
		expect(wrapper.emitted('update:crop')?.at(-1)?.[0]).toEqual({ x: 275, y: 125, size: 250 })
		wrapper.unmount()
	})

	it('getBlob и reset через ref; до загрузки getBlob — null', async () => {
		const { mount } = await import('@vue/test-utils')
		const wrapper = mount(BaseAvatarCropper, { props: { src: SRC, crop: { x: 0, y: 0, size: 250 } } })
		await expect(wrapper.vm.getBlob()).resolves.toBeNull()
		wrapper.vm.reset()
		expect(wrapper.emitted('update:crop')).toBeUndefined()
		await loadImage(wrapper.element)
		const context = { beginPath: vi.fn(), arc: vi.fn(), clip: vi.fn(), drawImage: vi.fn() }
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never)
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['x'], { type: 'image/png' })))
		expect((await wrapper.vm.getBlob())?.type).toBe('image/png')
		expect(context.drawImage).toHaveBeenCalledWith(expect.any(HTMLImageElement), 0, 0, 250, 250, 0, 0, 256, 256)
		wrapper.vm.reset()
		expect(wrapper.emitted('update:crop')?.at(-1)?.[0]).toEqual({ x: 150, y: 0, size: 500 })
		vi.restoreAllMocks()
		wrapper.unmount()
	})

	it('размер области, форма, вариант и customClass', () => {
		const { container } = render(BaseAvatarCropper, {
			props: { src: SRC, size: 200, shape: 'square', variant: 'outline', customClass: { root: 'my-root', area: 'my-area' } },
		})
		const root = container.firstElementChild as HTMLElement
		expect(root.style.getPropertyValue('--cropper-size')).toBe('200px')
		expect(root).toHaveClass('base-avatar-cropper--square', 'base-avatar-cropper--outline', 'my-root')
		expect(container.querySelector('.base-avatar-cropper__area')).toHaveClass('my-area')
	})
})
