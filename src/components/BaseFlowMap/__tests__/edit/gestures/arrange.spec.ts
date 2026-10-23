import '@testing-library/jest-dom/vitest'
import { fireEvent, within } from '@testing-library/vue'
import { guardConsole } from '../../helpers/consoleGuard.test-utils'
import { editData, flush, liveText, mountEdit, screen, settle, waitFor } from '../editHarness'

async function openArrange() {
	const trigger = screen.getByRole('button', { name: 'Раскладка' })
	trigger.focus()
	await fireEvent.keyDown(trigger, { key: 'Enter' })
	return screen.findByRole('menu')
}

guardConsole()

describe('раскладка из режима «Правка»', () => {
	it('«Раскладка»: направление, дорожки, «Применить к выделенным»; озвучка «Схема разложена»', async () => {
		const map = await mountEdit({ data: editData() })
		let menu = await openArrange()
		const applySelected = within(menu).getByRole('menuitem', { name: 'Применить к выделенным' })
		expect(applySelected).toHaveAttribute('aria-disabled', 'true')
		expect(within(menu).getByRole('menuitemradio', { name: 'Слева направо' })).toHaveAttribute('aria-checked', 'false')
		await fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Слева направо' }))
		await waitFor(() => expect(map.data().layout?.direction).toBe('LR'))
		expect(await liveText(map)).toBe('Схема разложена')
		menu = await openArrange()
		await fireEvent.click(within(menu).getByRole('menuitemcheckbox', { name: 'По дорожкам' }))
		await waitFor(() => expect(map.data().layout?.byLanes).toBe(true))
		menu = await openArrange()
		await fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Сверху вниз' }))
		await waitFor(() => expect(map.data().layout?.direction).toBe('TB'))
		map.controller.select(['gw'])
		await settle()
		menu = await openArrange()
		expect(within(menu).getByRole('menuitem', { name: 'Применить к выделенным' })).not.toHaveAttribute('aria-disabled', 'true')
		await fireEvent.click(within(menu).getByRole('menuitem', { name: 'Применить к выделенным' }))
		await flush()
	})
})
