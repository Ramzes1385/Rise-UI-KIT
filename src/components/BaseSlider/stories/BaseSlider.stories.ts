/**
 * BaseSlider — stories.
 *
 * Разделы: Default (песочница) → навигация и стрелки (миниатюры, позиции стрелок) → режимы (fade, автопрокрутка,
 * без зацикливания, вертикальный, несколько слайдов, зум) → содержимое (свои слайды) → состояния (пусто, загрузка,
 * длинные подписи) → клавиатура.
 */

import { expect, fn, screen, waitFor, within } from 'storybook/test'
import { BaseCard } from '@components/BaseCard'
import { BaseButton } from '@components/BaseButton'
import { BaseSkeleton } from '@components/BaseSkeleton'
import {
	ARG_GROUP,
	baseArgTypes,
	hiddenArgTypes,
	propGroup,
	STORY_IMAGES,
	STORY_WAIT_TIMEOUT,
	tabTo,
	useArgsWithoutSlots,
} from '@/stories/helpers'
import BaseSlider from '../ui/BaseSlider.vue'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type { SliderItem } from '../model/BaseSlider.types'

const TOURS = [
	{ title: 'Рассвет на плато', description: 'Однодневный маршрут · 12 км' },
	{ title: 'Перевал в тумане', description: 'Два дня с ночёвкой в горном приюте' },
	{ title: 'Зелёная долина', description: 'Лёгкая прогулка для всей семьи' },
	{ title: 'Сумерки над хребтом', description: 'Вечерний подъём к смотровой площадке' },
	{ title: 'Закат у кромки леса', description: 'Фототур с гидом · 3 часа' },
	{ title: 'Пустынные холмы', description: 'Джип-тур по каньонам' },
]

/** Слайды-фотографии с подписями: изображения — SVG data URI, без сети. */
const SLIDES: SliderItem[] = STORY_IMAGES.map((image, index) => ({ src: image.src, alt: image.alt, ...TOURS[index] }))

/** Те же фотографии без подписей — для компактных витрин. */
const PHOTOS: SliderItem[] = STORY_IMAGES.map(image => ({ src: image.src, alt: image.alt }))

const LONG_SLIDES: SliderItem[] = [
	{
		...SLIDES[0]!,
		title: 'Многодневный поход по северному склону хребта с ночёвками в палатках, переправами через горные ручьи, днёвкой у ледникового озера и восхождением на вершину к рассвету',
		description:
			'Маршрут для подготовленных туристов: перепад высот около полутора километров, переправы через ручьи, ' +
			'снаряжение выдаётся на базе, группа до десяти человек, опытный инструктор и страховка включены в стоимость.',
	},
	SLIDES[1]!,
]

const PROMOS = [
	{
		title: 'Скидка 20% на весенние туры',
		subtitle: 'До 31 мая',
		text: 'Бронируйте маршруты апреля и мая со скидкой — места ограничены.',
	},
	{ title: 'Снаряжение в аренду', subtitle: 'Новое', text: 'Палатки, спальники и треккинговые палки — прямо на базе маршрута.' },
	{
		title: 'Подарочный сертификат',
		subtitle: 'Любой номинал',
		text: 'Подарите поход: сертификат действует год и подходит для всех туров.',
	},
	{ title: 'Клуб путешественников', subtitle: 'Бесплатно', text: 'Накопительные баллы за каждый маршрут и закрытые встречи с гидами.' },
]

/** Слайды для примера со своим содержимым: поля src не используются — слайд рисует слот default. */
const PROMO_ITEMS: SliderItem[] = PROMOS.map(promo => ({ src: '', alt: promo.title, title: promo.title }))

/** Точка/миниатюра, ведущая на слайд N (1…), помечена aria-current, если слайд текущий. */
function sliderNav(root: HTMLElement, number: number, total = SLIDES.length): HTMLElement {
	return within(root).getAllByRole('button', { name: `Слайд ${number} из ${total}` })[0]!
}

const meta = {
	title: 'Data/BaseSlider',
	component: BaseSlider,
	parameters: {
		docs: {
			description: {
				component: [
					'Карусель изображений, видео или своих слайдов (слот `default`) со стрелками, точками или миниатюрами.',
					'',
					'- Навигация: `navigation` — точки, миниатюры, оба варианта или ничего; стрелки `hasArrows` — по бокам',
					'  (`arrowsPosition="center"`) или снаружи в углах. Если листать нечего, стрелки и навигация не выводятся.',
					'- Смена слайдов: `animation` (slide, fade, scale, flip), свайп и перетаскивание мышью; несколько слайдов',
					'  на экране — `slidesPerView`, шаг — `slidesPerGroup`, промежуток — `spaceBetween`.',
					'- Автопрокрутка `isAutoplay` останавливается, пока указатель над слайдером или фокус внутри него,',
					'  и не запускается при системной настройке «уменьшить движение».',
					'- Доступность: у стрелок, точек и миниатюр есть имена («Следующий слайд», «Слайд 2 из 6»), текущая точка',
					'  помечена `aria-current`; невидимые слайды `inert` — их содержимое не попадает в порядок Tab.',
				].join('\n'),
			},
		},
	},
	argTypes: {
		...baseArgTypes(),
		...hiddenArgTypes('variant', 'color'),
		items: { control: 'object', table: propGroup(ARG_GROUP.content) },
		hasCaption: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
		height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
		navigation: { control: 'inline-radio', options: ['dots', 'thumbnails', 'both', 'none'], table: propGroup(ARG_GROUP.appearance) },
		hasArrows: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		arrowsPosition: {
			control: 'inline-radio',
			options: ['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
			table: propGroup(ARG_GROUP.appearance),
		},
		isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
		spaceBetween: { control: { type: 'number', min: 0, max: 48, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
		slidesPerView: { control: { type: 'number', min: 1, max: 4 }, table: propGroup(ARG_GROUP.appearance) },
		animation: { control: 'inline-radio', options: ['slide', 'fade', 'scale', 'flip'], table: propGroup(ARG_GROUP.behavior) },
		slidesPerGroup: { control: { type: 'number', min: 1, max: 4 }, table: propGroup(ARG_GROUP.behavior) },
		isLoop: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		isAutoplay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		autoplayInterval: { control: { type: 'number', min: 1000, step: 500 }, table: propGroup(ARG_GROUP.behavior) },
		initialIndex: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
		isZoomable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
		default: { control: false },
		caption: { control: false },
		header: { control: false },
		footer: { control: false },
	},
	args: {
		items: SLIDES,
		animation: 'slide',
		navigation: 'dots',
		hasArrows: true,
		arrowsPosition: 'center',
		isLoop: true,
		isAutoplay: false,
		autoplayInterval: 4000,
		isVertical: false,
		initialIndex: 0,
		height: '400px',
		spaceBetween: 0,
		slidesPerView: 1,
		slidesPerGroup: 1,
		hasCaption: true,
		isZoomable: false,
		sizeScale: 100,
		onChange: fn(),
		onNext: fn(),
		onPrev: fn(),
	},
	// Ширина примера — 560px; витрины с несколькими слайдами на экране задают parameters.maxWidth
	decorators: [
		(_, { parameters }) => ({ template: `<div style="width: 100%; max-width: ${parameters.maxWidth ?? 560}px;"><story /></div>` }),
	],
} satisfies Meta<typeof BaseSlider>

export default meta
type Story = StoryObj<typeof meta>

// ─── Default ───────────────────────────────────────────────────────────────────

/** Песочница: стрелки листают по одному слайду, точки ведут на нужный слайд; смена вызывает `change`. */
export const Default: Story = {
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		await expect(args.onNext).toHaveBeenCalledOnce()

		await userEvent.click(sliderNav(canvasElement, 4))
		await expect(sliderNav(canvasElement, 4)).toHaveAttribute('aria-current', 'true')
		await expect(args.onChange).toHaveBeenLastCalledWith(3)
	},
}

// ─── Навигация и стрелки ───────────────────────────────────────────────────────

/**
 * Миниатюры вместо точек: лента под слайдами прокручивается, если не помещается; у текущей — кольцо основного цвета.
 * `navigation="both"` выводит точки и миниатюры вместе.
 */
export const Thumbnails: Story = {
	args: { navigation: 'thumbnails', height: '420px' },
	play: async ({ canvasElement, userEvent, args }) => {
		await userEvent.click(sliderNav(canvasElement, 3))
		await expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true')
		await expect(sliderNav(canvasElement, 1)).not.toHaveAttribute('aria-current')
		await expect(args.onChange).toHaveBeenLastCalledWith(2)
	},
}

/**
 * Позиции стрелок: `center` (по умолчанию) — поверх слайдов по бокам; угловые — снаружи, над или под областью
 * слайдов (оставьте для них место). Снаружи стрелки контурные, поверх фото — приподнятые с тенью.
 */
export const ArrowPositions: Story = {
	parameters: {
		maxWidth: 720,
		controls: { include: ['isLoop', 'sizeScale'] },
		docs: {
			source: {
				code: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
					.map(position => `<BaseSlider :items="slides" arrows-position="${position}" navigation="none" height="160px" />`)
					.join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['items', 'arrowsPosition', 'navigation', 'height', 'hasCaption']),
			positions: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
			// Подпись слайда называет позицию: над и под областью слайдов место занято стрелками
			slidesFor: (position: string) => PHOTOS.slice(0, 3).map(photo => ({ ...photo, title: position })),
		}),
		template: `
			<div class="story-grid" style="--story-grid-min: 300px; row-gap: 96px; padding: 40px 0;">
				<BaseSlider
					v-for="position in positions"
					:key="position"
					v-bind="props"
					:items="slidesFor(position)"
					:arrows-position="position"
					navigation="none"
					height="160px" />
			</div>
		`,
	}),
}

// ─── Режимы ────────────────────────────────────────────────────────────────────

/**
 * Смена растворением (`animation="fade"`); `scale` и `flip` работают так же. Слайды лежат друг на друге,
 * но клики и Tab достаются только видимому.
 */
export const Fade: Story = {
	args: { animation: 'fade' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')

		// Под центром области слайдов — второй слайд, а не последний из лежащих сверху невидимых
		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		const { left, top, width, height } = viewport.getBoundingClientRect()
		await waitFor(() => {
			const hit = document.elementFromPoint(left + width / 2, top + height / 2)
			expect(hit?.closest('.base-slider__slide')).toHaveClass('base-slider__slide--active')
		})
	},
}

/**
 * Автопрокрутка каждые `autoplayInterval` мс. Останавливается, пока указатель над слайдером или фокус внутри,
 * и отключена при системной настройке «уменьшить движение».
 */
export const Autoplay: Story = {
	args: { isAutoplay: true, autoplayInterval: 3000 },
}

/** Без зацикливания (`isLoop=false`): на первом слайде недоступна стрелка «назад», на последнем — «вперёд». */
export const WithoutLoop: Story = {
	args: { isLoop: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'Предыдущий слайд' })).toBeDisabled()

		await userEvent.click(sliderNav(canvasElement, 6))
		await expect(canvas.getByRole('button', { name: 'Следующий слайд' })).toBeDisabled()
		await expect(canvas.getByRole('button', { name: 'Предыдущий слайд' })).toBeEnabled()
	},
}

/** Вертикальная карусель: слайды сменяются сверху вниз, стрелки — сверху и снизу, точки — справа. */
export const Vertical: Story = {
	args: { isVertical: true, height: '360px', hasCaption: false },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		const track = canvasElement.querySelector<HTMLElement>('.base-slider__track')!
		await expect(track.style.transform).toContain('translateY')
	},
}

/**
 * Несколько слайдов на экране: `slidesPerView` — сколько видно, `slidesPerGroup` — на сколько листать,
 * `spaceBetween` — промежуток в px (при нём скругляется каждый слайд). Точка — позиция первого видимого слайда.
 */
export const SlidesPerView: Story = {
	args: { items: PHOTOS, slidesPerView: 3, spaceBetween: 12, height: '160px' },
	parameters: { maxWidth: 720 },
	play: async ({ canvasElement, userEvent }) => {
		const slides = canvasElement.querySelectorAll<HTMLElement>('.base-slider__slide')
		// Видны три слайда, остальные inert: их содержимое вне порядка Tab
		await expect(slides[2]).not.toHaveAttribute('inert')
		await expect(slides[3]).toHaveAttribute('inert')

		await userEvent.click(sliderNav(canvasElement, 2))
		await expect(slides[0]).toHaveAttribute('inert')
		await expect(slides[3]).not.toHaveAttribute('inert')
	},
}

/**
 * Зум по клику (`isZoomable`): изображение слайда открывает просмотр. Перетаскивание слайда мышью листает
 * карусель и не открывает просмотр — клик после перетаскивания гасится.
 */
export const WithZoom: Story = {
	args: { isZoomable: true },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const viewport = canvasElement.querySelector<HTMLElement>('.base-slider__viewport')!
		const { left, top, width, height } = viewport.getBoundingClientRect()
		const y = top + height / 2
		await userEvent.pointer([
			{
				keys: '[MouseLeft>]',
				target: canvas.getByRole('button', { name: 'Горы на рассвете' }),
				coords: { clientX: left + width * 0.8, clientY: y },
			},
			{ coords: { clientX: left + width * 0.2, clientY: y } },
			{ keys: '[/MouseLeft]' },
		])
		await expect(sliderNav(canvasElement, 2)).toHaveAttribute('aria-current', 'true')
		await expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Горы в тумане' }))
		await expect(await screen.findByRole('dialog', { name: 'Просмотр изображения: Горы в тумане' })).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
	},
}

// ─── Содержимое ────────────────────────────────────────────────────────────────

/**
 * Свои слайды: слот `default` получает `{ item, index }` и рисует любое содержимое — здесь карточки акций
 * с кнопкой. Слоты `header` и `footer` — над и под каруселью, `caption` — своя подпись. Стрелки `top-right`
 * встают справа от заголовка из слота `header`. Кнопки на невидимых слайдах недоступны с клавиатуры, пока
 * слайд не станет видимым.
 */
export const CustomSlide: Story = {
	args: {
		items: PROMO_ITEMS,
		height: '300px',
		slidesPerView: 2,
		spaceBetween: 16,
		hasCaption: false,
		arrowsPosition: 'top-right',
	},
	parameters: {
		maxWidth: 720,
		docs: {
			source: {
				code: [
					'<BaseSlider :items="promos" :slides-per-view="2" :space-between="16" :has-caption="false" arrows-position="top-right">',
					'  <template #header>…</template>',
					'  <template #default="{ item }">',
					'    <BaseCard variant="soft" :title="item.title" height="100%">…</BaseCard>',
					'  </template>',
					'</BaseSlider>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider, BaseCard, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), promos: PROMOS }),
		template: `
			<BaseSlider v-bind="props">
				<template #header>
					<div class="story-row" style="min-height: 32px; margin-bottom: 8px;">
						<strong>Акции недели</strong>
					</div>
				</template>
				<template #default="{ index }">
					<BaseCard variant="soft" :title="promos[index].title" :subtitle="promos[index].subtitle" height="100%">
						<div class="story-col">
							<span>{{ promos[index].text }}</span>
							<BaseButton variant="outline">Подробнее</BaseButton>
						</div>
					</BaseCard>
				</template>
			</BaseSlider>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [first, , third] = canvas.getAllByRole('button', { name: 'Подробнее' })
		await tabTo(first!, userEvent)
		// Третья карточка за краем: её кнопка вне порядка Tab, пока слайд не станет видимым
		await expect(third!.closest('[inert]')).not.toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Следующий слайд' }))
		await expect(third!.closest('[inert]')).toBeNull()
	},
}

// ─── Состояния ─────────────────────────────────────────────────────────────────

/**
 * Без слайдов: пустая область без стрелок и навигации. Когда данных нет, покажите вместо слайдера пустое
 * состояние (например, BaseEmpty).
 */
export const Empty: Story = {
	args: { items: [], height: '240px' },
	play: async ({ canvas }) => {
		await expect(canvas.queryAllByRole('button')).toHaveLength(0)
	},
}

/**
 * Пока слайды загружаются, передайте заглушки: `items` нужной длины и `BaseSkeleton` в слоте `default`.
 * Навигацию на время загрузки можно скрыть (`hasArrows=false`, `navigation="none"`).
 */
export const Loading: Story = {
	args: {
		items: PROMO_ITEMS.slice(0, 3),
		height: '220px',
		slidesPerView: 2,
		spaceBetween: 16,
		hasArrows: false,
		navigation: 'none',
		hasCaption: false,
	},
	parameters: {
		maxWidth: 720,
		docs: {
			source: {
				code: [
					'<BaseSlider :items="placeholders" :has-arrows="false" navigation="none" :has-caption="false">',
					'  <template #default><BaseSkeleton shape="rect" width="100%" height="100%" /></template>',
					'</BaseSlider>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseSlider, BaseSkeleton },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<BaseSlider v-bind="props">
				<template #default>
					<BaseSkeleton shape="rect" width="100%" height="100%" />
				</template>
			</BaseSlider>
		`,
	}),
}

/** Длинные подписи обрезаются до двух строк заголовка и двух строк описания и не закрывают снимок целиком. */
export const LongContent: Story = {
	args: { items: LONG_SLIDES, height: '320px' },
	play: async ({ canvasElement }) => {
		// Высоту строк меряем после загрузки шрифтов: с запасным шрифтом заголовок может уместиться в две строки
		await document.fonts.ready
		const slide = canvasElement.querySelector<HTMLElement>('.base-slider__slide')!
		const caption = slide.querySelector<HTMLElement>('.base-slider__caption')!
		const title = within(caption).getByRole('heading', { level: 3 })
		await expect(title.scrollHeight).toBeGreaterThan(title.clientHeight)
		await expect(caption.getBoundingClientRect().top).toBeGreaterThan(slide.getBoundingClientRect().top)
	},
}

// ─── Доступность ───────────────────────────────────────────────────────────────

/**
 * Клавиатура: Tab до стрелок (кольцо фокуса), Enter и Space листают; дальше Tab — к точкам.
 * Пока фокус внутри слайдера, автопрокрутка стоит.
 */
export const Keyboard: Story = {
	tags: ['!autodocs'],
	play: async ({ canvas, canvasElement, userEvent }) => {
		const next = canvas.getByRole('button', { name: 'Следующий слайд' })
		await tabTo(next, userEvent)
		await expect(getComputedStyle(next).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await userEvent.keyboard(' ')
		await expect(sliderNav(canvasElement, 3)).toHaveAttribute('aria-current', 'true')

		await userEvent.tab()
		const firstDot = sliderNav(canvasElement, 1)
		await expect(firstDot).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(firstDot).toHaveAttribute('aria-current', 'true'), { timeout: STORY_WAIT_TIMEOUT })
	},
}
