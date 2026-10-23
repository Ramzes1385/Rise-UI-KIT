import { effectScope, ref } from 'vue'
import type { CryptoProCertificate } from '@composables/crypto/useCryptoPro'
import { useCryptoProSignBatch } from '../../model/signing/useCryptoProSignBatch'
import type {
	CryptoProSignActionContext,
	CryptoProSignActionState,
	BaseCryptoProSignEmits,
	BaseCryptoProSignProps,
} from '../../types/BaseCryptoProSign.types'

const signWith = vi.hoisted(() => vi.fn())

vi.mock('../../model/signing/cryptoProSignJob', async importOriginal => ({
	...(await importOriginal<typeof import('../../model/signing/cryptoProSignJob')>()),
	signWith,
}))

function createState(): CryptoProSignActionState {
	return {
		isBusy: ref(false),
		progress: ref(null),
		actionError: ref(null),
		announcement: ref(''),
		start: vi.fn(),
		finish: vi.fn(),
		fail: vi.fn(),
		onProgress: vi.fn(),
	}
}

function setup(check: () => Promise<boolean>, isReady = false) {
	const scope = effectScope()
	const state = createState()
	const emit = vi.fn() as unknown as BaseCryptoProSignEmits
	const context = {
		isReady: ref(isReady),
		check,
		certificate: ref({ thumbprint: 'A1' } as CryptoProCertificate),
		isDetached: ref(false),
	} as unknown as CryptoProSignActionContext
	const files = ref([new File(['a'], 'a.txt'), new File(['b'], 'b.txt')])
	const model = scope.run(() => useCryptoProSignBatch({} as BaseCryptoProSignProps, emit, { context, batch: { files }, state }))!
	return { scope, model, emit, state }
}

afterEach(() => {
	signWith.mockReset()
	document.body.innerHTML = ''
	vi.restoreAllMocks()
})

describe('useCryptoProSignBatch — снятие компонента', () => {
	it('размонтирование во время check(): после проверки подпись не начинается', async () => {
		let finishCheck = (_value: boolean): void => undefined
		const check = vi.fn(() => new Promise<boolean>(resolve => (finishCheck = resolve)))
		const { scope, model, emit } = setup(check)

		const pending = model.signAll()
		expect(check).toHaveBeenCalledTimes(1)
		scope.stop()
		finishCheck(true)

		await expect(pending).resolves.toBeNull()
		expect(signWith).not.toHaveBeenCalled()
		expect(model.batchItems.value).toEqual([])
		expect(emit).not.toHaveBeenCalled()
	})

	it('размонтирование во время подписи: остальные файлы отменяются', async () => {
		let finishSign = (_value: unknown): void => undefined
		signWith.mockImplementationOnce(() => new Promise(resolve => (finishSign = resolve)))
		const { scope, model } = setup(async () => true, true)

		const pending = model.signAll()
		await vi.waitFor(() => expect(signWith).toHaveBeenCalledTimes(1))
		scope.stop()
		finishSign({ fileName: 'a.txt' })
		await pending

		expect(signWith).toHaveBeenCalledTimes(1)
		expect(model.batchItems.value.map(item => item.status)).toEqual(['signed', 'cancelled'])
	})

	it('наблюдатель переноса фокуса снимается при размонтировании', async () => {
		document.body.innerHTML = '<div class="base-crypto-pro-sign"><button class="base-crypto-pro-sign__cancel">x</button></div>'
		document.querySelector<HTMLButtonElement>('.base-crypto-pro-sign__cancel')!.focus()
		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
		signWith.mockResolvedValue({ fileName: 'a.txt' })
		const { scope, model } = setup(async () => true, true)

		await model.signAll()
		expect(disconnect).not.toHaveBeenCalled()
		scope.stop()

		expect(disconnect).toHaveBeenCalledTimes(1)
	})
})
