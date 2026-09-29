import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import MediaReportForm from '../ui/MediaReportForm.vue'

describe('MediaReportForm', () => {
	it('причина, комментарий и отправка', async () => {
		const user = userEvent.setup()
		const { emitted } = render(MediaReportForm, { props: { isOpen: true } })

		expect(screen.getByRole('dialog', { name: 'Что случилось с видео?' })).toBeInTheDocument()
		expect(screen.getAllByRole('radio')).toHaveLength(5)
		await user.click(screen.getByRole('radio', { name: 'Нет изображения' }))
		await user.type(screen.getByRole('textbox', { name: 'Комментарий' }), '  чёрный экран  ')
		await user.click(screen.getByRole('button', { name: 'Отправить' }))

		expect(emitted('submit')).toEqual([[{ reason: 'no-video', comment: 'чёрный экран' }]])
		expect(emitted('update:isOpen')).toEqual([[false]])
	})

	it('«Отмена» закрывает форму без отправки', async () => {
		const user = userEvent.setup()
		const { emitted } = render(MediaReportForm, { props: { isOpen: true } })

		await user.click(screen.getByRole('button', { name: 'Отмена' }))
		expect(emitted('submit')).toBeUndefined()
		expect(emitted('update:isOpen')).toEqual([[false]])
	})
})
