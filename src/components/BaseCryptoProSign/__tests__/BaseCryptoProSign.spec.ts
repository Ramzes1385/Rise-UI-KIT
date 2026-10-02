import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import type { CryptoProFailure } from '@composables/crypto/useCryptoPro'
import type { CryptoProSignResult } from '../types/BaseCryptoProSign.types'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'
import {
	NOW,
	THUMBPRINTS,
	callsOf,
	createdObjects,
	freezeDate,
	lastEmitted,
	signButton,
	renderReady,
	textToBase64,
	renderExposed,
	installEmulation,
	restoreEmulation,
	waitCertificates,
} from './cryptoProSignTestUtils'

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

async function signedResult(emitted: () => Record<string, unknown[][]>): Promise<CryptoProSignResult> {
	await waitFor(() => expect(emitted().signed).toBeTruthy())
	return lastEmitted<CryptoProSignResult>(emitted(), 'signed')
}

async function failure(emitted: () => Record<string, unknown[][]>): Promise<CryptoProFailure> {
	await waitFor(() => expect(emitted().error).toBeTruthy())
	return lastEmitted<CryptoProFailure>(emitted(), 'error')
}

async function clickSign(): Promise<void> {
	await waitFor(() => expect(signButton()).toBeEnabled())
	await userEvent.click(signButton())
}

describe('BaseCryptoProSign unit', () => {
	describe('корень', () => {
		it('рендерит область подписи', async () => {
			await renderReady()
			expect(screen.getByRole('region', { name: 'Электронная подпись' })).toBeInTheDocument()
		})

		it('добавляет модификатор варианта, кроме default', async () => {
			const { container } = await renderReady({ props: { variant: 'soft' } })
			expect(container.querySelector('.base-crypto-pro-sign')).toHaveClass('base-crypto-pro-sign--soft')
		})

		it('пишет --size-scale только при масштабе, отличном от 100', async () => {
			const { container } = await renderReady({ props: { sizeScale: 125 } })
			expect((container.querySelector('.base-crypto-pro-sign') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
		})

		it('добавляет customClass к корню', async () => {
			const { container } = await renderReady({ props: { customClass: { root: 'my-root' } } })
			expect(container.querySelector('.base-crypto-pro-sign')).toHaveClass('my-root')
		})

		it('aria-busy — пока идёт диагностика, после неё снимается', async () => {
			installEmulation()
			render(BaseCryptoProSign)
			await nextTick()
			const region = screen.getByRole('region', { name: 'Электронная подпись' })
			expect(region).toHaveAttribute('aria-busy', 'true')
			await screen.findByText(/КриптоПро CSP 5\.0\.12000/)
			expect(region).toHaveAttribute('aria-busy', 'false')
		})
	})

	describe('диагностика', () => {
		it('готово — версии плагина и CSP вместо списка шагов', async () => {
			await renderReady()
			expect(screen.getByText('КриптоПро ЭЦП Browser plug-in 2.0.15400 · КриптоПро CSP 5.0.12000')).toBeInTheDocument()
			expect(screen.queryByRole('list', { name: 'Проверяем КриптоПро' })).not.toBeInTheDocument()
		})

		it('нет плагина — шаги со словами состояния, подсказка, ссылка на плагин и событие error', async () => {
			installEmulation({ scenario: 'noPlugin' })
			const { emitted } = render(BaseCryptoProSign)
			const alert = await screen.findByRole('alert')
			expect(alert).toHaveTextContent('КриптоПро ЭЦП Browser plug-in не установлен или недоступен')
			expect(alert).toHaveTextContent('Установите КриптоПро ЭЦП Browser plug-in и расширение для браузера')
			const link = within(alert).getByRole('link', { name: /Скачать КриптоПро ЭЦП Browser plug-in/ })
			expect(link).toHaveAttribute('href', 'https://www.cryptopro.ru/products/cades/plugin')
			expect(link).toHaveAttribute('target', '_blank')
			const steps = within(screen.getByRole('list', { name: 'Проверяем КриптоПро' })).getAllByRole('listitem')
			expect(steps[0]).toHaveTextContent('Расширение для браузераготово')
			expect(steps[1]).toHaveTextContent('КриптоПро ЭЦП Browser plug-inошибка')
			expect(steps[2]).toHaveTextContent('ожидает проверки')
			expect((await failure(emitted)).code).toBe('noPlugin')
			expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
		})

		it('нет CSP — подсказка и ссылка на CSP', async () => {
			installEmulation({ scenario: 'noCsp' })
			const { emitted } = render(BaseCryptoProSign)
			const alert = await screen.findByRole('alert')
			expect(alert).toHaveTextContent('Установите криптопровайдер КриптоПро CSP 5.0 или новее')
			const link = within(alert).getByRole('link', { name: /Скачать КриптоПро CSP/ })
			expect(link).toHaveAttribute('href', 'https://www.cryptopro.ru/products/csp')
			expect((await failure(emitted)).code).toBe('noCsp')
		})

		it('нет скрипта — подсказка обратиться в поддержку, без ссылок', async () => {
			const { emitted } = render(BaseCryptoProSign)
			const alert = await screen.findByRole('alert')
			expect(alert).toHaveTextContent('Не подключён скрипт cadesplugin_api.js')
			expect(alert).toHaveTextContent('Подпись на этой странице не настроена: обратитесь в поддержку')
			expect(within(alert).queryByRole('link')).not.toBeInTheDocument()
			expect((await failure(emitted)).code).toBe('noScript')
		})

		it('«Проверить снова» повторяет диагностику', async () => {
			render(BaseCryptoProSign)
			const retry = await screen.findByRole('button', { name: 'Проверить снова' })
			installEmulation()
			await userEvent.click(retry)
			expect(await screen.findByText(/КриптоПро CSP 5\.0\.12000/)).toBeInTheDocument()
			await waitCertificates()
		})

		it('с isDisabled «Проверить снова» недоступна', async () => {
			render(BaseCryptoProSign, { props: { isDisabled: true } })
			expect(await screen.findByRole('button', { name: 'Проверить снова' })).toBeDisabled()
		})

		it('пустое хранилище — текст вместо выбора сертификата, без события error', async () => {
			const { emitted } = await renderReady({}, { scenario: 'noCertificates' })
			expect(await screen.findByText('В личном хранилище нет сертификатов')).toBeInTheDocument()
			expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
			expect(emitted().error).toBeUndefined()
		})

		it('ошибка чтения сертификатов уходит событием error', async () => {
			const { emitted } = await renderReady({}, { certificates: [{ thumbprint: 'X' } as never] })
			expect(await failure(emitted)).toBeTruthy()
		})

		it('expose check() повторяет диагностику', async () => {
			const { api } = renderExposed()
			await screen.findByText(/КриптоПро CSP/)
			await api().check()
			expect(screen.getByText(/КриптоПро CSP 5\.0\.12000/)).toBeInTheDocument()
		})
	})

	describe('сертификаты', () => {
		it('подписи вариантов: ФИО, организация, ИНН и срок; просроченный и без ключа недоступны', async () => {
			await renderReady()
			await waitCertificates()
			await fireEvent.click(screen.getByRole('combobox'))
			const options = await screen.findAllByRole('option')
			expect(options).toHaveLength(4)
			expect(options[0]).toHaveTextContent('Иванов Иван Иванович')
			expect(options[0]).toHaveTextContent('ООО "Ромашка" · ИНН 771234567890 · действует до 11.09.2026')
			expect(options[1]).toHaveTextContent('Петров Пётр Петрович')
			expect(options[1]).toHaveTextContent('ИНН 772345678901 · истекает через 10 дней')
			expect(options[2]).toHaveTextContent('ИНН 773456789012 · срок истёк 08.02.2026')
			expect(options[3]).toHaveTextContent('АО "Вектор" · ИНН 7701234567 · нет закрытого ключа')
			expect(options[0]).not.toHaveAttribute('aria-disabled')
			expect(options[1]).not.toHaveAttribute('aria-disabled')
			expect(options[2]).toHaveAttribute('aria-disabled', 'true')
			expect(options[3]).toHaveAttribute('aria-disabled', 'true')
		})

		it('первый действующий сертификат выбирается сам — update:thumbprint', async () => {
			const { emitted } = await renderReady()
			await waitFor(() => expect(lastEmitted(emitted(), 'update:thumbprint')).toBe(THUMBPRINTS.ivanov))
			expect(screen.getByRole('combobox')).toHaveTextContent('Иванов Иван Иванович')
		})

		it('заданный thumbprint из списка не перебивается, смена пропа меняет выбор', async () => {
			const { emitted, rerender } = await renderReady({ props: { thumbprint: THUMBPRINTS.petrov } })
			await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Петров Пётр Петрович'))
			expect(emitted()['update:thumbprint']).toBeUndefined()
			await rerender({ thumbprint: THUMBPRINTS.ivanov })
			expect(screen.getByRole('combobox')).toHaveTextContent('Иванов Иван Иванович')
			await rerender({ thumbprint: undefined })
			expect(screen.getByRole('combobox')).toHaveTextContent('Выберите сертификат')
		})

		it('выбор мышью — update:thumbprint с отпечатком', async () => {
			const { emitted } = await renderReady()
			await waitCertificates()
			await fireEvent.click(screen.getByRole('combobox'))
			await userEvent.click((await screen.findAllByRole('option'))[1] as HTMLElement)
			expect(lastEmitted(emitted(), 'update:thumbprint')).toBe(THUMBPRINTS.petrov)
		})

		it('без действующих сертификатов ничего не выбирается и «Подписать» недоступна', async () => {
			const { emitted, emulation } = await renderReady({ props: { data: 'x' } }, { now: new Date(NOW.getTime() - 400 * 86400000) })
			await waitFor(() => expect(callsOf(emulation, 'Store.Close')).not.toHaveLength(0))
			await nextTick()
			expect(screen.getByRole('combobox')).toHaveTextContent('Выберите сертификат')
			expect(emitted()['update:thumbprint']).toBeUndefined()
			expect(signButton()).toBeDisabled()
		})
	})

	describe('данные', () => {
		it('текст — строка с размером, без поля файла', async () => {
			await renderReady({ props: { data: 'Привет' } })
			expect(screen.getByText('Подписываем текст, 12 Б')).toBeInTheDocument()
			expect(screen.queryByText('Документ', { selector: 'label' })).not.toBeInTheDocument()
		})

		it('File — имя файла и размер', async () => {
			await renderReady({ props: { data: new File([new Uint8Array(1536)], 'act.pdf') } })
			expect(screen.getByText('Документ: act.pdf, 1,5 КБ')).toBeInTheDocument()
		})

		it('Blob — имя из fileName', async () => {
			await renderReady({ props: { data: new Blob(['abc']), fileName: 'contract' } })
			expect(screen.getByText('Документ: contract, 3 Б')).toBeInTheDocument()
		})

		it('без данных «Подписать» недоступна', async () => {
			await renderReady()
			await waitCertificates()
			expect(signButton()).toBeDisabled()
		})

		it('isDisabled — выбор сертификата и «Подписать» недоступны', async () => {
			const { container } = await renderReady({ props: { data: 'x', isDisabled: true } })
			await waitCertificates()
			expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true')
			expect(signButton()).toBeDisabled()
			expect(container.querySelector('.base-crypto-pro-sign')).toHaveClass('base-crypto-pro-sign--disabled')
		})
	})

	describe('подпись текста', () => {
		it('присоединённая CAdES-BES: вызовы плагина, событие signed, итог и live-регион', async () => {
			const { emitted, emulation } = await renderReady({ props: { data: 'Привет' } })
			await waitFor(() => expect(signButton()).toBeEnabled())
			const from = emulation.calls.length
			await userEvent.click(signButton())
			const result = await signedResult(emitted)
			expect(result).toMatchObject({ detached: false, isHash: false, level: 'bes', fileName: 'document' })
			expect(result.certificate.thumbprint).toBe(THUMBPRINTS.ivanov)
			expect(atob(result.signature)).toMatch(/^RISE-EMULATED-CADES-BES;detached=false;thumbprint=A1B2C3D4/)
			expect(createdObjects(emulation, from)).toEqual(['CAdESCOM.CPSigner', 'CAdESCOM.CPAttribute', 'CAdESCOM.CadesSignedData'])
			expect(callsOf(emulation, 'CPSigner.propset_Certificate')[0]?.args).toEqual([`certificate:${THUMBPRINTS.ivanov}`])
			expect(callsOf(emulation, 'CPSigner.propset_CheckCertificate')[0]?.args).toEqual([true])
			expect(callsOf(emulation, 'CPSigner.propset_TSAAddress')).toHaveLength(0)
			expect(callsOf(emulation, 'CPAttribute.propset_Name')[0]?.args).toEqual([0])
			expect(callsOf(emulation, 'CPAttribute.propset_Value')[0]?.args).toEqual(['Date'])
			expect(callsOf(emulation, 'CPSigner.AuthenticatedAttributes2.Add')[0]?.args).toEqual(['CPAttribute'])
			expect(callsOf(emulation, 'CadesSignedData.propset_ContentEncoding')[0]?.args).toEqual([1])
			expect(callsOf(emulation, 'CadesSignedData.propset_Content')[0]?.args).toEqual([textToBase64('Привет')])
			expect(callsOf(emulation, 'CadesSignedData.SignCades')[0]?.args).toEqual(['CPSigner', 1, false])
			expect(callsOf(emulation, 'Store.Close')).not.toHaveLength(0)
			const title = screen.getByText('Подпись создана: document.sig', { selector: '.base-crypto-pro-sign-result__title' })
			expect(title).toBeInTheDocument()
			expect(screen.getByRole('status')).toHaveTextContent('Подпись создана: document.sig')
		})

		it('отсоединённая — переключатель шлёт update:detached, SignCades с detached', async () => {
			const { emitted, emulation } = await renderReady({ props: { data: 'Привет', fileName: 'note' } })
			await userEvent.click(screen.getByRole('radio', { name: 'Отсоединённая' }))
			expect(lastEmitted(emitted(), 'update:detached')).toBe(true)
			await clickSign()
			expect((await signedResult(emitted)).detached).toBe(true)
			expect(callsOf(emulation, 'CadesSignedData.SignCades')[0]?.args).toEqual(['CPSigner', 1, true])
			await userEvent.click(screen.getByRole('radio', { name: 'Присоединённая' }))
			expect(lastEmitted(emitted(), 'update:detached')).toBe(false)
		})

		it('проп detached выбирает отсоединённую, его смена — переключатель', async () => {
			const { rerender } = await renderReady({ props: { data: 'x', detached: true } })
			expect(screen.getByRole('radio', { name: 'Отсоединённая' })).toBeChecked()
			await rerender({ detached: false })
			expect(screen.getByRole('radio', { name: 'Присоединённая' })).toBeChecked()
			await rerender({ detached: true })
			await rerender({ detached: undefined })
			expect(screen.getByRole('radio', { name: 'Присоединённая' })).toBeChecked()
		})

		it.each([
			['t', 5, 'T'],
			['xlt1', 0x5d, 'XLT1'],
		] as const)('уровень %s с tsaAddress — служба штампов и тип %i', async (level, type, name) => {
			const tsaAddress = 'http://tsp.example.ru/tsp/tsp.srf'
			const { emitted, emulation } = await renderReady({ props: { data: 'x', level, tsaAddress } })
			await clickSign()
			const result = await signedResult(emitted)
			expect(result.level).toBe(level)
			expect(atob(result.signature)).toMatch(new RegExp(`^RISE-EMULATED-CADES-${name};`))
			expect(callsOf(emulation, 'CPSigner.propset_TSAAddress')[0]?.args).toEqual([tsaAddress])
			expect(callsOf(emulation, 'CadesSignedData.SignCades')[0]?.args).toEqual(['CPSigner', type, false])
		})

		it('уровень t без tsaAddress — предупреждение и ошибка плагина', async () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
			const { emitted } = await renderReady({ props: { data: 'x', level: 't' } })
			await clickSign()
			const error = await failure(emitted)
			expect(warn).toHaveBeenCalledWith(expect.stringMatching(/\[rise-ui-kit\].*tsaAddress/))
			expect(error.code).toBe('unknown')
			expect(error.detail).toContain('(0x80070057)')
			expect(emitted().signed).toBeUndefined()
		})

		it('повторная подпись сбрасывает прежний результат', async () => {
			const { emitted } = await renderReady({ props: { data: 'x' } })
			await clickSign()
			await signedResult(emitted)
			await userEvent.click(signButton())
			await waitFor(() => expect(emitted().signed).toHaveLength(2))
			const titles = screen.getAllByText('Подпись создана: document.sig', { selector: '.base-crypto-pro-sign-result__title' })
			expect(titles).toHaveLength(1)
		})

		it('во время подписи — aria-busy, второй вызов sign() отдаёт null', async () => {
			const { api } = renderExposed({ data: 'x' }, { delay: 30 })
			await waitFor(() => expect(signButton()).toBeEnabled())
			const first = api().sign()
			await nextTick()
			expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true')
			expect(await api().sign()).toBeNull()
			expect(await first).toMatchObject({ level: 'bes' })
			await waitFor(() => expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'false'))
		})

		it('expose sign() без данных и verify() без подписи отдают null', async () => {
			const { api } = renderExposed()
			await waitCertificates()
			expect(await api().sign()).toBeNull()
			expect(await api().verify()).toBeNull()
		})

		it('expose sign() до готовности плагина сначала проверяет его', async () => {
			const { api, emulation } = renderExposed({ data: 'x', thumbprint: THUMBPRINTS.ivanov }, { scenario: 'noPlugin' })
			await screen.findByRole('alert')
			const from = emulation.calls.length
			expect(await api().sign()).toBeNull()
			expect(createdObjects(emulation, from)).toEqual([])
		})
	})

	describe('ошибки подписи', () => {
		it('сертификат без ключа — «Подписать» недоступна, sign() — noPrivateKey до плагина', async () => {
			const onError = vi.fn()
			const { api, emulation } = renderExposed({ data: 'x', thumbprint: THUMBPRINTS.smirnov, onError })
			await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent(/Смирнов/))
			expect(signButton()).toBeDisabled()
			const from = emulation.calls.length
			expect(await api().sign()).toBeNull()
			expect((onError.mock.calls[0]?.[0] as CryptoProFailure).code).toBe('noPrivateKey')
			expect(createdObjects(emulation, from)).toEqual([])
			const alert = screen.getByRole('alert')
			expect(alert).toHaveTextContent('У сертификата нет закрытого ключа')
			expect(alert).toHaveTextContent(THUMBPRINTS.smirnov)
			expect(screen.getByRole('status')).toHaveTextContent('У сертификата нет закрытого ключа')
		})

		it('просроченный сертификат — «Подписать» недоступна, sign() — certificateInvalid', async () => {
			const onError = vi.fn()
			const { api } = renderExposed({ data: 'x', thumbprint: THUMBPRINTS.sidorova, onError })
			await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent(/Сидорова/))
			expect(signButton()).toBeDisabled()
			expect(await api().sign()).toBeNull()
			expect((onError.mock.calls[0]?.[0] as CryptoProFailure).code).toBe('certificateInvalid')
		})

		it('отмена в окне ПИН-кода — cancelled', async () => {
			const { emitted } = await renderReady({ props: { data: 'x' } }, { scenario: 'cancel' })
			await clickSign()
			expect((await failure(emitted)).code).toBe('cancelled')
			expect(screen.getByRole('alert')).toHaveTextContent('Подпись отменена')
			expect(screen.queryByRole('button', { name: 'Скачать подпись' })).not.toBeInTheDocument()
		})

		it('плагин пропал до подписи — noPlugin', async () => {
			const { emitted } = await renderReady({ props: { data: 'x' } })
			await waitFor(() => expect(signButton()).toBeEnabled())
			restoreEmulation()
			await userEvent.click(signButton())
			expect((await failure(emitted)).code).toBe('noPlugin')
		})
	})

	describe('скачивание', () => {
		it('«Скачать подпись» — файл .sig в DER, ссылка освобождается через 1 с', async () => {
			const createObjectURL = vi.fn((_blob: Blob) => 'blob:http://localhost/sig')
			const revokeObjectURL = vi.fn()
			vi.stubGlobal('URL', Object.assign(URL, { createObjectURL, revokeObjectURL }))
			const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
			const { emitted } = await renderReady({ props: { data: 'x', fileName: 'act' } })
			await clickSign()
			const result = await signedResult(emitted)
			vi.useFakeTimers()
			await fireEvent.click(screen.getByRole('button', { name: 'Скачать подпись' }))
			const blob = createObjectURL.mock.calls[0]?.[0] as Blob
			expect(blob.type).toBe('application/pkcs7-signature')
			const bytes = Uint8Array.from(atob(result.signature), char => char.charCodeAt(0))
			expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes)
			expect((click.mock.contexts[0] as HTMLAnchorElement).download).toBe('act.sig')
			expect(revokeObjectURL).not.toHaveBeenCalled()
			vi.advanceTimersByTime(1000)
			expect(revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/sig')
		})

		it('hasDownload=false — без кнопки скачивания', async () => {
			const { emitted } = await renderReady({ props: { data: 'x', hasDownload: false } })
			await clickSign()
			await signedResult(emitted)
			expect(screen.queryByRole('button', { name: 'Скачать подпись' })).not.toBeInTheDocument()
		})
	})

	describe('клавиатура', () => {
		it('Tab до сертификата, выбор стрелками, Tab до «Подписать», Enter — signed', async () => {
			const user = userEvent.setup()
			const { emitted } = await renderReady({ props: { data: 'x' } })
			await waitFor(() => expect(signButton()).toBeEnabled())
			await user.tab()
			expect(screen.getByRole('combobox')).toHaveFocus()
			await user.keyboard('{Enter}')
			await screen.findByRole('listbox')
			await user.keyboard('{ArrowDown}{Enter}')
			await waitFor(() => expect(lastEmitted(emitted(), 'update:thumbprint')).toBe(THUMBPRINTS.petrov))
			while (document.activeElement !== signButton()) await user.tab()
			await user.keyboard('{Enter}')
			expect((await signedResult(emitted)).certificate.thumbprint).toBe(THUMBPRINTS.petrov)
		})
	})

	describe('настройки плагина', () => {
		it('defaults.BaseCryptoProSign — hashThreshold и fileName', async () => {
			installEmulation()
			const plugin = createUiKitPlugin({ defaults: { BaseCryptoProSign: { hashThreshold: 4, fileName: 'from-plugin' } } })
			render(BaseCryptoProSign, { props: { data: new Blob(['0123456789']) }, global: { plugins: [plugin] } })
			expect(await screen.findByText('Документ: from-plugin, 10 Б')).toBeInTheDocument()
			expect(screen.getByText(/Документ больше 4 Б: подписывается его хэш/)).toBeInTheDocument()
		})
	})
})
