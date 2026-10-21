import '@testing-library/jest-dom/vitest'
import { setLocale } from '@/locales/state'
import { createUiKitPlugin } from '@/plugin'
import BaseBankCard from '../ui/BaseBankCard.vue'
import { render, screen } from '@testing-library/vue'
import { defineCardBrand } from '@utils/form/cardUtils'
import { CARD_BRAND_BACKGROUNDS, CARD_FACE_DEFAULT_BACKGROUND } from '@utils/form/cardFaceUtils'

describe('BaseBankCard unit', () => {
	it('рендерит label', () => {
		render(BaseBankCard, { props: { label: 'Пример' } })
		expect(screen.getByText('Пример')).toBeInTheDocument()
	})

	it('слот default заменяет label', () => {
		render(BaseBankCard, { props: { label: 'Пример' }, slots: { default: 'Из слота' } })
		expect(screen.getByText('Из слота')).toBeInTheDocument()
		expect(screen.queryByText('Пример')).not.toBeInTheDocument()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseBankCard, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-bank-card')).toHaveClass('base-bank-card--soft')
	})

	it('вариант shadow добавляет модификатор --shadow', () => {
		const { container } = render(BaseBankCard, { props: { variant: 'shadow' } })
		expect(container.querySelector('.base-bank-card')).toHaveClass('base-bank-card--shadow')
	})

	it('по умолчанию модификатора --shadow нет', () => {
		const { container } = render(BaseBankCard)
		expect(container.querySelector('.base-bank-card')).not.toHaveClass('base-bank-card--shadow')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseBankCard, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-bank-card') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseBankCard, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-bank-card')).toHaveClass('my-root')
	})
})

describe('BaseBankCard сохранённая карта', () => {
	const root = (container: Element) => container.querySelector('.base-bank-card') as HTMLElement
	const part = (container: Element, name: string) => container.querySelector(`.base-bank-card__${name}`)

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['Date'] })
		vi.setSystemTime(new Date(2026, 9, 2, 12))
	})

	afterEach(() => {
		vi.useRealTimers()
		setLocale('ru')
	})

	it('полная карта: •••• 4242, марка, срок, имя, сводка для чтения с экрана', () => {
		const { container } = render(BaseBankCard, {
			props: { brand: 'visa', last4: '4242', expiry: { month: 12, year: 2030 }, holder: 'IVAN IVANOV' },
		})
		expect(root(container)).toHaveClass('base-bank-card--full')
		expect(root(container)).not.toHaveClass('base-bank-card--expired')
		expect(part(container, 'number')?.textContent).toBe('•••• 4242')
		expect(part(container, 'expiry')).toHaveTextContent('12/30')
		expect(part(container, 'holder')).toHaveTextContent('IVAN IVANOV')
		expect(part(container, 'brand')?.querySelector('svg.card-brand-mark__icon')).not.toBeNull()
		expect(part(container, 'expired')).toBeNull()
		expect(part(container, 'label')).toBeNull()
		expect(screen.getByText('Visa, номер заканчивается на 4242, срок до 12/30')).toHaveClass('base-bank-card__summary')
	})

	it('видимые части скрыты от чтения с экрана — имя карты только из сводки', () => {
		const { container } = render(BaseBankCard, { props: { brand: 'visa', last4: '4242', expiry: '12/30', holder: 'IVAN' } })
		for (const name of ['brand', 'number', 'holder', 'expiry']) expect(part(container, name)).toHaveAttribute('aria-hidden', 'true')
		expect(root(container)).toHaveTextContent(/^Visa, номер заканчивается на 4242, срок до 12\/30/)
	})

	it('срок строкой ММ/ГГ и объектом с одной цифрой месяца', async () => {
		const { container, rerender } = render(BaseBankCard, { props: { last4: '1111', expiry: '07/31' } })
		expect(part(container, 'expiry')).toHaveTextContent('07/31')
		await rerender({ last4: '1111', expiry: { month: 1, year: 2020 } })
		expect(part(container, 'expiry')).toHaveTextContent('01/20')
		expect(screen.getByText('Карта, номер заканчивается на 1111, срок истёк 01/20')).toBeInTheDocument()
	})

	it('истекла по сроку: месяц раньше текущего — истекла, текущий — нет', async () => {
		const { container, rerender } = render(BaseBankCard, { props: { brand: 'mir', last4: '0005', expiry: '09/26' } })
		expect(root(container)).toHaveClass('base-bank-card--expired')
		expect(part(container, 'expired')).toHaveTextContent('Истекла')
		expect(screen.getByText('Мир, номер заканчивается на 0005, срок истёк 09/26')).toBeInTheDocument()
		await rerender({ brand: 'mir', last4: '0005', expiry: '10/26' })
		expect(root(container)).not.toHaveClass('base-bank-card--expired')
		expect(part(container, 'expired')).toBeNull()
		expect(screen.getByText('Мир, номер заканчивается на 0005, срок до 10/26')).toBeInTheDocument()
	})

	it('isExpired сильнее срока; без срока — только метка «Истекла»', async () => {
		const { container, rerender } = render(BaseBankCard, { props: { last4: '4242', expiry: '12/30', isExpired: true } })
		expect(root(container)).toHaveClass('base-bank-card--expired')
		await rerender({ last4: '4242', expiry: '09/26', isExpired: false })
		expect(root(container)).not.toHaveClass('base-bank-card--expired')
		await rerender({ last4: '4242', expiry: null, isExpired: true })
		expect(part(container, 'expiry')?.textContent?.trim()).toBe('Истекла')
		expect(screen.getByText('Карта, номер заканчивается на 4242')).toBeInTheDocument()
	})

	it('без марки, без срока и с нераспознанным сроком: «Карта», ни срока, ни «Истекла»', async () => {
		const { container, rerender } = render(BaseBankCard, { props: { last4: '1111' } })
		expect(part(container, 'brand')?.children).toHaveLength(0)
		expect(part(container, 'expiry')).toBeNull()
		expect(screen.getByText('Карта, номер заканчивается на 1111')).toBeInTheDocument()
		await rerender({ last4: '1111', expiry: 'скоро', brand: 'unknown' })
		expect(part(container, 'expiry')).toBeNull()
		expect(root(container)).not.toHaveClass('base-bank-card--expired')
		expect(screen.getByText('Карта, номер заканчивается на 1111')).toBeInTheDocument()
	})

	it('без last4 и с last4: null из данных эквайера — только точки', async () => {
		const { container, rerender } = render(BaseBankCard)
		expect(part(container, 'number')?.textContent).toBe('•••• ')
		await rerender({ last4: null as unknown as string })
		expect(part(container, 'number')?.textContent).toBe('•••• ')
		expect(screen.getByText('Карта, номер заканчивается на')).toBeInTheDocument()
	})

	it('своя марка объектом и картинка из brandIcons', () => {
		const club = defineCardBrand({ id: 'club', name: 'Club', prefixes: ['77'] })
		const { container } = render(BaseBankCard, { props: { brand: club, last4: '7777', brandIcons: { club: '/club.svg' } } })
		expect(part(container, 'brand')?.querySelector('img')).toHaveAttribute('src', '/club.svg')
		expect(screen.getByText('Club, номер заканчивается на 7777')).toBeInTheDocument()
	})

	it('фон полной карты: по марке, по умолчанию без марки, свой background сильнее', async () => {
		const background = (container: Element) => root(container).style.getPropertyValue('--base-bank-card-bg')
		const { container, rerender } = render(BaseBankCard, { props: { brand: 'visa', last4: '4242' } })
		expect(background(container)).toBe(CARD_BRAND_BACKGROUNDS.visa)
		await rerender({ brand: null, last4: '4242' })
		expect(background(container)).toBe(CARD_FACE_DEFAULT_BACKGROUND)
		await rerender({ brand: 'visa', last4: '4242', background: 'linear-gradient(red, blue)' })
		expect(background(container)).toBe('linear-gradient(red, blue)')
	})

	it('вид compact: строка без фона карты и без имени, с label и сводкой', () => {
		const { container } = render(BaseBankCard, {
			props: {
				brand: 'mastercard',
				last4: '4444',
				expiry: '05/28',
				holder: 'IVAN',
				label: 'Рабочая',
				isCompact: true,
				variant: 'outline',
			},
		})
		expect(root(container)).toHaveClass('base-bank-card--compact', 'base-bank-card--outline')
		expect(root(container)).not.toHaveClass('base-bank-card--full')
		expect(root(container).style.getPropertyValue('--base-bank-card-bg')).toBe('')
		expect(part(container, 'holder')).toBeNull()
		expect(part(container, 'label')).toHaveTextContent('Рабочая')
		expect(part(container, 'number')?.textContent).toBe('•••• 4444')
		expect(screen.getByText('Mastercard, номер заканчивается на 4444, срок до 05/28')).toBeInTheDocument()
	})

	it('customClass частей', () => {
		const { container } = render(BaseBankCard, {
			props: {
				brand: 'visa',
				last4: '4242',
				expiry: '12/30',
				label: 'Основная',
				customClass: { brand: 'my-brand', number: 'my-number', expiry: 'my-expiry', label: 'my-label' },
			},
		})
		expect(part(container, 'brand')).toHaveClass('my-brand')
		expect(part(container, 'number')).toHaveClass('my-number')
		expect(part(container, 'expiry')).toHaveClass('my-expiry')
		expect(part(container, 'label')).toHaveClass('my-label')
	})

	it('сводка по-английски', () => {
		setLocale('en')
		render(BaseBankCard, { props: { brand: 'visa', last4: '4242', expiry: '12/30' } })
		expect(screen.getByText('Visa ending in 4242, expires 12/30')).toBeInTheDocument()
	})

	it('умолчания из плагина: defaults.BaseBankCard', () => {
		const { container } = render(BaseBankCard, {
			props: { last4: '4242' },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBankCard: { isCompact: true } } })] },
		})
		expect(root(container)).toHaveClass('base-bank-card--compact')
	})
})

describe('BaseBankCard обложка', () => {
	const IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E'
	const GRADIENT = 'linear-gradient(135deg, var(--rise-color-primary-700), var(--rise-color-primary-950))'
	const root = (container: Element) => container.querySelector('.base-bank-card') as HTMLElement
	const cover = (container: Element) => container.querySelector('.card-cover') as HTMLElement | null

	it('без обложки — слоя нет', () => {
		const { container } = render(BaseBankCard, { props: { brand: 'visa', last4: '4242' } })
		expect(cover(container)).toBeNull()
		expect(root(container)).not.toHaveClass('base-bank-card--cover')
	})

	it('полный вид: картинка на всей карте, затемнение по умолчанию, фон марки остаётся под ней', () => {
		const { container } = render(BaseBankCard, { props: { brand: 'visa', last4: '4242', cover: IMAGE } })
		expect(root(container)).toHaveClass('base-bank-card--cover')
		expect(cover(container)?.parentElement).toBe(root(container))
		expect(cover(container)?.querySelector('img')).toHaveAttribute('src', IMAGE)
		expect(cover(container)?.querySelector('.card-cover__overlay')).not.toBeNull()
		expect(root(container).style.getPropertyValue('--base-bank-card-bg')).toBe(CARD_BRAND_BACKGROUNDS.visa)
	})

	it('градиент без затемнения: hasCoverOverlay = false', () => {
		const { container } = render(BaseBankCard, { props: { cover: GRADIENT, hasCoverOverlay: false } })
		expect(cover(container)?.querySelector('.card-cover__fill')).not.toBeNull()
		expect(cover(container)?.querySelector('.card-cover__overlay')).toBeNull()
	})

	it('слот cover без пропа', () => {
		const { container } = render(BaseBankCard, { slots: { cover: '<i class="my-cover" />' } })
		expect(root(container)).toHaveClass('base-bank-card--cover')
		expect(cover(container)?.querySelector('.my-cover')).not.toBeNull()
	})

	it('компактный вид: мини-карта с обложкой вместо плашки марки, фон по марке под ней', () => {
		const { container } = render(BaseBankCard, { props: { brand: 'visa', last4: '4242', isCompact: true, cover: IMAGE } })
		const brand = container.querySelector('.base-bank-card__brand') as HTMLElement
		expect(brand).toHaveClass('base-bank-card__brand--cover')
		expect(cover(container)?.parentElement).toBe(brand)
		expect(brand.querySelector('.card-brand-mark')).not.toBeNull()
		expect(root(container).style.getPropertyValue('--base-bank-card-bg')).toBe(CARD_BRAND_BACKGROUNDS.visa)
	})

	it('компактный вид без обложки — без фона карты', () => {
		const { container } = render(BaseBankCard, { props: { isCompact: true } })
		expect(container.querySelector('.base-bank-card__brand')).not.toHaveClass('base-bank-card__brand--cover')
		expect(root(container).style.getPropertyValue('--base-bank-card-bg')).toBe('')
	})

	it('умолчания из плагина: hasCoverOverlay', () => {
		const { container } = render(BaseBankCard, {
			props: { cover: IMAGE },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseBankCard: { hasCoverOverlay: false } } })] },
		})
		expect(cover(container)?.querySelector('.card-cover__overlay')).toBeNull()
	})
})
