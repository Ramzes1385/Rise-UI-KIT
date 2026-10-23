import '@testing-library/jest-dom/vitest'
import BaseFileUpload from '../ui/BaseFileUpload.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const LONG_NAME = 'очень-длинное-название-отчёта-за-квартал-2026.pdf'

async function addFile(container: Element): Promise<HTMLElement> {
	const input = container.querySelector<HTMLInputElement>('input[type="file"]')!
	Object.defineProperty(input, 'files', {
		value: [new File(['test'], LONG_NAME, { type: 'application/pdf' })],
		configurable: true,
	})
	await fireEvent.change(input)
	return waitFor(() => screen.getByText(LONG_NAME))
}

describe('BaseFileUpload: имя файла в подсказке', () => {
	it('у имени нет title, прежние классы и customClass.name сохранены', async () => {
		const { container } = render(BaseFileUpload, { props: { customClass: { name: 'my-name' } } })
		const name = await addFile(container)

		expect(name).not.toHaveAttribute('title')
		expect(name).toHaveClass('base-file-upload__name', 'my-name')
		expect(name.closest('.base-tooltip')).toHaveClass('base-file-upload__name-tooltip')
		expect(name.closest('.base-file-upload__info')).not.toBeNull()
	})

	it('наведение на имя показывает подсказку с полным именем файла', async () => {
		const { container } = render(BaseFileUpload)
		const name = await addFile(container)

		await fireEvent.mouseEnter(name.closest('.base-tooltip')!)
		expect(await screen.findByRole('tooltip')).toHaveTextContent(LONG_NAME)
		await fireEvent.mouseLeave(name.closest('.base-tooltip')!)
		await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull())
	})
})
