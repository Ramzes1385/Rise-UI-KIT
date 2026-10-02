import { nextTick, ref } from 'vue'
import { useImageGallery } from '../useImageGallery'
import type { ImageGallerySource } from '../types/useImageGallery.types'

const IMAGES = ['a.jpg', 'b.jpg', 'c.jpg']

function setup(images: { list?: ImageGallerySource[] } = { list: IMAGES }) {
	const gallery = ref(images.list)
	const resetZoom = vi.fn<() => void>()
	const state = useImageGallery({ gallery: () => gallery.value, src: () => 'main.jpg', resetZoom })
	return { state, gallery, resetZoom }
}

describe('useImageGallery', () => {
	it('без галереи показывает основное изображение и не листает', () => {
		const { state, resetZoom } = setup({})

		expect(state.galleryList.value).toEqual([])
		expect(state.hasGallery.value).toBe(false)
		expect(state.currentZoomSrc.value).toBe('main.jpg')

		state.handleGalleryNext()
		state.handleGalleryPrev()

		expect(state.galleryIndex.value).toBe(0)
		expect(resetZoom).not.toHaveBeenCalled()
	})

	it('одно изображение — не галерея', () => {
		const { state } = setup({ list: ['only.jpg'] })

		expect(state.hasGallery.value).toBe(false)
		expect(state.hasGalleryNext.value).toBe(false)
		expect(state.currentZoomSrc.value).toBe('main.jpg')
	})

	it('листает вперёд и назад в пределах галереи и сбрасывает масштаб', () => {
		const { state, resetZoom } = setup()

		expect(state.hasGalleryPrev.value).toBe(false)
		expect(state.currentZoomSrc.value).toBe('a.jpg')

		state.handleGalleryNext()
		state.handleGalleryNext()
		expect(state.currentZoomSrc.value).toBe('c.jpg')
		expect(state.hasGalleryNext.value).toBe(false)

		state.handleGalleryNext()
		expect(state.galleryIndex.value).toBe(2)

		state.handleGalleryPrev()
		expect(state.currentZoomSrc.value).toBe('b.jpg')
		expect(state.hasGalleryPrev.value).toBe(true)
		expect(resetZoom).toHaveBeenCalledTimes(3)
	})

	it('переходит к выбранной миниатюре', () => {
		const { state, resetZoom } = setup()

		state.handleGalleryGo(2)

		expect(state.currentZoomSrc.value).toBe('c.jpg')
		expect(resetZoom).toHaveBeenCalledOnce()
	})

	it('если галерея укоротилась, показывает основное изображение', () => {
		const { state, gallery } = setup()
		state.handleGalleryGo(2)

		gallery.value = ['a.jpg', 'b.jpg']

		expect(state.currentZoomSrc.value).toBe('main.jpg')
	})

	it('элементы объектами: свой alt текущего изображения, строка — без alt (IMG-4)', () => {
		const { state } = setup({ list: [{ src: 'a.jpg', alt: 'Первое' }, 'b.jpg', { src: 'c.jpg' }] })

		expect(state.galleryList.value).toEqual(['a.jpg', 'b.jpg', 'c.jpg'])
		expect(state.currentAlt.value).toBe('Первое')
		state.handleGalleryNext()
		expect(state.currentAlt.value).toBeUndefined()
		state.handleGalleryGo(2)
		expect(state.currentZoomSrc.value).toBe('c.jpg')
		expect(state.currentAlt.value).toBeUndefined()
	})

	it('одно изображение: alt галереи не используется', () => {
		const { state } = setup({ list: [{ src: 'a.jpg', alt: 'Первое' }] })

		expect(state.currentAlt.value).toBeUndefined()
		expect(state.currentZoomSrc.value).toBe('main.jpg')
	})

	it('галерея укоротилась — номер остаётся в её границах (IMG-14)', async () => {
		const { state, gallery } = setup()
		state.handleGalleryGo(2)

		gallery.value = ['a.jpg', 'b.jpg']
		await nextTick()
		expect(state.galleryIndex.value).toBe(1)
		expect(state.currentZoomSrc.value).toBe('b.jpg')

		gallery.value = []
		await nextTick()
		expect(state.galleryIndex.value).toBe(0)
	})

	it('галерея выросла — номер не меняется', async () => {
		const { state, gallery } = setup()
		state.handleGalleryGo(1)

		gallery.value = [...IMAGES, 'd.jpg']
		await nextTick()

		expect(state.galleryIndex.value).toBe(1)
	})

	it('номер за пределами галереи игнорируется', () => {
		const { state, resetZoom } = setup()

		state.handleGalleryGo(-1)
		state.handleGalleryGo(3)

		expect(state.galleryIndex.value).toBe(0)
		expect(resetZoom).not.toHaveBeenCalled()
	})
})
