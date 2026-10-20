import { afterAll } from 'vitest'
import { loadDetails, loadResult, loadScenarioUi, loadSearch } from '../../ui/lazy/flowLazyLoaders'

afterAll(async () => {
	await Promise.all([loadDetails(), loadSearch(), loadResult(), loadScenarioUi()]).catch(() => undefined)
})
