import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import type { CadesSignPlugin } from '../../types/cadesSign.types'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import type { CryptoProBatchResult, CryptoProSignResult } from '../../types/BaseCryptoProSign.types'
import { NOW, callsOf, freezeDate, lastEmitted, renderExposed, renderReady, restoreEmulation } from '../cryptoProSignTestUtils'

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

const PROPS = { isMultiple: true }

function file(name: string, size = 16): File {
	return new File([new Uint8Array(size).fill(65)], name)
}

async function upload(files: File[]): Promise<void> {
	const input = screen.getByLabelText('Документ', { selector: 'input' }) as HTMLInputElement
	Object.defineProperty(input, 'files', { value: files, configurable: true })
	await fireEvent.change(input)
}

function signButton(): HTMLElement {
	return screen.getByRole('button', { name: 'Подписать' })
}

async function start(): Promise<void> {
	await waitFor(() => expect(signButton()).toBeEnabled())
	await userEvent.click(signButton())
}

function items(): HTMLElement[] {
	return within(screen.getByRole('list', { name: 'Файлы для подписи' })).getAllByRole('listitem')
}

function plugin(): CadesSignPlugin {
	return (window as unknown as { cadesplugin: CadesSignPlugin }).cadesplugin
}

function wrapCreate(wrap: (name: string, created: unknown, index: number) => Promise<unknown> | unknown): void {
	const target = plugin()
	const create = target.CreateObjectAsync.bind(target)
	let index = 0
	target.CreateObjectAsync = (async (name: string) => {
		const created = await create(name as 'CAdESCOM.About')
		return wrap(name, created, ++index)
	}) as CadesSignPlugin['CreateObjectAsync']
}

describe('BaseCryptoProSign — несколько файлов (isMultiple)', () => {
	it('файлы подписываются по очереди: событие на каждый файл, итог, скачивание', async () => {
		const { emitted, emulation } = await renderReady({ props: PROPS })
		expect(screen.getByLabelText('Документ', { selector: 'input' })).toHaveAttribute('multiple')
		expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument()
		expect(signButton()).toBeDisabled()
		await upload([file('a.txt'), file('b.txt'), file('c.txt')])
		await start()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		const results = (emitted().signed as unknown[][]).map(args => (args[0] as CryptoProSignResult).fileName)
		expect(results).toEqual(['a.txt', 'b.txt', 'c.txt'])
		const total = lastEmitted<CryptoProBatchResult>(emitted(), 'signed-all')
		expect(total).toMatchObject({ signedCount: 3, failedCount: 0, cancelledCount: 0 })
		expect(total.items.map(item => item.status)).toEqual(['signed', 'signed', 'signed'])
		expect(callsOf(emulation, 'CadesSignedData.SignCades')).toHaveLength(3)
		expect(items()).toHaveLength(3)
		expect(items()[0]).toHaveTextContent('a.txt')
		expect(items()[0]).toHaveTextContent('подписан')
		expect(document.querySelector('.base-crypto-pro-sign__live')).toHaveTextContent('Подписано файлов: 3 из 3. Ошибок: 0, отменено: 0')
		expect(screen.queryByRole('button', { name: 'Отменить' })).not.toBeInTheDocument()
		expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()

		const url = vi.fn(() => 'blob:x')
		vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: url, revokeObjectURL: vi.fn() }))
		await userEvent.click(screen.getByRole('button', { name: 'Скачать b.txt.sig' }))
		expect(url).toHaveBeenCalledTimes(1)
		await userEvent.click(screen.getByRole('button', { name: 'Скачать все подписи' }))
		expect(url).toHaveBeenCalledTimes(4)
	})

	it('ошибка одного файла не останавливает очередь: статус и текст ошибки у файла, событие error', async () => {
		const { emitted } = await renderReady({ props: PROPS })
		await upload([file('a.txt'), file('b.txt'), file('c.txt')])
		let signedData = 0
		wrapCreate((name, created) => {
			if (name !== 'CAdESCOM.CadesSignedData' || ++signedData !== 2) return created
			throw new Error('Сбой плагина')
		})
		await start()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		const total = lastEmitted<CryptoProBatchResult>(emitted(), 'signed-all')
		expect(total).toMatchObject({ signedCount: 2, failedCount: 1, cancelledCount: 0 })
		expect(total.items.map(item => item.status)).toEqual(['signed', 'failed', 'signed'])
		expect(emitted().error).toHaveLength(1)
		expect(items()[1]).toHaveTextContent('не подписан')
		expect(items()[1]).toHaveTextContent('Сбой плагина')
		expect(screen.queryByRole('button', { name: 'Скачать b.txt.sig' })).not.toBeInTheDocument()
		expect(document.querySelector('.base-crypto-pro-sign__live')).toHaveTextContent('Подписано файлов: 2 из 3. Ошибок: 1, отменено: 0')
	})

	it('отмена: текущий файл дописывается, остальные отменены', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'Date'], now: NOW, shouldAdvanceTime: true })
		const { emitted } = await renderReady({ props: PROPS }, { delay: 60_000 })
		await upload([file('a.txt'), file('b.txt'), file('c.txt')])
		await start()
		const cancel = await screen.findByRole('button', { name: 'Отменить' })
		expect(screen.getByRole('progressbar', { name: 'Подписываем файлы' })).toBeInTheDocument()
		cancel.focus()
		await userEvent.click(cancel)
		expect(cancel).toHaveAttribute('aria-disabled', 'true')
		expect(cancel).toHaveFocus()
		await vi.advanceTimersByTimeAsync(200_000)
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		const total = lastEmitted<CryptoProBatchResult>(emitted(), 'signed-all')
		expect(total.items.map(item => item.status)).toEqual(['signed', 'cancelled', 'cancelled'])
		expect(total).toMatchObject({ signedCount: 1, cancelledCount: 2 })
		expect(items()[2]).toHaveTextContent('отменён')
		expect(screen.queryByRole('button', { name: 'Отменить' })).not.toBeInTheDocument()
		await waitFor(() => expect(signButton()).toHaveFocus())
	})

	it('очередь закончилась, фокус на «Отменить» (успех): он переходит на «Подписать»', async () => {
		const { emitted } = await renderReady({ props: PROPS }, { delay: 100 })
		await upload([file('a.txt'), file('b.txt')])
		await start()
		const cancel = await screen.findByRole('button', { name: 'Отменить' })
		cancel.focus()

		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())

		expect(screen.queryByRole('button', { name: 'Отменить' })).not.toBeInTheDocument()
		await waitFor(() => expect(signButton()).toHaveFocus())
	})

	it('очередь закончилась, фокус не на «Отменить»: фокус не трогаем', async () => {
		const { emitted } = await renderReady({ props: PROPS }, { delay: 100 })
		await upload([file('a.txt')])
		await start()
		await screen.findByRole('button', { name: 'Отменить' })
		const other = document.createElement('button')
		document.body.append(other)
		other.focus()

		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())

		expect(other).toHaveFocus()
		other.remove()
	})

	it('размонтирование прекращает очередь: после текущего файла остальные не подписываются', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'Date'], now: NOW, shouldAdvanceTime: true })
		const { emulation, unmount } = await renderReady({ props: PROPS }, { delay: 300 })
		await upload([file('a.txt'), file('b.txt'), file('c.txt')])
		await start()
		await screen.findByRole('button', { name: 'Отменить' })

		unmount()
		await vi.advanceTimersByTimeAsync(1500)

		expect(callsOf(emulation, 'CadesSignedData.SignCades')).toHaveLength(1)
	})

	it('отмена во время расчёта хэша прерывает файл', async () => {
		const { emitted } = await renderReady({ props: { ...PROPS, hashThreshold: 1024 } })
		await upload([file('big.bin', 4096), file('next.bin', 4096)])
		expect(screen.getByText(/Файлы больше 1(,0)? КБ подписываются по хэшу/)).toBeInTheDocument()
		let release = (): void => undefined
		const gate = new Promise<void>(resolve => (release = resolve))
		wrapCreate((name, created) => {
			if (name !== 'CAdESCOM.HashedData') return created
			const hashed = created as { Hash(value: string): Promise<void> }
			const hash = hashed.Hash.bind(hashed)
			hashed.Hash = async value => {
				await gate
				return hash(value)
			}
			return hashed
		})
		await start()
		await userEvent.click(await screen.findByRole('button', { name: 'Отменить' }))
		release()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		const total = lastEmitted<CryptoProBatchResult>(emitted(), 'signed-all')
		expect(total.items.map(item => item.status)).toEqual(['cancelled', 'cancelled'])
		expect(emitted().signed).toBeUndefined()
		expect(emitted().error).toBeUndefined()
	})

	it('файл больше hashThreshold подписывается по хэшу, остальные — целиком; ход хэша виден', async () => {
		const { emitted, emulation } = await renderReady({ props: { ...PROPS, hashThreshold: 1024 } })
		await upload([file('big.bin', 4096), file('small.txt')])
		let release = (): void => undefined
		const gate = new Promise<void>(resolve => (release = resolve))
		wrapCreate((name, created) => {
			if (name !== 'CAdESCOM.HashedData') return created
			const hashed = created as { Hash(value: string): Promise<void> }
			const hash = hashed.Hash.bind(hashed)
			hashed.Hash = async value => {
				await hash(value)
				await gate
			}
			return hashed
		})
		await start()
		expect(await screen.findByRole('progressbar', { name: 'Считаем хэш документа' })).toHaveAttribute('aria-valuenow', '0')
		release()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		const results = (emitted().signed as unknown[][]).map(args => args[0] as CryptoProSignResult)
		expect(results[0]).toMatchObject({ fileName: 'big.bin', isHash: true, detached: true })
		expect(results[1]).toMatchObject({ fileName: 'small.txt', isHash: false, detached: false })
		expect(callsOf(emulation, 'CadesSignedData.SignHash')).toHaveLength(1)
		expect(callsOf(emulation, 'CadesSignedData.SignCades')).toHaveLength(1)
	})

	it('убрать файл из выбора; новый выбор сбрасывает прежний итог', async () => {
		const { emitted } = await renderReady({ props: PROPS })
		await upload([file('a.txt'), file('b.txt')])
		await userEvent.click(await screen.findByRole('button', { name: /b\.txt$/ }))
		await start()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		expect(items()).toHaveLength(1)
		await upload([file('c.txt')])
		await waitFor(() => expect(screen.queryByRole('list', { name: 'Файлы для подписи' })).not.toBeInTheDocument())
		expect(signButton()).toBeEnabled()
	})

	it('hasDownload=false — без кнопок скачивания; ui.batch', async () => {
		const { emitted } = await renderReady({ props: { ...PROPS, hasDownload: false, ui: { batch: 'my-batch' } } })
		await upload([file('a.txt')])
		await start()
		await waitFor(() => expect(emitted()['signed-all']).toBeTruthy())
		expect(screen.queryByRole('button', { name: /Скачать/ })).not.toBeInTheDocument()
		expect(screen.getByRole('list', { name: 'Файлы для подписи' })).toHaveClass('my-batch')
	})

	it('с data очередь не используется: одиночная подпись', async () => {
		const { emitted } = await renderReady({ props: { ...PROPS, data: 'текст' } })
		expect(screen.queryByLabelText('Документ', { selector: 'input' })).not.toBeInTheDocument()
		await start()
		await waitFor(() => expect(emitted().signed).toBeTruthy())
		expect(emitted()['signed-all']).toBeUndefined()
	})

	it('signAll и cancel через ref: без файлов — null, cancel вне очереди ничего не делает', async () => {
		const { api, emulation } = renderExposed(PROPS)
		await waitFor(() => expect(callsOf(emulation, 'cadesplugin.CreateObjectAsync').length).toBeGreaterThan(0))
		await screen.findByText(/КриптоПро ЭЦП Browser plug-in/)
		api().cancel()
		expect(await api().signAll()).toBeNull()
	})
})
