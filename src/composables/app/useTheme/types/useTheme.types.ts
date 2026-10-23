import type { ComputedRef, Ref } from 'vue'
import type { Theme, ThemePresetName } from '@utils/theme/themeUtils'

/** Настройки `applyTheme` */
export interface ApplyThemeOptions {
	/** Элемент области темы; по умолчанию `<html>` */
	target?: HTMLElement
	/** CSP nonce для вставленного `<style>` */
	nonce?: string
}

/** Настройки управления темами: `useTheme(options)` и опции плагина `theme`, `themes`, `themeNonce` */
export interface ThemeControllerOptions {
	/** Свои темы из `createTheme()`: становятся доступны `setTheme` по имени */
	themes?: Theme[]
	/** CSP nonce для `<style>` тем */
	nonce?: string
	/** Элемент, на который ставится тема; по умолчанию `<html>` */
	target?: () => HTMLElement | null | undefined
}

/** Управление темой приложения */
export interface ThemeController {
	/** Имя текущей темы; `null` — тема не выбрана (вид кита) */
	theme: Readonly<Ref<string | null>>
	/** Имена тем, доступных `setTheme`: пресеты и зарегистрированные */
	themes: ComputedRef<string[]>
	/** CSS текущей темы — для `<style>` при SSR; пусто, пока тема не выбрана */
	css: ComputedRef<string>
	/** Выбрать тему по имени (пресет или зарегистрированная) или готовую тему; `false` — имя неизвестно */
	setTheme: (theme: Theme | ThemePresetName | (string & {})) => boolean
	/** Добавить темы (не выбирая их) и сменить CSP nonce для следующих `<style>` */
	configure: (options: Pick<ThemeControllerOptions, 'themes' | 'nonce'>) => void
}
