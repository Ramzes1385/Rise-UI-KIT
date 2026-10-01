import { ref } from 'vue'
import { useImageGallery } from '../useImageGallery'

const IMAGES = ['a.jpg', 'b.jpg', 'c.jpg']

function setup(images: { list?: string[] } = { list: IMAGES }) {
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
})
