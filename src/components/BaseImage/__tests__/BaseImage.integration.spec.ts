import '@testing-library/jest-dom/vitest'
import BaseImage from '../ui/BaseImage.vue'
import userEvent from '@testing-library/user-event'
import BaseSlider from '@components/BaseSlider/ui/BaseSlider.vue'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import ChatSlideoverMedia from '@components/BaseChat/ui/ChatSlideover/ChatSlideoverMedia.vue'
import ChatMessageAttachments from '@components/BaseChat/ui/ChatMessageList/ui/ChatMessageAttachments.vue'

describe('BaseImage integration', () => {
	const defaultProps = {
		src: 'test.jpg',
		alt: 'Тест',
	}

	describe('hasZoom', () => {
		it('должен применять класс --zoomable когда zoomConfig.hasZoom=true', () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true } },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(true)
		})

		it('не должен применять класс --zoomable когда zoomConfig.hasZoom=false', () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: false } },
			})

			expect(container.querySelector('.base-image')?.classList.contains('base-image--zoomable')).toBe(false)
		})

		it('должен открывать зум при клике на изображение когда zoomConfig.hasZoom=true', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoom = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoom).toBeInTheDocument()
		})

		it('не должен открывать зум при клике когда zoomConfig.hasZoom=false', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: false } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoom = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoom).not.toBeInTheDocument()
		})
	})

	describe('закрытие зума', () => {
		it('должен закрывать зум по клику на оверлей когда zoomConfig.closeOnOverlay=true', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true, closeOnOverlay: true } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoomOverlay = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoomOverlay).toBeInTheDocument()

			await fireEvent.click(zoomOverlay!)

			expect(container.ownerDocument.querySelector('.base-image__zoom')).not.toBeInTheDocument()
		})

		it('не должен закрывать зум по клику на оверлей когда zoomConfig.closeOnOverlay=false', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps, zoomConfig: { hasZoom: true, closeOnOverlay: false } },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const zoomOverlay = container.ownerDocument.querySelector('.base-image__zoom')
			expect(zoomOverlay).toBeInTheDocument()

			await fireEvent.click(zoomOverlay!)

			expect(container.ownerDocument.querySelector('.base-image__zoom')).toBeInTheDocument()
		})
	})

	describe('gallery', () => {
		it('должен рендерить навигацию галереи когда передан gallery', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const gallery = container.ownerDocument.querySelector('.base-image__zoom-gallery')
			expect(gallery).toBeInTheDocument()
		})

		it('должен рендерить миниатюры галереи', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const thumbs = container.ownerDocument.querySelectorAll('.base-image__zoom-thumb')
			expect(thumbs).toHaveLength(2)
		})

		it('должен рендерить навигацию вперёд когда есть следующее изображение', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const nextBtn = container.ownerDocument.querySelector('.base-image__zoom-nav--next')
			expect(nextBtn).toBeInTheDocument()
		})

		it('не должен рендерить навигацию назад на первом изображении', async () => {
			const { container } = render(BaseImage, {
				props: {
					...defaultProps,
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg'],
				},
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.click(img!)

			const prevBtn = container.ownerDocument.querySelector('.base-image__zoom-nav--prev')
			expect(prevBtn).not.toBeInTheDocument()
		})
	})

	describe('ошибка загрузки', () => {
		it('должен рендерить блок ошибки при ошибке загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.error(img!)

			expect(container.querySelector('.base-image__error')).toBeInTheDocument()
		})

		it('сохраняет alt доступным: иконка ошибки названа alt, подпись видна', async () => {
			render(BaseImage, { props: { src: 'broken.jpg', alt: 'Фото профиля' } })

			await fireEvent.error(screen.getByRole('img', { name: 'Фото профиля' }))

			expect(screen.getByRole('img', { name: 'Фото профиля' }).tagName.toLowerCase()).toBe('svg')
			expect(screen.getByText('Ошибка загрузки')).toBeInTheDocument()
		})

		it('у декоративного изображения (alt="") иконка ошибки скрыта от скринридера', async () => {
			const { container } = render(BaseImage, { props: { src: 'broken.jpg', alt: '' } })

			await fireEvent.error(container.querySelector('img')!)

			expect(container.querySelector('.base-image__error svg')).toHaveAttribute('aria-hidden', 'true')
		})
	})

	describe('успешная загрузка', () => {
		it('должен применять класс --loaded после загрузки', async () => {
			const { container } = render(BaseImage, {
				props: { ...defaultProps },
			})

			const img = container.querySelector('.base-image__img')
			await fireEvent.load(img!)

			expect(container.querySelector('.base-image')?.classList.contains('base-image--loaded')).toBe(true)
		})
	})

	describe('доступность оверлея зума', () => {
		it('оверлей — модальный диалог с именованными кнопками управления', async () => {
			render(BaseImage, {
				props: {
					src: 'img1.jpg',
					alt: 'Закат',
					zoomConfig: { hasZoom: true },
					gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
				},
			})

			await fireEvent.click(screen.getByRole('img', { name: 'Закат' }))

			const dialog = screen.getByRole('dialog', { name: /Закат/ })
			expect(dialog).toHaveAttribute('aria-modal', 'true')
			const toolbarNames = ['Уменьшить', 'Увеличить', 'Сбросить масштаб', 'Повернуть влево', 'Повернуть вправо', 'Закрыть']
			for (const name of toolbarNames) {
				expect(within(dialog).getByRole('button', { name })).toBeInTheDocument()
			}

			await fireEvent.click(within(dialog).getByRole('button', { name: 'Следующее изображение' }))
			expect(within(dialog).getByRole('button', { name: 'Предыдущее изображение' })).toBeInTheDocument()

			await fireEvent.click(within(dialog).getByRole('button', { name: 'Закрыть' }))
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})
	})

	describe('клавиатура и фокус просмотра', () => {
		it('изображение с зумом — кнопка: Enter открывает просмотр, фокус на «Закрыть», после Esc возвращается', async () => {
			const user = userEvent.setup()
			render(BaseImage, { props: { src: 'img1.jpg', alt: 'Закат', zoomConfig: { hasZoom: true } } })

			const trigger = screen.getByRole('button', { name: 'Закат' })
			expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
			await user.tab()
			expect(trigger).toHaveFocus()

			await user.keyboard('{Enter}')
			const dialog = screen.getByRole('dialog', { name: 'Просмотр изображения: Закат' })
			await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Закрыть' })).toHaveFocus())

			await user.keyboard('{Escape}')
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
			await waitFor(() => expect(trigger).toHaveFocus())
		})

		it('Tab не уходит из просмотра на страницу под ним', async () => {
			const user = userEvent.setup()
			render({
				components: { BaseImage },
				template:
					'<div><button type="button">До</button><BaseImage src="img1.jpg" alt="Закат" :zoom-config="{ hasZoom: true }" /></div>',
			})

			await user.click(screen.getByRole('button', { name: 'Закат' }))
			const dialog = screen.getByRole('dialog')
			for (let step = 0; step < 8; step++) {
				await user.tab()
				expect(dialog).toContainElement(document.activeElement as HTMLElement)
			}
		})

		it('декоративное изображение (alt="") с зумом получает имя кнопки «Просмотр изображения»', () => {
			render(BaseImage, { props: { src: 'img1.jpg', alt: '', zoomConfig: { hasZoom: true } } })

			expect(screen.getByRole('button', { name: 'Просмотр изображения' })).toBeInTheDocument()
		})

		it('без зума изображение не становится кнопкой', () => {
			render(BaseImage, { props: { src: 'img1.jpg', alt: 'Закат' } })

			expect(screen.queryByRole('button')).not.toBeInTheDocument()
		})

		it('клик по полю вокруг изображения закрывает просмотр, клик по самому изображению — нет', async () => {
			render(BaseImage, { props: { src: 'img1.jpg', alt: 'Закат', zoomConfig: { hasZoom: true } } })
			await fireEvent.click(screen.getByRole('button', { name: 'Закат' }))

			const dialog = screen.getByRole('dialog')
			await fireEvent.click(within(dialog).getByRole('img', { name: 'Закат' }))
			expect(screen.getByRole('dialog')).toBeInTheDocument()

			await fireEvent.click(dialog.querySelector('.base-image__zoom-container')!)
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
		})

		it('миниатюры галереи — кнопки с номером снимка, у текущей aria-current', async () => {
			render(BaseImage, {
				props: { src: 'img1.jpg', alt: 'Закат', zoomConfig: { hasZoom: true }, gallery: ['img1.jpg', 'img2.jpg', 'img3.jpg'] },
			})
			await fireEvent.click(screen.getByRole('button', { name: 'Закат' }))

			const dialog = screen.getByRole('dialog')
			expect(within(dialog).getByRole('button', { name: 'Изображение 1 из 3' })).toHaveAttribute('aria-current', 'true')

			await fireEvent.click(within(dialog).getByRole('button', { name: 'Изображение 3 из 3' }))
			expect(within(dialog).getByRole('button', { name: 'Изображение 3 из 3' })).toHaveAttribute('aria-current', 'true')
			expect(within(dialog).getByRole('button', { name: 'Изображение 1 из 3' })).not.toHaveAttribute('aria-current')
			expect(dialog).toHaveTextContent('3 / 3')
		})
	})

	describe('потребители BaseImage включают зум актуальным API', () => {
		const url = 'https://cdn.example.com/photo.jpg'

		it('изображение-вложение в сообщении чата открывает зум по клику', async () => {
			const { container } = render(ChatMessageAttachments, {
				props: {
					attachments: [{ id: 'a1', name: 'photo.jpg', type: 'image', url }],
					sizeScale: 100,
					gallery: [url],
				},
			})

			await fireEvent.click(container.querySelector('.base-image__img')!)

			expect(document.body.querySelector('.base-image__zoom')).toBeInTheDocument()
		})

		it('изображение в медиа-панели чата открывает зум по клику', async () => {
			const { container } = render(ChatSlideoverMedia, {
				props: {
					messages: [
						{
							id: 'm1',
							text: '',
							sender: 'other',
							time: '10:00',
							attachments: [{ id: 'a1', name: 'photo.jpg', type: 'image', url }],
						},
					],
					sizeScale: 100,
				},
			})

			await fireEvent.click(container.querySelector('.base-image__img')!)

			expect(document.body.querySelector('.base-image__zoom')).toBeInTheDocument()
		})

		it('слайд BaseSlider с isZoomable открывает зум по клику', async () => {
			const { container } = render(BaseSlider, {
				props: { items: [{ src: url, alt: 'Слайд' }], isZoomable: true },
			})

			await fireEvent.click(container.querySelector('.base-slider__slide .base-image__img')!)

			expect(document.body.querySelector('.base-image__zoom')).toBeInTheDocument()
		})

		it('перетаскивание слайда мышью не открывает зум: click после drag гасится', async () => {
			const { container } = render(BaseSlider, {
				props: {
					items: [
						{ src: url, alt: 'Слайд 1' },
						{ src: url, alt: 'Слайд 2' },
					],
					isZoomable: true,
				},
			})
			const image = container.querySelector('.base-slider__slide .base-image__img')!

			await fireEvent.mouseDown(image, { clientX: 300, clientY: 100 })
			await fireEvent.mouseMove(document, { clientX: 120, clientY: 100 })
			await fireEvent.mouseUp(document, { clientX: 120, clientY: 100 })
			await fireEvent.click(image)

			expect(document.body.querySelector('.base-image__zoom')).not.toBeInTheDocument()

			await fireEvent.mouseDown(image, { clientX: 300, clientY: 100 })
			await fireEvent.mouseUp(document, { clientX: 300, clientY: 100 })
			await fireEvent.click(image)

			expect(document.body.querySelector('.base-image__zoom')).toBeInTheDocument()
		})
	})
})
