/** Утилиты: плагин Nuxt — применяет настройки модуля (`createUiKitConfig`) на сервере и клиенте */

import { createUiKitConfig } from '../../plugin/config'
import type { RiseUiNuxtApp } from '../types/integrations.types'

export default function riseUiKitPlugin(nuxtApp: RiseUiNuxtApp): void {
	nuxtApp.vueApp.use(createUiKitConfig(nuxtApp.$config.public.riseUiKit))
}
