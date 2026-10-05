import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseAvatarCropper from '../ui/BaseAvatarCropper.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { AVATAR_CROPPER_PARTS } from '../types/BaseAvatarCropper.types'

const SRC = 'data:image/png;base64,AAAA'

async function loadImage(container: Element): Promise<HTMLImageElement> {
	const image = container.querySelector('img') as HTMLImageElement
	Object.defineProperty(image, 'naturalWidth', { value: 800, configurable: true })
	Object.defineProperty(image, 'naturalHeight', { value: 500, configurable: true })
	await fireEvent.load(image)
	return image
}

describe('BaseAvatarCropper: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...AVATAR_CROPPER_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseAvatarCropper, {
			props: { src: SRC, variant: 'outline', customClass: { root: 'own-root', area: 'own-area', zoom: 'own-zoom' }, ui },
		})
		await fireEvent.error(container.querySelector('img') as HTMLImageElement)
		const root = container.querySelector('.base-avatar-cropper')!

		expect(root).toHaveClass('u-root', 'base-avatar-cropper--outline', 'own-root')
		for (const part of AVATAR_CROPPER_PARTS) expect(root.querySelector(`.base-avatar-cropper__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-avatar-cropper__area')).toHaveClass('own-area')
		expect(root.querySelector('.base-avatar-cropper__zoom')).toHaveClass('own-zoom')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseAvatarCropper, {
			props: { src: SRC, ui: { frame: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAvatarCropper: { ui: { frame: 'app', root: 'app-root' } } } })] },
		})
		const root = container.querySelector('.base-avatar-cropper')!

		expect(root).toHaveClass('base-avatar-cropper', 'app-root')
		expect(root.querySelector('.base-avatar-cropper__zoom-label')).toHaveAttribute('class', 'base-avatar-cropper__zoom-label')
		expect(root.querySelector('.base-avatar-cropper__frame')).toHaveAttribute('class', 'base-avatar-cropper__frame app own')
	})
})

describe('BaseAvatarCropper: движение фото', () => {
	it('клавиши и reset — шагом с переходом; перетаскивание, колёсико и ползунок — сразу', async () => {
		const { mount } = await import('@vue/test-utils')
		const { BaseRange } = await import('@components/BaseRange')
		const wrapper = mount(BaseAvatarCropper, { props: { src: SRC }, attachTo: document.body })
		const image = await loadImage(wrapper.element)
		const root = wrapper.element as HTMLElement
		const area = screen.getByRole('group', { name: 'Кадрирование фото' })

		expect(root).not.toHaveClass('base-avatar-cropper--stepping')
		await fireEvent.keyDown(area, { key: '+' })
		expect(root).toHaveClass('base-avatar-cropper--stepping')
		expect(image.style.transform).toMatch(/^translate\(.+\) scale\(.+\)$/)
		await fireEvent.wheel(area, { deltaY: -100 })
		expect(root).not.toHaveClass('base-avatar-cropper--stepping')
		wrapper.vm.reset()
		await wrapper.vm.$nextTick()
		expect(root).toHaveClass('base-avatar-cropper--stepping')
		expect(image.style.transform).toBe('translate(-17.2%, 12.8%) scale(1.344)')
		await fireEvent.pointerDown(area, { button: 0, clientX: 1, clientY: 1 })
		await fireEvent.pointerUp(window)
		expect(root).not.toHaveClass('base-avatar-cropper--stepping')
		await fireEvent.keyDown(area, { key: 'ArrowLeft' })
		await wrapper.findComponent(BaseRange).vm.$emit('update:modelValue', 2)
		await wrapper.vm.$nextTick()
		expect(root).not.toHaveClass('base-avatar-cropper--stepping')
		wrapper.unmount()
	})

	it('новый кадр из v-model — шагом с переходом, новое фото — без перехода', async () => {
		const { container, rerender } = render(BaseAvatarCropper, { props: { src: SRC } })
		const image = await loadImage(container)
		const root = container.firstElementChild!
		await rerender({ src: SRC, crop: { x: 300, y: 125, size: 250 } })

		expect(root).toHaveClass('base-avatar-cropper--stepping')
		expect(image.style.transform).toContain('scale(2.688)')
		await rerender({ src: 'data:image/png;base64,BBBB', crop: { x: 300, y: 125, size: 250 } })
		expect(root).not.toHaveClass('base-avatar-cropper--stepping')
	})

	it('пресет none и «уменьшить движение»: положение фото — конечное сразу после шага', async () => {
		vi.stubGlobal('matchMedia', (query: string) => ({
			matches: query.includes('reduce'),
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		}))
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		const { container } = render(BaseAvatarCropper, { props: { src: SRC }, container: host })
		const image = await loadImage(container)
		await fireEvent.keyDown(screen.getByRole('group', { name: 'Кадрирование фото' }), { key: '0' })

		expect(image.style.transform).toBe('translate(-17.2%, 12.8%) scale(1.344)')
		vi.unstubAllGlobals()
		host.remove()
	})
})
