/** Утилиты: плагин Nuxt — подключает словарь языка из настроек модуля и применяет их (`createUiKitConfig`) на сервере и клиенте */

import { createUiKitConfig } from '../../plugin/config'
import { registerLocaleOnce } from '../../locales/state'
import type { RiseUiNuxtApp } from '../types/integrations.types'
import type { UiKitLocale } from '../../locales/types/locales.types'

/**
 * Готовые словари, кроме встроенного `ru`: язык приходит строкой из `runtimeConfig`, и плагин подключает словарь сам
 * (`registerLocale`), каждый — своим чанком, только выбранный. Свой словарь приложения с тем же кодом не заменяется.
 */
const KIT_LOCALES: Record<string, () => Promise<UiKitLocale>> = {
	en: () => import('../../locales/en').then(module => module.en),
	kk: () => import('../../locales/kk').then(module => module.kk),
	uz: () => import('../../locales/uz').then(module => module.uz),
	zh: () => import('../../locales/zh').then(module => module.zh),
	ja: () => import('../../locales/ja').then(module => module.ja),
}

export default async function riseUiKitPlugin(nuxtApp: RiseUiNuxtApp): Promise<void> {
	const config = nuxtApp.$config.public.riseUiKit
	const code = config?.locale
	if (code && Object.hasOwn(KIT_LOCALES, code)) registerLocaleOnce(await KIT_LOCALES[code]())
	nuxtApp.vueApp.use(createUiKitConfig(config))
}
