import '@testing-library/jest-dom/vitest'
import BaseCommentThread from '../ui/BaseCommentThread.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseCommentThread: ввод через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Ctrl+Enter при подтверждении слова не отправляет комментарий', async (_name, init) => {
		const { emitted } = render(BaseCommentThread, { props: { comments: [] } })
		const field = screen.getByRole('textbox')

		await fireEvent.compositionStart(field)
		await fireEvent.update(field, '很好')
		await fireEvent.keyDown(field, { key: 'Enter', ctrlKey: true, ...init })
		expect(emitted().reply).toBeUndefined()

		await fireEvent.compositionEnd(field)
		await fireEvent.keyDown(field, { key: 'Enter', ctrlKey: true, keyCode: 13 })
		expect(emitted().reply).toBeDefined()
	})
})
