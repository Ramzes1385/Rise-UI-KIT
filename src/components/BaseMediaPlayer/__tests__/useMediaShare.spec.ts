import { useMediaShare } from '../model/useMediaShare'
import { withSetup } from './BaseMediaPlayer.test-utils'

function stubClipboard(writeText?: (text: string) => Promise<void>) {
	Object.defineProperty(navigator, 'clipboard', { configurable: true, value: writeText ? { writeText } : undefined })
}

function setup(shareUrl?: string) {
	return withSetup(() => useMediaShare({ shareUrl: () => shareUrl, timeParam: () => 't', currentTime: () => 83.7 }))
}

describe('useMediaShare', () => {
	afterEach(() => {
		Reflect.deleteProperty(navigator, 'clipboard')
		vi.useRealTimers()
	})

	it('ссылка без таймкода и с таймкодом; прежний таймкод заменяется', async () => {
		const writeText = vi.fn(async () => undefined)
		stubClipboard(writeText)
		const { result } = setup('https://example.com/watch?v=7&t=5')

		await result.copyLink()
		await result.copyLinkAtTime()
		expect(writeText.mock.calls).toEqual([['https://example.com/watch?v=7'], ['https://example.com/watch?v=7&t=83']])
		expect(result.flashMessage.value).toBe('Ссылка скопирована')
	})

	it('относительная ссылка и адрес страницы по умолчанию; сообщение исчезает через 2 с', async () => {
		vi.useFakeTimers()
		const writeText = vi.fn(async (_text: string) => undefined)
		stubClipboard(writeText)

		await setup('/watch/7').result.copyLink()
		const { result } = setup()
		await result.copyText('сведения')
		expect(writeText.mock.calls[0][0]).toBe(new URL('/watch/7', window.location.href).toString())
		expect(writeText).toHaveBeenLastCalledWith('сведения')
		expect(result.flashMessage.value).toBe('Скопировано')
		vi.advanceTimersByTime(2000)
		expect(result.flashMessage.value).toBe('')
	})

	it('без доступа к буферу обмена — сообщение об ошибке', async () => {
		stubClipboard(async () => Promise.reject(new Error('denied')))
		const denied = setup().result
		await denied.copyLink()
		expect(denied.flashMessage.value).toBe('Не удалось скопировать ссылку')

		stubClipboard()
		const missing = setup().result
		await missing.copyLinkAtTime()
		expect(missing.flashMessage.value).toBe('Не удалось скопировать ссылку')
	})
})
