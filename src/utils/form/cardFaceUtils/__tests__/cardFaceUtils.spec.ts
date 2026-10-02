import { setLocale } from '@/locales/state'
import { CARD_BRANDS, type CardBrand, defineCardBrand } from '@utils/form/cardUtils'
import {
	CARD_BRAND_BACKGROUNDS,
	CARD_BRAND_ICON_PATHS,
	CARD_BRAND_ICON_VIEW_BOX,
	CARD_FACE_DEFAULT_BACKGROUND,
	CARD_FACE_DOT,
	cardBrandName,
	cardFaceBackground,
	maskedCardNumber,
} from '..'

function kitBrand(id: string): CardBrand {
	const brand = CARD_BRANDS.find(item => item.id === id)
	if (!brand) throw new Error(`нет марки ${id}`)
	return brand
}

describe('cardFaceUtils', () => {
	afterEach(() => {
		setLocale('ru')
	})

	describe('cardBrandName', () => {
		it('«Мир» берёт из словаря текущего языка', () => {
			expect(cardBrandName(kitBrand('mir'))).toBe('Мир')
			setLocale('en')
			expect(cardBrandName(kitBrand('mir'))).toBe('Mir')
		})

		it('у остальных марок — name марки', () => {
			expect(cardBrandName(kitBrand('visa'))).toBe(kitBrand('visa').name)
			expect(cardBrandName(defineCardBrand({ id: 'own', name: 'Своя', prefixes: ['7'] }))).toBe('Своя')
		})
	})

	describe('maskedCardNumber', () => {
		it('без марки — 16 знаков группами по 4, недостающие — точками', () => {
			expect(maskedCardNumber('', undefined)).toBe('•••• •••• •••• ••••')
			expect(maskedCardNumber('4242', undefined)).toBe('4242 •••• •••• ••••')
		})

		it('группы и длина — по марке: Amex 4-6-5', () => {
			expect(maskedCardNumber('3782', kitBrand('amex'))).toBe('3782 •••••• •••••')
		})

		it('марка с несколькими длинами и 16 среди них — 16 знаков', () => {
			const brand = defineCardBrand({ id: 'multi', name: 'Multi', prefixes: ['7'], lengths: [13, 16, 19] })
			expect(maskedCardNumber('', brand).replace(/ /g, '')).toHaveLength(16)
		})

		it('марка без 16 в длинах — по самой короткой', () => {
			const brand = defineCardBrand({ id: 'short', name: 'Short', prefixes: ['7'], lengths: [15, 14] })
			expect(maskedCardNumber('', brand).replace(/ /g, '')).toBe(CARD_FACE_DOT.repeat(14))
		})

		it('своя марка с пустым lengths — 16 знаков', () => {
			const brand = { ...defineCardBrand({ id: 'empty', name: 'Empty', prefixes: ['7'] }), lengths: [] }
			expect(maskedCardNumber('', brand).replace(/ /g, '')).toHaveLength(16)
		})

		it('цифр больше длины — показывает все', () => {
			expect(maskedCardNumber('4242424242424242123', undefined)).toBe('4242 4242 4242 4242 123')
		})
	})

	describe('cardFaceBackground', () => {
		it('свой фон приложения важнее фона марки', () => {
			expect(cardFaceBackground(kitBrand('visa'), 'red')).toBe('red')
		})

		it('фон марки, а у марки без своего фона и без марки — общий', () => {
			expect(cardFaceBackground(kitBrand('visa'), undefined)).toBe(CARD_BRAND_BACKGROUNDS.visa)
			expect(cardFaceBackground(kitBrand('troy'), '')).toBe(CARD_FACE_DEFAULT_BACKGROUND)
			expect(cardFaceBackground(undefined, undefined)).toBe(CARD_FACE_DEFAULT_BACKGROUND)
		})

		it('фоны — градиенты на токенах палитры', () => {
			for (const background of [CARD_FACE_DEFAULT_BACKGROUND, ...Object.values(CARD_BRAND_BACKGROUNDS)])
				expect(background).toMatch(/^linear-gradient\(135deg, var\(--rise-color-[a-z]+-\d+\), var\(--rise-color-[a-z]+-\d+\)\)$/)
		})
	})

	describe('значки марок', () => {
		it('контуры есть только у марок кита и в поле 576×512', () => {
			const ids = new Set(CARD_BRANDS.map(brand => brand.id))
			expect(Object.keys(CARD_BRAND_ICON_PATHS).every(id => ids.has(id))).toBe(true)
			expect(CARD_BRAND_ICON_VIEW_BOX).toBe('0 0 576 512')
		})
	})
})
