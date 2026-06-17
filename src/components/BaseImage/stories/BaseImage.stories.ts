/**
 * Stories для компонента BaseImage.
 * Демонстрирует все режимы и варианты.
 */

import { expect, userEvent, waitFor, within } from 'storybook/test'
import { ref } from 'vue'
import BaseImage from '../ui/BaseImage.vue'
import type { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BaseImage> = {
	title: 'UI/BaseImage',
	component: BaseImage,

	argTypes: {
		src: { control: 'text' },
		alt: { control: 'text' },
		width: { control: 'text' },
		height: { control: 'text' },
		fit: {
			control: 'inline-radio',
			options: ['cover', 'contain', 'fill', 'none'],
		},
		color: {
			control: 'object',
			description: 'Кастомный цвет { bg: { base, hover... }, text: { base, hover... } }',
		},
		loading: {
			control: 'inline-radio',
			options: ['lazy', 'eager'],
		},
		borderRadius: {
			control: { type: 'range', min: 0, max: 9999, step: 1 },
			description: 'Скругление в px (0–9999)',
		},
		hasPlaceholder: { control: 'boolean' },
		aspectRatio: { control: 'text' },
		srcWidth: { control: 'number' },
		hasZoom: { control: 'boolean' },
		closeOnOverlay: { control: 'boolean' },
		initialScale: { control: 'number', min: 0.5, max: 3, step: 0.1 },
		zoomStep: { control: 'number', min: 0.1, max: 1, step: 0.1 },
		minScale: { control: 'number' },
		maxScale: { control: 'number' },
		showMinimap: { control: 'boolean' },
		convertToWebp: { control: 'boolean' },
		gallery: {
			control: 'object',
			description: 'Массив URL изображений для навигации в режиме зума',
		},
		sizeScale: {
			control: { type: 'range', min: 50, max: 200, step: 10 },
			description: 'Масштаб размера (50–200%, по умолчанию 100)',
		},
		onLoad: { table: { disable: true } },
		onError: { table: { disable: true } },
		onZoom: { table: { disable: true } },
	},

	args: {
		src: 'https://placehold.co/400x300/f97316/ffffff?text=Metal+Art',
		alt: 'Превью',
		fit: 'cover',
		loading: 'lazy',
		borderRadius: 12,
		hasPlaceholder: true,
		hasZoom: false,
		sizeScale: 100,
	},
}

export default meta
type Story = StoryObj<typeof BaseImage>

function getImg(root: ParentNode): HTMLImageElement {
	const img = root.querySelector<HTMLImageElement>('.base-image__img')
	if (!img) throw new Error('Изображение не найдено')
	return img
}

function getImage(root: ParentNode, selector: string): HTMLImageElement {
	const img = root.querySelector<HTMLImageElement>(selector)
	if (!img) throw new Error('Изображение не найдено')
	return img
}

function getEl(root: ParentNode, selector: string): HTMLElement {
	const element = root.querySelector<HTMLElement>(selector)
	if (!element) throw new Error('Элемент изображения не найден')
	return element
}

function getLastEl(root: ParentNode, selector: string): HTMLElement {
	const elements = Array.from(root.querySelectorAll<HTMLElement>(selector))
	const element = elements.at(-1)
	if (!element) throw new Error('Элемент изображения не найден')
	return element
}

function getAllEls(root: ParentNode, selector: string): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(selector))
}

function getItem(items: HTMLElement[], index: number): HTMLElement {
	const item = items[index]
	if (!item) throw new Error('Элемент изображения не найден')
	return item
}

function dispatchLoad(img: HTMLImageElement): void {
	img.dispatchEvent(new Event('load'))
}

function dispatchError(img: HTMLImageElement): void {
	img.dispatchEvent(new Event('error'))
}

function defineImageSize(img: HTMLImageElement): void {
	Object.defineProperty(img, 'naturalWidth', { configurable: true, value: 800 })
	Object.defineProperty(img, 'naturalHeight', { configurable: true, value: 600 })
	Object.defineProperty(img, 'offsetWidth', { configurable: true, value: 800 })
	Object.defineProperty(img, 'offsetHeight', { configurable: true, value: 600 })
}

function defineMinimapRect(minimap: HTMLElement): void {
	Object.defineProperty(minimap, 'getBoundingClientRect', {
		configurable: true,
		value: () => new DOMRect(0, 0, 200, 150),
	})
}

function closeZoom(): void {
	const zoom = document.body.querySelector<HTMLElement>('.base-image__zoom')
	if (!zoom) return
	zoom.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

function cleanZoom(): void {
	document.body.querySelectorAll('.base-image__zoom').forEach(element => element.remove())
}

async function openZoom(root: ParentNode): Promise<HTMLElement> {
	cleanZoom()
	await userEvent.click(getImg(root))
	await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeTruthy())
	return getLastEl(document, '.base-image__zoom')
}
/** Базовое изображение */
export const Default: Story = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Изображение отображается', async () => {
			const img = canvas.getByRole('img')
			expect(img).toBeInTheDocument()
			expect(img).toHaveAttribute('alt', 'Превью')
			expect(canvasElement.querySelector('.base-image__placeholder')).toBeTruthy()
			dispatchLoad(getImg(canvasElement))
			await waitFor(() => expect(canvasElement.querySelector('.base-image--loaded')).toBeTruthy())
			expect(canvasElement.querySelector('.base-image__placeholder')).toBeFalsy()
		})
	},
}
/** Сетка изображений */
export const ImageGrid: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:640px;">
				<BaseImage v-for="i in 6" :key="i" v-bind="args" :src="'https://placehold.co/400x300/' + ['f97316','3b82f6','22c55e','a855f7','ef4444','06b6d4'][i-1] + '/ffffff?text=Photo+' + i" :width="200" :height="150" />
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('6 изображений в сетке', async () => {
			const images = canvas.getAllByRole('img')
			expect(images).toHaveLength(6)
		})
	},
}
/** Все режимы заполнения */
export const Fits: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="f in ['cover','contain','fill','none']" :key="f" style="width:200px;">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ f }}</p>
					<BaseImage v-bind="args" :fit="f" :width="200" :height="150" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все режимы fit', async () => {
			expect(canvas.getByText('cover')).toBeInTheDocument()
			expect(canvas.getByText('contain')).toBeInTheDocument()
			expect(canvas.getByText('fill')).toBeInTheDocument()
			expect(canvas.getByText('none')).toBeInTheDocument()
		})
	},
}
/** Скругления */
export const BorderRadii: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;flex-wrap:wrap;">
				<div v-for="r in [0, 4, 8, 12, 16, 24, 9999]" :key="r" style="width:120px;">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ r }}px</p>
					<BaseImage v-bind="args" :border-radius="r" :width="120" :height="120" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Все скругления', async () => {
			expect(canvas.getByText('0px')).toBeInTheDocument()
			expect(canvas.getByText('9999px')).toBeInTheDocument()
		})
	},
}
/** С аспектным соотношением */
export const AspectRatio: Story = {
	args: {
		aspectRatio: '16/9',
		width: '100%',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Изображение с аспектным соотношением', async () => {
			expect(canvas.getByRole('img')).toBeInTheDocument()
		})
	},
}
/** С зумом по клику */
export const WithZoom: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Metal+Art+Zoom',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие зума по клику', async () => {
			const zoom = await openZoom(canvasElement)
			expect(zoom).toBeInTheDocument()
			closeZoom()
			await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeFalsy())
		})
	},
}
/** Зум с мини-картой и поворотом */
export const ZoomWithMinimap: Story = {
	args: {
		hasZoom: true,
		showMinimap: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Metal+Art+Zoom',
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие зума с мини-картой', async () => {
			const zoom = await openZoom(canvasElement)
			const zoomImg = getImage(zoom, '.base-image__zoom-img')
			defineImageSize(zoomImg)
			dispatchLoad(zoomImg)

			const buttons = getAllEls(zoom, '.base-image__zoom-btn')
			await userEvent.click(getItem(buttons, 1))
			await userEvent.click(getItem(buttons, 3))
			await userEvent.click(getItem(buttons, 4))
			await userEvent.click(getItem(buttons, 2))
			await userEvent.click(getItem(buttons, 1))
			zoom.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: -1 }))

			await waitFor(() => expect(document.body.querySelector('.base-image__minimap')).toBeTruthy())
			const minimap = getLastEl(document, '.base-image__minimap')
			defineMinimapRect(minimap)
			const minimapImg = getImage(minimap, '.base-image__minimap-img')
			defineImageSize(minimapImg)
			dispatchLoad(minimapImg)
			await userEvent.click(minimap)
			minimap.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 20, clientY: 20 }))
			document.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 40, clientY: 45 }))
			document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
			zoom.dispatchEvent(new WheelEvent('wheel', { bubbles: true, deltaY: 1 }))
			await userEvent.click(getItem(buttons, 0))
			await userEvent.click(getItem(buttons, 5))
		})
	},
}
/** Зум с галереей изображений */
export const ZoomWithGallery: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Image+1',
		gallery: [
			'https://placehold.co/800x600/f97316/ffffff?text=Image+1',
			'https://placehold.co/800x600/3b82f6/ffffff?text=Image+2',
			'https://placehold.co/800x600/22c55e/ffffff?text=Image+3',
		],
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие зума с галереей', async () => {
			const zoom = await openZoom(canvasElement)
			expect(getEl(zoom, '.base-image__zoom-gallery')).toBeInTheDocument()
			closeZoom()
		})
	},
}
/** Зум с большой галереей */
export const ZoomWithLargeGallery: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Photo+1',
		gallery: [
			'https://placehold.co/800x600/f97316/ffffff?text=Photo+1',
			'https://placehold.co/800x600/3b82f6/ffffff?text=Photo+2',
			'https://placehold.co/800x600/22c55e/ffffff?text=Photo+3',
			'https://placehold.co/800x600/a855f7/ffffff?text=Photo+4',
			'https://placehold.co/800x600/ef4444/ffffff?text=Photo+5',
			'https://placehold.co/800x600/06b6d4/ffffff?text=Photo+6',
			'https://placehold.co/800x600/84cc16/ffffff?text=Photo+7',
			'https://placehold.co/800x600/f59e0b/ffffff?text=Photo+8',
		],
	},
	play: async ({ canvasElement, step }) => {
		await step('Открытие большой галереи', async () => {
			const zoom = await openZoom(canvasElement)
			expect(getAllEls(zoom, '.base-image__zoom-thumb')).toHaveLength(8)
			closeZoom()
		})
	},
}
/** Конвертация в WebP */
export const WebpConversion: Story = {
	args: {
		convertToWebp: true,
		src: 'https://placehold.co/400x300/f97316/ffffff?text=WebP',
	},
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('WebP конвертация активна', async () => {
			expect(canvas.getByRole('img')).toBeInTheDocument()
		})
	},
}
/** Тёмная тема */
export const DarkTheme: Story = {
	decorators: [
		() => ({
			template: '<div data-theme="dark" style="padding: 16px; background: var(--color-bg);"><story /></div>',
		}),
	],
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Тёмная тема', async () => {
			expect(canvas.getByRole('img')).toBeInTheDocument()
		})
	},
}
/** Разные размеры */
export const DifferentSizes: Story = {
	render: args => ({
		components: { BaseImage },
		setup() {
			return { args }
		},
		template: `
			<div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;">
				<div v-for="size in [80, 120, 200, 300]" :key="size">
					<p style="margin-bottom:4px;font-size:12px;color:var(--color-text-muted);">{{ size }}px</p>
					<BaseImage v-bind="args" :width="size" :height="size" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement)
		await step('Разные размеры', async () => {
			expect(canvas.getByText('80px')).toBeInTheDocument()
			expect(canvas.getByText('300px')).toBeInTheDocument()
		})
	},
}
/** Галерея: навигация prev/next */
export const GalleryNavigation: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=1',
		gallery: [
			'https://placehold.co/800x600/f97316/ffffff?text=1',
			'https://placehold.co/800x600/3b82f6/ffffff?text=2',
			'https://placehold.co/800x600/22c55e/ffffff?text=3',
		],
	},
	play: async ({ canvasElement }) => {
		const zoom = await openZoom(canvasElement)
		zoom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
		zoom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
		await waitFor(() => expect(getEl(zoom, '.base-image__zoom-counter')).toHaveTextContent('2 / 3'))
		zoom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
		await waitFor(() => expect(getEl(zoom, '.base-image__zoom-counter')).toHaveTextContent('3 / 3'))
		zoom.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))

		const prevBtn = getLastEl(document, '.base-image__zoom-nav--prev')
		await userEvent.click(prevBtn)
		await waitFor(() => expect(getEl(zoom, '.base-image__zoom-counter')).toHaveTextContent('2 / 3'))

		const thumbs = getAllEls(zoom, '.base-image__zoom-thumb')
		await userEvent.click(getItem(thumbs, 0))
		await waitFor(() => expect(getEl(zoom, '.base-image__zoom-counter')).toHaveTextContent('1 / 3'))
		const nextBtn = getLastEl(document, '.base-image__zoom-nav--next')
		await userEvent.click(nextBtn)
		closeZoom()
	},
}
/** Без плейсхолдера */
export const NoPlaceholder: Story = {
	args: { hasPlaceholder: false },
}
/** Ошибка загрузки */
export const ErrorState: Story = {
	args: { src: 'https://invalid.example/404.jpg' },
	play: async ({ canvasElement }) => {
		expect(within(canvasElement).getByRole('img')).toBeInTheDocument()
		dispatchError(getImg(canvasElement))
		await waitFor(() => expect(canvasElement.querySelector('.base-image__error')).toBeTruthy())
		expect(canvasElement.querySelector('picture')).toBeFalsy()
	},
}
/** С width/height без aspectRatio */
export const ExplicitSize: Story = {
	args: { width: 300, height: 200 },
}
/** AVIF+WebP для локального src */
export const LocalSrcFormats: Story = {
	args: { src: '/images/photo.png', convertToWebp: true, srcWidth: 800 },
	play: async ({ canvasElement }) => {
		const img = within(canvasElement).getByRole('img')
		expect(img).toBeInTheDocument()
		expect(img).toHaveAttribute('srcset')
		expect(img).toHaveAttribute('sizes', '100vw')
		expect(canvasElement.querySelector('source[type="image/avif"]')).toBeTruthy()
		expect(canvasElement.querySelector('source[type="image/webp"]')).toBeTruthy()
	},
}
/** Локальное изображение без явной WebP-конвертации */
export const LocalSrcDefaultWebp: Story = {
	args: { src: '/images/photo.png', convertToWebp: false, width: '100%' },
	play: async ({ canvasElement }) => {
		expect(within(canvasElement).getByRole('img')).toBeInTheDocument()
		expect(canvasElement.querySelector('source[type="image/webp"]')).toBeTruthy()
	},
}
/** Плейсхолдер виден до загрузки (класс base-image--placeholder) */
export const PlaceholderVisible: Story = {
	args: { hasPlaceholder: true, src: 'https://placehold.co/400x300/f97316/ffffff?text=Placeholder' },
	play: async ({ canvasElement }) => {
		await waitFor(() => {
			const root = canvasElement.querySelector('.base-image')
			expect(root).toBeTruthy()
			expect(root?.classList.contains('base-image--placeholder')).toBe(true)
		})
	},
}
/** Резервное изображение подменяется при ошибке (currentSrc → fallbackSrc) */
export const FallbackOnError: Story = {
	args: {
		src: 'https://invalid.example/primary.jpg',
		fallbackSrc: 'https://placehold.co/400x300/22c55e/ffffff?text=Fallback',
	},
	play: async ({ canvasElement }) => {
		const img = getImg(canvasElement)
		dispatchError(img)
		await waitFor(() => {
			const currentImg = canvasElement.querySelector<HTMLImageElement>('.base-image__img')
			expect(currentImg?.src).toContain('Fallback')
		})
	},
}
/** Таймаут загрузки переводит в состояние ошибки */
export const LoadingTimeout: Story = {
  args: {
    src: 'https://placehold.co/400x300/f97316/ffffff?text=Timeout',
    timeout: 5000, 
  },
  play: async ({ canvasElement }) => {
    const img = await within(canvasElement).findByRole('img')
    img.dispatchEvent(new Event('error'))
    await waitFor(() => {
      expect(canvasElement.querySelector('.base-image__error')).toBeTruthy()
    })
  },
}
/** Escape закрывает зум */
export const EscapeClosesZoom: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/f97316/ffffff?text=Escape+Zoom',
	},
	play: async ({ canvasElement }) => {
		cleanZoom()
		const zoom = await openZoom(canvasElement)
		expect(zoom).toBeInTheDocument()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
		await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeFalsy())
	},
}
/** Клик по оверлею закрывает зум (closeOnOverlay=true) — покрывает handleOverlayClick */
export const OverlayClickClosesZoom: Story = {
	args: {
		hasZoom: true,
		closeOnOverlay: true,
		src: 'https://placehold.co/800x600/22c55e/ffffff?text=Overlay+Close',
	},
	play: async ({ canvasElement }) => {
		cleanZoom()
		const zoom = await openZoom(canvasElement)
		expect(zoom).toBeInTheDocument()
		zoom.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeFalsy())
	},
}
/** Клик по оверлею при closeOnOverlay=false не закрывает зум */
export const OverlayClickKeepsZoom: Story = {
	args: {
		hasZoom: true,
		closeOnOverlay: false,
		src: 'https://placehold.co/800x600/ef4444/ffffff?text=Overlay+Keep',
	},
	play: async ({ canvasElement }) => {
		cleanZoom()
		const zoom = await openZoom(canvasElement)
		zoom.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(document.body.querySelector('.base-image__zoom')).toBeTruthy()
		closeZoom()
		await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeFalsy())
	},
}
/** Клик по изображению без зума — покрывает if (!props.hasZoom) return (стр. 357) */
export const ClickWithoutZoom: Story = {
	args: {
		hasZoom: false,
		src: 'https://placehold.co/400x300/64748b/ffffff?text=No+Zoom',
	},
	play: async ({ canvasElement }) => {
		cleanZoom()
		await userEvent.click(getImg(canvasElement))
		expect(document.body.querySelector('.base-image__zoom')).toBeFalsy()
	},
}
/** Нулевой таймаут — покрывает short-circuit props.timeout && props.timeout > 0 (стр. 309) */
export const ZeroTimeout: Story = {
	args: {
		src: 'https://placehold.co/400x300/14b8a6/ffffff?text=Zero+Timeout',
		timeout: 0,
	},
	play: async ({ canvasElement }) => {
		await waitFor(() => expect(canvasElement.querySelector('.base-image__img')).toBeTruthy())
		expect(canvasElement.querySelector('.base-image__error')).toBeFalsy()
	},
}
/** Игнорируемая клавиша при открытом зуме — покрывает false-ветку event.key === 'Escape' (стр. 388) */
export const IgnoredKeyInZoom: Story = {
	args: {
		hasZoom: true,
		src: 'https://placehold.co/800x600/0ea5e9/ffffff?text=Ignored+Key',
	},
	play: async ({ canvasElement }) => {
		cleanZoom()
		const zoom = await openZoom(canvasElement)
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
		expect(zoom).toBeInTheDocument()
		closeZoom()
		await waitFor(() => expect(document.body.querySelector('.base-image__zoom')).toBeFalsy())
	},
}
/** Сокращение галереи при открытом зуме — покрывает fallback galleryList[idx] ?? props.src (стр. 351) */
export const GalleryShrinkFallback: Story = {
	render: () => ({
		components: { BaseImage },
		setup() {
			const items = ref<string[]>([
				'https://placehold.co/800x600/f97316/ffffff?text=A',
				'https://placehold.co/800x600/3b82f6/ffffff?text=B',
				'https://placehold.co/800x600/22c55e/ffffff?text=C',
			])
			function shrinkGallery(): void {
				items.value = items.value.slice(0, 2)
			}
			return { items, shrinkGallery }
		},
		template: `
			<div>
				<button type="button" class="story-shrink" @click="shrinkGallery">Shrink</button>
				<BaseImage :has-zoom="true" alt="Превью" :src="items[0]" :gallery="items" />
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		cleanZoom()
		const zoom = await openZoom(canvasElement)
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
		await waitFor(() => expect(getEl(zoom, '.base-image__zoom-counter')).toHaveTextContent('3 / 3'))
		const shrinkBtn = getEl(canvasElement, '.story-shrink')
		await userEvent.click(shrinkBtn)
		await waitFor(() => {
			const zoomImg = document.body.querySelector<HTMLImageElement>('.base-image__zoom-img')
			expect(zoomImg?.src).toContain('text=A')
		})
		closeZoom()
	},
}
