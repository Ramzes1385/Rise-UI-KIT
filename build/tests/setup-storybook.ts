import { afterEach } from 'vitest'

/**
 * Очистка DOM от висящих порталов после каждого теста.
 * Компоненты с Teleport (BaseModal, BaseTooltip, BaseDropdown и др.)
 * при isolate: false оставляют узлы в document.body.
 */
afterEach(() => {
	document.body.querySelectorAll('[data-teleport], .v-popper__popper, [role="dialog"]').forEach(el => el.remove())
})
