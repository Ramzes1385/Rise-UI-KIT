import '@testing-library/jest-dom/vitest'
import BaseCardInput from '../ui/BaseCardInput.vue'
import userEvent from '@testing-library/user-event'
import { defineCardBrand } from '@utils/form/cardUtils'
import css from '../styles/BaseCardInput.style.scss?inline'
import { fireEvent, render, screen } from '@testing-library/vue'
import { CARD_BRAND_BACKGROUNDS, CARD_FACE_DEFAULT_BACKGROUND } from '@utils/form/cardFaceUtils'

type PreviewProps = Record<string, unknown>

function renderPreview(props: PreviewProps = {}) {
	const result = render(BaseCardInput, { props: { hasPreview: true, ...props } })
	const preview = () => result.container.querySelector('.base-card-input__preview') as HTMLElement
	const part = (name: string) => result.container.querySelector(`.base-card-input__${name}`) as HTMLElement | null
	return { ...result, preview, part }
}

const numberField = () => screen.getByLabelText('Номер карты')
const codeField = () => screen.getByLabelText(/^Код/)

async function typeNumber(value: string) {
	await fireEvent.update(numberField(), value)
}

describe('BaseCardInput превью', () => {
	it('без hasPreview превью нет', () => {
		const { container } = render(BaseCardInput)
		expect(container.querySelector('.base-card-input__preview')).toBeNull()
	})

	it('превью скрыто от чтения с экрана, стоит перед полями и берёт класс из customClass.preview', () => {
		const { preview } = renderPreview({ customClass: { preview: 'my-preview' } })
		expect(preview()).toHaveAttribute('aria-hidden', 'true')
		expect(preview()).toHaveClass('my-preview')
		expect(preview().nextElementSibling).toHaveClass('base-card-input__fields')
	})

	it('пустой номер — точки по длине лица карты', () => {
		const { part } = renderPreview()
		expect(part('face-number')).toHaveTextContent('•••• •••• •••• ••••')
	})

	it.each([
		['4242', '4242 •••• •••• ••••'],
		['378282246310005', '3782 822463 10005'],
		['3782', '3782 •••••• •••••'],
		['4111111111111111111', '4111 1111 1111 1111 111'],
		['9792', '9792 •••• •••• ••••'],
	])('номер %s на лице карты — %s', async (value, expected) => {
		const { part } = renderPreview()
		await typeNumber(value)
		expect(part('face-number')).toHaveTextContent(expected)
	})

	it('своя марка с пустым lengths: номер не вводится, на лице — 16 точек и фон по умолчанию', async () => {
		const club = defineCardBrand({ id: 'club', name: 'Club', prefixes: ['77'], lengths: [] })
		const { part, preview } = renderPreview({ brands: [club] })
		await typeNumber('77')
		expect(numberField()).toHaveValue('')
		expect(part('face-number')).toHaveTextContent('•••• •••• •••• ••••')
		expect(preview().style.getPropertyValue('--base-card-input-face-bg')).toBe(CARD_FACE_DEFAULT_BACKGROUND)
	})

	it('имя без пробелов по краям, без имени — образец', async () => {
		const { part } = renderPreview()
		expect(part('face-holder')).toHaveTextContent('IVAN IVANOV')
		await fireEvent.update(screen.getByLabelText('Имя владельца'), '  ANNA PETROVA  ')
		expect(part('face-holder')?.textContent).toBe('ANNA PETROVA')
		await fireEvent.update(screen.getByLabelText('Имя владельца'), '   ')
		expect(part('face-holder')).toHaveTextContent('IVAN IVANOV')
	})

	it('без поля имени имени на карте нет', () => {
		const { part } = renderPreview({ hasHolder: false })
		expect(part('face-holder')).toBeNull()
	})

	it('срок с подписью: образец ММ/ГГ, затем введённый срок', async () => {
		const { part } = renderPreview()
		expect(part('face-caption')).toHaveTextContent('Срок действия')
		expect(part('face-expiry')).toHaveTextContent('ММ/ГГ')
		await fireEvent.update(screen.getByLabelText('Срок действия'), '1230')
		expect(part('face-expiry')).toHaveTextContent('12/30')
	})

	it('марка на лице появляется, когда определена', async () => {
		const { part } = renderPreview()
		expect(part('face-brand')).toBeNull()
		await typeNumber('4242')
		expect(part('face-brand')).toHaveAttribute('aria-hidden', 'true')
		expect(part('face-brand')?.querySelector('svg.card-brand-mark__icon path')).toHaveAttribute('d')
	})

	it('картинка из brandIcons сильнее встроенного значка', async () => {
		const { part } = renderPreview({ brandIcons: { visa: '/visa.svg' } })
		await typeNumber('4242')
		const brand = part('face-brand')
		expect(brand?.querySelector('img.card-brand-mark__image')).toHaveAttribute('src', '/visa.svg')
		expect(brand?.querySelector('svg')).toBeNull()
	})

	it('марка без значка — название, «Мир» по-русски', async () => {
		const { part } = renderPreview()
		await typeNumber('2200')
		expect(part('face-brand')?.querySelector('.card-brand-mark__name')).toHaveTextContent('Мир')
	})

	it('оборот: без марки «Код», с маркой — имя кода, набранный код — точками без цифр', async () => {
		const { part } = renderPreview()
		expect(part('face-code')).toHaveTextContent('Код')
		await typeNumber('3782')
		expect(part('face-code')).toHaveTextContent('CID')
		await fireEvent.update(codeField(), '12')
		expect(part('face-code')?.textContent).toBe('••')
	})

	it('фокус на коде переворачивает карту, blur возвращает лицом', async () => {
		const { preview } = renderPreview()
		await fireEvent.focus(codeField())
		expect(preview()).toHaveClass('base-card-input__preview--flipped')
		await fireEvent.blur(codeField())
		expect(preview()).not.toHaveClass('base-card-input__preview--flipped')
	})

	it('Tab с кода на имя возвращает карту лицом, Shift+Tab с имени — переворачивает', async () => {
		const user = userEvent.setup()
		const { preview } = renderPreview()
		await user.click(codeField())
		expect(preview()).toHaveClass('base-card-input__preview--flipped')
		await user.tab()
		expect(screen.getByLabelText('Имя владельца')).toHaveFocus()
		expect(preview()).not.toHaveClass('base-card-input__preview--flipped')
		await user.tab({ shift: true })
		expect(codeField()).toHaveFocus()
		expect(preview()).toHaveClass('base-card-input__preview--flipped')
	})

	it('фокус в других полях карту не переворачивает', async () => {
		const user = userEvent.setup()
		const { preview } = renderPreview()
		await user.click(numberField())
		await user.tab()
		expect(screen.getByLabelText('Срок действия')).toHaveFocus()
		expect(preview()).not.toHaveClass('base-card-input__preview--flipped')
	})

	it('blur по-прежнему помечает поле: ошибка неверного номера после ухода из поля', async () => {
		renderPreview()
		await typeNumber('4242')
		await fireEvent.blur(numberField())
		expect(numberField()).toHaveAttribute('aria-invalid', 'true')
	})

	it('фон: без марки — по умолчанию, затем по марке; марка без фона — по умолчанию', async () => {
		const { preview } = renderPreview()
		const background = () => preview().style.getPropertyValue('--base-card-input-face-bg')
		expect(background()).toBe(CARD_FACE_DEFAULT_BACKGROUND)
		await typeNumber('4242')
		expect(background()).toBe(CARD_BRAND_BACKGROUNDS.visa)
		await typeNumber('2200')
		expect(background()).toBe(CARD_BRAND_BACKGROUNDS.mir)
		await typeNumber('9792')
		expect(background()).toBe(CARD_FACE_DEFAULT_BACKGROUND)
	})

	it('previewBackground сильнее фона марки', async () => {
		const { preview } = renderPreview({ previewBackground: 'linear-gradient(red, blue)' })
		await typeNumber('4242')
		expect(preview().style.getPropertyValue('--base-card-input-face-bg')).toBe('linear-gradient(red, blue)')
	})

	it('анимация переворота — только при prefers-reduced-motion: no-preference', () => {
		const motionSafePattern = /@media \(prefers-reduced-motion: no-preference\)\s*\{[^@]*?\}\s*\}/g
		const motionSafe = css.match(motionSafePattern) ?? []
		const outside = css.replace(motionSafePattern, '')
		expect(motionSafe.some(block => /__preview-inner\s*\{[^}]*transition/.test(block))).toBe(true)
		expect(outside).not.toMatch(/__preview-inner\s*\{[^}]*transition/)
	})
})
