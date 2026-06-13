/**
 * Unit-тесты для clipboardUtils.
 * Покрывают copyTextToClipboard.
 */

import { copyTextToClipboard } from './clipboardUtils'

describe('clipboardUtils', () => {
	describe('copyTextToClipboard', () => {
		it('копирует текст через navigator.clipboard', async () => {
			const writeText = vi.fn().mockResolvedValue(undefined)
			Object.assign(navigator, { clipboard: { writeText } })

			await copyTextToClipboard('Hello')

			expect(writeText).toHaveBeenCalledWith('Hello')
		})

		it('не падает когда navigator.clipboard отсутствует', async () => {
			Object.assign(navigator, { clipboard: undefined })

			await expect(copyTextToClipboard('Hello')).resolves.toBeUndefined()
		})
	})
})
