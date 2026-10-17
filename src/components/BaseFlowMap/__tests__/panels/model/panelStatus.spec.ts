import { UI_FLOW_PANELS } from '@/locales/messages'
import { panelsData } from '../../fixtures/panelsContext'
import { BUILT_IN_STATUS_IDS, resolveStatus } from '../../../model/panels/panelStatus'

describe('панели: статусы', () => {
	const data = panelsData()

	it('перечисляет встроенные статусы по порядку', () => {
		expect(BUILT_IN_STATUS_IDS).toEqual(['ok', 'warning', 'error', 'down', 'unknown'])
	})

	it.each([
		{ id: 'ok', label: UI_FLOW_PANELS.STATUS_OK, icon: 'check-circle', badge: 'success' },
		{ id: 'warning', label: UI_FLOW_PANELS.STATUS_WARNING, icon: 'alert-triangle', badge: 'warning' },
		{ id: 'error', label: UI_FLOW_PANELS.STATUS_ERROR, icon: 'x-circle', badge: 'error' },
		{ id: 'down', label: UI_FLOW_PANELS.STATUS_DOWN, icon: 'minus', badge: 'error' },
		{ id: 'unknown', label: UI_FLOW_PANELS.STATUS_UNKNOWN, icon: 'info', badge: 'neutral' },
	])('«$id» показывается подписью, значком и палитрой — не только цветом', ({ id, label, icon, badge }) => {
		expect(resolveStatus(id, data)).toMatchObject({ id, label, icon, badge })
		expect(resolveStatus(id, data).color).toMatch(/^var\(--rise-/)
	})

	it('свой статус из данных карты берёт подпись, значок и цвет оттуда', () => {
		expect(resolveStatus('degraded', data)).toEqual({
			id: 'degraded',
			label: 'Деградация',
			icon: 'alert-triangle',
			color: '#c60',
			badge: 'neutral',
		})
	})

	it('свой статус главнее встроенного с тем же id', () => {
		const custom = { ...data, statuses: [{ id: 'ok', label: 'Всё хорошо', icon: 'star', color: '#0a0' }] }
		expect(resolveStatus('ok', custom).label).toBe('Всё хорошо')
	})

	it('неизвестный статус показывается как «нет данных», но сохраняет свой id', () => {
		expect(resolveStatus('maintenance', { ...data, statuses: undefined })).toMatchObject({
			id: 'maintenance',
			label: UI_FLOW_PANELS.STATUS_UNKNOWN,
			badge: 'neutral',
		})
	})
})
