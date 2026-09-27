/**
 * BaseImage — stories.
 *
 * Разделы: Default (песочница) → внешний вид (заполнение, скругление, цвет фона) → состояния (ошибка, резервное
 * изображение) → просмотр (зум, галерея) → клавиатура.
 */

import { expect, fn, screen, waitFor } from 'storybook/test'
import {
	ARG_GROUP,
	BROKEN_IMAGE_SRC,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	STORY_IMAGES,
	STORY_WAIT_TIMEOUT,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseImage from '../ui/BaseImage.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'

/** Изображения для выбора в Controls: имя → data URI. */
const IMAGE_OPTIONS: Record<string, string> = {
	...Object.fromEntries(STORY_IMAGES.map(image => [image.alt, image.src])),
	'Битая ссылка': BROKEN_IMAGE_SRC,
}

const [SUNRISE, FOG, VALLEY] = STORY_IMAGES
const GALLERY = STORY_IMAGES.slice(0, 5)
const GALLERY_SRCS = GALLERY.map(image => image.src)

/** Ждёт, пока все изображения примера загрузятся и станут видимыми (проявление — переход opacity). */
async function expectImagesVisible(root: HTMLElement, count: number): Promise<void> {
	await waitFor(
		() => {
			const images = Array.from(root.querySelectorAll<HTMLImageElement>('.base-image__img'))
			expect(images).toHaveLength(count)
			for (const image of images) {
				expect(image.naturalWidth).toBeGreaterThan(0)
				expect(getComputedStyle(image).opacity).toBe('1')
			}
		},
		{ timeout: STORY_WAIT_TIMEOUT },
	)
}

const meta = {
	title: 'Element/BaseImage',
	component: BaseImage,
	parameters: {
		docs: {
			description: {
				component: [
					'Изображение с плейсхолдером загрузки, состоянием ошибки, резервным `fallbackSrc` и просмотром (зумом) с галереей.',
					'',
					'- Размер — `width`/`height` (px или CSS-значение, масштабируются `sizeScale`) или `aspectRatio`; заполнение — `fit`.',
					'- Скругление по умолчанию — md из темы; `borderRadius` задаёт своё в px (9999 — круг).',
					'- `loading="lazy"`: таймаут `timeout` отсчитывается с момента, когда изображение попало в зону видимости.',
					'- `convertToWebp`/`convertToAvif` добавляют `<source>` с тем же именем и расширением .webp/.avif — только если такие',
					'  копии лежат рядом на сервере. Для `data:`/`blob:` и путей без расширения источники не строятся.',
					'- С `zoomConfig.hasZoom` изображение становится кнопкой (мышь, Enter, Space) и открывает модальный просмотр:',
					'  масштаб, поворот, мини-карта, галерея `gallery`. Фокус переходит в просмотр и возвращается после закрытия.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant'),
		src: {
			control: 'select',
			options: Object.keys(IMAGE_OPTIONS),
			mapping: IMAGE_OPTIONS,
			table: propGroup(ARG_GROUP.content),
		},
		alt: { control: 'text', table: propGroup(ARG_GROUP.content) },
		fallbackSrc: { control: false, table: propGroup(ARG_GROUP.content) },
		gallery: { control: false, table: propGroup(ARG_GROUP.content) },
		width: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
		aspectRatio: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		fit: { control: 'inline-radio', options: ['cover', 'contain', 'fill', 'none'], table: propGroup(ARG_GROUP.appearance) },
		borderRadius: { control: { type: 'number', min: 0, max: 9999 }, table: propGroup(ARG_GROUP.appearance) },
		hasPlaceholder: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
		loading: { control: 'inline-radio', options: ['lazy', 'eager'], table: propGroup(ARG_GROUP.behavior) },
		timeout: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		zoomConfig: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
		srcWidth: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
		convertToWebp: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		convertToAvif: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		placeholder: { control: false },
		error: { control: false },
	},
	args: {
		src: SUNRISE.alt,
		alt: SUNRISE.alt,
		width: 320,
		height: 200,
		fit: 'cover',
		hasPlaceholder: true,
		loading: 'lazy',
		timeout: 5000,
		sizeScale: 100,
		onLoad: fn(),
		onError: fn(),
		onZoom: fn(),
	},
} satisfies Meta<typeof BaseImage>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/**
 * Песочница: выберите изображение и меняйте props в Controls. Пока изображение грузится, виден плейсхолдер;
 * после загрузки оно плавно проявляется и вызывается событие `load`.
 */
export const Default: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		const image = canvas.getByRole('img', { name: 'Горы на рассвете' })
		await expectImagesVisible(canvasElement, 1)
		await expect(args.onLoad).toHaveBeenCalledOnce()
		// data URI: производные <source> AVIF/WebP не строятся даже при convertTo*, браузер берёт src
		await expect(image.closest('picture')?.querySelector('source')).toBeNull()
	},
}

// ─── Внешний вид ───────────────────────────────────────────────────────────────

/**
 * Режимы заполнения `fit` на вертикальной рамке 120 × 160 (фон рамки — `color.bg`, чтобы были видны её границы):
 * `cover` обрезает, `contain` вписывает целиком, `none` показывает в исходном размере.
 * `fill` растягивает растровое изображение без сохранения пропорций; SVG с `preserveAspectRatio` по умолчанию
 * (как иллюстрации в этих примерах) при `fill` выглядит как `contain`.
 */
export const Fits: Story = {
	parameters: {
		controls: { include: ['src', 'borderRadius', 'sizeScale'] },
		docs: { source: { code: ['cover', 'contain', 'none'].map(fit => `<BaseImage src="…" alt="…" fit="${fit}" :width="120" :height="160" />`).join('\n') } },
	},
	render: args => ({
		components: { BaseImage },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['fit', 'width', 'height']),
			fits: ['cover', 'contain', 'none'],
			frame: { bg: { base: 'var(--rise-bg-elevated)' } },
		}),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="fit in fits" :key="fit" class="story-col" style="gap: 8px;">
					<span class="story-label">{{ fit }}</span>
					<BaseImage v-bind="props" :fit="fit" :width="120" :height="160" :color="frame" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 3)
	},
}

/** Скругление: по умолчанию md из темы, `borderRadius` задаёт своё в px (масштабируется `sizeScale`), 9999 — круг. */
export const BorderRadius: Story = {
	parameters: {
		controls: { include: ['src', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseImage src="…" alt="…" />',
					'<BaseImage src="…" alt="…" :border-radius="0" />',
					'<BaseImage src="…" alt="…" :border-radius="16" />',
					'<BaseImage src="…" alt="…" :border-radius="9999" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['borderRadius', 'width', 'height']),
			radii: [
				{ label: 'по умолчанию (md)', value: undefined },
				{ label: '0', value: 0 },
				{ label: '16', value: 16 },
				{ label: '9999 — круг', value: 9999 },
			],
		}),
		template: `
			<div class="story-row" style="align-items: flex-start;">
				<div v-for="radius in radii" :key="radius.label" class="story-col" style="gap: 8px;">
					<span class="story-label">{{ radius.label }}</span>
					<BaseImage v-bind="props" :border-radius="radius.value" :width="120" :height="120" />
				</div>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expectImagesVisible(canvasElement, 4)
		const [themed, square] = Array.from(canvasElement.querySelectorAll<HTMLElement>('.base-image'))
		// Без пропа inline-радиуса нет: скругление даёт тема (md = 6px)
		await expect(themed?.style.borderRadius).toBe('')
		await expect(getComputedStyle(themed!).borderTopLeftRadius).toBe('6px')
		await expect(getComputedStyle(square!).borderTopLeftRadius).toBe('0px')
	},
}

/**
 * Фон под изображением — `color.bg`: виден при `fit="contain"` и у прозрачных изображений (логотипы, иконки),
 * например чтобы вписать снимок в брендовую плашку.
 */
export const CustomColor: Story = {
	args: {
		src: FOG.alt,
		alt: FOG.alt,
		fit: 'contain',
		width: 200,
		height: 200,
		color: { bg: { base: '#fef3c7' } },
	},
	play: async ({ canvas, canvasElement }) => {
		await expectImagesVisible(canvasElement, 1)
		const root = canvas.getByRole('img', { name: 'Горы в тумане' }).closest('.base-image') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).toBe('rgb(254, 243, 199)')
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Изображение не загрузилось: иконка и подпись «Ошибка загрузки» на приглушённом фоне, событие `error`.
 * Текст `alt` не теряется — его получает иконка, скринридер озвучивает, что здесь было.
 * Свой вид ошибки — слот `error`.
 */
export const WithError: Story = {
	args: { src: 'Битая ссылка', alt: 'Фото профиля' },
	play: async ({ canvas, args }) => {
		await expect(await canvas.findByText('Ошибка загрузки', {}, { timeout: STORY_WAIT_TIMEOUT })).toBeVisible()
		await expect(canvas.getByRole('img', { name: 'Фото профиля' })).toBeVisible()
		await expect(args.onError).toHaveBeenCalledOnce()
	},
}

/** Резервное изображение: если `src` не загрузился, показывается `fallbackSrc` — ошибка не выводится. */
export const Fallback: Story = {
	args: { src: 'Битая ссылка', fallbackSrc: VALLEY.src, alt: 'Обложка статьи' },
	play: async ({ canvas, canvasElement, args }) => {
		const image = canvas.getByRole('img', { name: 'Обложка статьи' }) as HTMLImageElement
		await waitFor(() => expect(image.getAttribute('src')).toBe(VALLEY.src), { timeout: STORY_WAIT_TIMEOUT })
		await expectImagesVisible(canvasElement, 1)
		await expect(args.onError).not.toHaveBeenCalled()
	},
}

// ─── Просмотр ──────────────────────────────────────────────────────────────────

/**
 * Просмотр по клику: изображение становится кнопкой и открывает модальный диалог. Кнопки и колесо мыши меняют
 * масштаб, при масштабе больше 100% появляется мини-карта (клик и перетаскивание в ней двигают видимую область).
 * Закрыть — кнопка, Esc или клик по фону вокруг изображения (`closeOnOverlay`).
 */
export const WithZoom: Story = {
	args: { zoomConfig: { hasZoom: true } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Горы на рассвете' }))

		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы на рассвете' })
		await waitFor(() => expect(screen.getByRole('button', { name: 'Закрыть' })).toHaveFocus())

		await userEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		await expect(dialog).toHaveTextContent('125%')
		await expect(args.onZoom).toHaveBeenLastCalledWith(1.25)

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

/**
 * Галерея: у каждого изображения тот же `gallery` — просмотр открывается на выбранном снимке, стрелки, миниатюры
 * и клавиши ← → листают галерею, счётчик показывает позицию. Пример оставляет просмотр открытым на третьем снимке.
 */
export const Gallery: Story = {
	parameters: {
		controls: { include: ['fit', 'borderRadius', 'sizeScale'] },
		docs: {
			source: {
				code: [
					'<BaseImage',
					'  v-for="photo in photos"',
					'  :key="photo.src"',
					'  :src="photo.src"',
					'  :alt="photo.alt"',
					'  :gallery="photos.map(p => p.src)"',
					'  :zoom-config="{ hasZoom: true }"',
					'  :width="140"',
					'  :height="96" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['src', 'alt', 'width', 'height', 'gallery', 'zoomConfig']),
			photos: GALLERY,
			gallery: GALLERY_SRCS,
		}),
		template: `
			<div class="story-row">
				<BaseImage
					v-for="photo in photos"
					:key="photo.src"
					v-bind="props"
					:src="photo.src"
					:alt="photo.alt"
					:gallery="gallery"
					:zoom-config="{ hasZoom: true }"
					:width="140"
					:height="96" />
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Горы в тумане' }))
		const dialog = await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы в тумане' })
		await expect(dialog).toHaveTextContent('2 / 5')

		await userEvent.keyboard('{ArrowRight}')
		await expect(dialog).toHaveTextContent('3 / 5')
		await expect(screen.getByRole('button', { name: 'Изображение 3 из 5' })).toHaveAttribute('aria-current', 'true')

		await userEvent.click(screen.getByRole('button', { name: 'Изображение 1 из 5' }))
		await expect(dialog).toHaveTextContent('1 / 5')
		await expect(screen.queryByRole('button', { name: 'Предыдущее изображение' })).not.toBeInTheDocument()

		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await userEvent.click(screen.getByRole('button', { name: 'Следующее изображение' }))
		await expect(dialog).toHaveTextContent('3 / 5')
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab до изображения (кольцо фокуса), Enter открывает просмотр с фокусом на «Закрыть»,
 * Tab не выходит за пределы просмотра, Esc закрывает его и возвращает фокус на изображение.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	args: { zoomConfig: { hasZoom: true }, gallery: GALLERY_SRCS },
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Горы на рассвете' })
		await tabTo(trigger, userEvent)
		await expect(getComputedStyle(trigger).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		const dialog = await screen.findByRole('dialog')
		const close = screen.getByRole('button', { name: 'Закрыть' })
		await waitFor(() => expect(close).toHaveFocus())

		// Закрыть — последняя кнопка панели: дальше Tab идёт по кнопкам просмотра, а не по странице под ним
		await userEvent.tab()
		await expect(dialog).toContainElement(document.activeElement as HTMLElement)
		await userEvent.tab({ shift: true })
		await expect(close).toHaveFocus()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()
	},
}
