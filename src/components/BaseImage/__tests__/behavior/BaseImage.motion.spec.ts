import '@testing-library/jest-dom/vitest'
import BaseImage from '../../ui/BaseImage.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const WITH_TRANSITIONS = { stubs: { transition: false } }

function renderImage(props: Record<string, unknown> = {}) {
	return render(BaseImage, { props: { src: 'img1.jpg', alt: 'Горы', ...props }, global: WITH_TRANSITIONS })
}

describe('BaseImage: движение', () => {
	afterEach(() => {
		document.body.innerHTML = ''
	})

	it('после загрузки плейсхолдер уходит через Transition поверх уже показанной картинки и потом удаляется', async () => {
		const { container, emitted } = renderImage()
		const placeholder = container.querySelector('.base-image__placeholder')!

		await fireEvent.load(container.querySelector('.base-image__img')!)

		expect(emitted().load).toHaveLength(1)
		expect(container.querySelector('.base-image')).toHaveClass('base-image--loaded')
		expect(placeholder).toBeInTheDocument()
		expect(placeholder).toHaveClass('base-image-placeholder-leave-active')
		expect(placeholder.nextElementSibling).toHaveClass('base-image__frame')
		await waitFor(() => expect(placeholder).not.toBeInTheDocument())
	})

	it('без плейсхолдера картинка проявляется сама, Transition плейсхолдера пуст', async () => {
		const { container } = renderImage({ hasPlaceholder: false })

		expect(container.querySelector('.base-image__placeholder')).toBeNull()
		await fireEvent.load(container.querySelector('.base-image__img')!)
		expect(container.querySelector('.base-image')).toHaveClass('base-image--loaded')
	})

	it('окно просмотра появляется и уходит через Transition; фокус возвращается сразу, окно удаляется после ухода', async () => {
		const { container, emitted } = renderImage({ zoomConfig: { hasZoom: true } })
		const trigger = container.querySelector('.base-image__frame') as HTMLElement
		trigger.focus()

		await fireEvent.click(trigger)
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveClass('base-image__zoom')
		expect(emitted()['zoom-open']).toHaveLength(1)

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(emitted()['zoom-close']).toHaveLength(1)
		expect(dialog).toHaveClass('base-image-zoom-leave-active')
		await waitFor(() => expect(document.activeElement).toBe(trigger))
		await waitFor(() => expect(document.querySelector('.base-image__zoom')).toBeNull())

		await fireEvent.click(trigger)
		expect(screen.getByRole('dialog')).toHaveClass('base-image__zoom')
	})

	it('без длительностей перехода (reduce, пресет none) окно и плейсхолдер убираются без события transitionend', async () => {
		const listener = vi.fn()
		document.addEventListener('transitionend', listener)
		const { container } = renderImage({ zoomConfig: { hasZoom: true } })

		await fireEvent.load(container.querySelector('.base-image__img')!)
		await fireEvent.click(container.querySelector('.base-image__frame')!)
		await fireEvent.keyDown(document, { key: 'Escape' })

		await waitFor(() => expect(container.querySelector('.base-image__placeholder')).toBeNull())
		await waitFor(() => expect(document.querySelector('.base-image__zoom')).toBeNull())
		expect(listener).not.toHaveBeenCalled()
		document.removeEventListener('transitionend', listener)
	})
})
