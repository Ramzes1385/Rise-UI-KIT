import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import { CRYPTO_PRO_SIGN_PARTS } from '../types/BaseCryptoProSign.types'
import { freezeDate, installEmulation, renderReady, restoreEmulation, signButton, waitCertificates } from './cryptoProSignTestUtils'

const UI = Object.fromEntries([['root', 'u-root'], ...CRYPTO_PRO_SIGN_PARTS.map(part => [part, `u-${part}`])])

const partOf = (container: Element, part: string) => container.querySelector(`.base-crypto-pro-sign__${part}`)

beforeEach(() => freezeDate())

afterEach(() => {
	restoreEmulation()
	vi.useRealTimers()
	vi.restoreAllMocks()
})

describe('BaseCryptoProSign: проп ui', () => {
	it('классы частей формы подписи добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		const { container } = await renderReady({
			props: {
				data: new Blob(['Акт сверки']),
				fileName: 'act',
				hashThreshold: 1,
				variant: 'soft',
				customClass: { root: 'own-root' },
				ui: UI,
			},
		})
		await waitCertificates()
		const root = container.querySelector('.base-crypto-pro-sign')!

		expect(root).toHaveClass('u-root', 'base-crypto-pro-sign--soft', 'own-root')
		for (const part of ['status', 'certificate', 'source', 'hint', 'actions', 'error', 'live']) {
			expect(partOf(root, part)).toHaveClass(`u-${part}`)
		}
		expect(root.querySelector('.base-crypto-pro-sign-status')).toHaveClass('base-crypto-pro-sign__status')
	})

	it('итог подписи и «нет сертификатов» — тоже с классами ui', async () => {
		const signed = await renderReady({ props: { data: 'x', ui: UI }, global: { stubs: { transition: false } } })
		await waitFor(() => expect(signButton()).toBeEnabled())
		await userEvent.click(signButton())
		await waitFor(() => expect(partOf(signed.container, 'result')).toHaveClass('u-result', 'base-crypto-pro-sign-result'))
		signed.unmount()
		restoreEmulation()

		const empty = await renderReady({ props: { ui: UI } }, { scenario: 'noCertificates' })
		await waitFor(() => expect(partOf(empty.container, 'empty')).toHaveClass('u-empty'))
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = await renderReady({
			props: { ui: { actions: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCryptoProSign: { ui: { actions: 'app', root: 'app-root' } } } })] },
		})
		const root = container.querySelector('.base-crypto-pro-sign')!

		expect(root).toHaveClass('base-crypto-pro-sign', 'app-root')
		expect(partOf(root, 'live')).toHaveAttribute('class', 'base-crypto-pro-sign__live')
		expect(partOf(root, 'actions')).toHaveAttribute('class', 'base-crypto-pro-sign__actions app own')
	})
})

describe('BaseCryptoProSign: движение', () => {
	it('блок ошибки действия раскрывается модификатором --open, alert внутри', async () => {
		const { container } = await renderReady({ props: { data: 'x' } }, { scenario: 'cancel' })
		const block = partOf(container, 'error')!

		expect(block).not.toHaveClass('base-crypto-pro-sign__error--open')
		await waitFor(() => expect(signButton()).toBeEnabled())
		await userEvent.click(signButton())
		await waitFor(() => expect(block).toHaveClass('base-crypto-pro-sign__error--open'))
		expect(block.querySelector('[role="alert"]')).toHaveTextContent('Подпись отменена')
	})

	it('ошибка диагностики раскрывается в блоке статуса, после готовности блока нет', async () => {
		installEmulation({ scenario: 'noPlugin' })
		const { container } = render(BaseCryptoProSign)
		await screen.findByRole('alert')

		expect(container.querySelector('.base-crypto-pro-sign-status__error')).toHaveClass('base-crypto-pro-sign-status__error--open')
		restoreEmulation()
		installEmulation()
		await userEvent.click(screen.getByRole('button', { name: 'Проверить снова' }))
		await screen.findByText(/КриптоПро CSP 5\.0\.12000/)
		expect(container.querySelector('.base-crypto-pro-sign-status__error')).not.toBeInTheDocument()
	})

	it('пресет none: шаги сменяются версиями переходом out-in, конечное состояние сразу; live-регион озвучивает итог', async () => {
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		installEmulation()
		const { container } = render(BaseCryptoProSign, { props: { data: 'x' }, container: host, global: { stubs: { transition: false } } })

		await screen.findByText(/КриптоПро CSP 5\.0\.12000/)
		await waitFor(() => expect(screen.queryByRole('list', { name: 'Проверяем КриптоПро' })).not.toBeInTheDocument())
		await waitFor(() => expect(signButton()).toBeEnabled())
		await userEvent.click(signButton())
		await waitFor(() => expect(container.querySelector('.base-crypto-pro-sign-result')).toBeInTheDocument())
		await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Подпись создана/))
		host.remove()
	})
})
