import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import { describeSource } from '../model/cryptoProSignFormat'
import { createCryptoProSignEmulation } from '../model/emulation/cryptoProSignEmulation'

let restore: (() => void) | null = null

afterEach(() => {
	restore?.()
	restore = null
})

describe('BaseCryptoProSign — строка данных в режиме проверки', () => {
	it('describeSource — текст для проверки и текст для подписи', () => {
		expect(describeSource('abc', 'x', 'verify')).toBe('Проверяем подпись текста, 3 Б')
		expect(describeSource('abc', 'x', 'sign')).toBe('Подписываем текст, 3 Б')
		expect(describeSource(new Blob(['abcd']), 'act', 'verify')).toBe('Документ: act, 4 Б')
	})

	it('mode="verify" со строкой data — «Проверяем подпись текста», без «Подписываем»', async () => {
		restore = createCryptoProSignEmulation().install()
		render(BaseCryptoProSign, { props: { mode: 'verify', data: 'Привет', signature: 'UklTRQ==' } })
		expect(await screen.findByText('Проверяем подпись текста, 12 Б')).toBeInTheDocument()
		expect(screen.queryByText(/Подписываем текст/)).not.toBeInTheDocument()
	})

	it('mode="sign" со строкой data — «Подписываем текст»', async () => {
		restore = createCryptoProSignEmulation().install()
		render(BaseCryptoProSign, { props: { data: 'Привет' } })
		expect(await screen.findByText('Подписываем текст, 12 Б')).toBeInTheDocument()
	})
})
