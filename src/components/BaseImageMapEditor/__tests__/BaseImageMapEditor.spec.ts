import '@testing-library/jest-dom/vitest'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseImageMapEditor unit', () => {
	it('связывает подпись с полем', () => {
		render(BaseImageMapEditor, { props: { label: 'Название' } })
		expect(screen.getByLabelText('Название')).toBeInTheDocument()
	})

	it('эмитит update:modelValue при вводе', async () => {
		const { emitted } = render(BaseImageMapEditor, { props: { label: 'Название' } })
		await fireEvent.update(screen.getByLabelText('Название'), 'Отчёт')
		expect(emitted()['update:modelValue']).toEqual([['Отчёт']])
	})

	it('связывает ошибку с полем и помечает его невалидным', () => {
		render(BaseImageMapEditor, { props: { label: 'Название', error: 'Заполните название' } })
		const field = screen.getByLabelText('Название')
		expect(field).toHaveAccessibleDescription('Заполните название')
		expect(field).toHaveAttribute('aria-invalid', 'true')
	})

	it('без ошибки не ставит aria-invalid и aria-describedby', () => {
		render(BaseImageMapEditor, { props: { label: 'Название' } })
		const field = screen.getByLabelText('Название')
		expect(field).not.toHaveAttribute('aria-invalid')
		expect(field).not.toHaveAttribute('aria-describedby')
	})

	it('отключает поле при isDisabled', () => {
		render(BaseImageMapEditor, { props: { label: 'Название', isDisabled: true } })
		expect(screen.getByLabelText('Название')).toBeDisabled()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseImageMapEditor, { props: { variant: 'outline' } })
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('base-image-map-editor--outline')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseImageMapEditor, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-image-map-editor') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseImageMapEditor, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-image-map-editor')).toHaveClass('my-root')
	})
})
