/** Типы экспорта токенов в формате W3C Design Tokens (https://www.w3.org/community/design-tokens/) */

/** Тип токена по спецификации */
export type TokenType = 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'cubicBezier' | 'number' | 'shadow' | 'gradient'

/** Тень: поля как в спецификации, длины строками с единицей */
export interface ShadowValue {
	color: string
	offsetX: string
	offsetY: string
	blur: string
	spread: string
}

/** Остановка градиента: цвет и позиция от 0 до 1 */
export interface GradientStop {
	color: string
	position: number
}

/** Значение токена: примитив, список или ссылка `{path.to.token}` */
export type TokenValue = string | number | readonly string[] | readonly number[] | readonly ShadowValue[] | readonly GradientStop[]

/** Токен: `$value` и `$type` обязательны; `$extensions['rise-ui-kit'].cssVariable` — имя переменной CSS */
export interface DesignToken {
	$value: TokenValue
	$type: TokenType
	$extensions: { 'rise-ui-kit': { cssVariable: string; css?: string } }
}

/** Группа токенов: вложенные группы и токены по имени; ключи с `$` — служебные поля спецификации */
export interface TokenGroup {
	[name: string]: DesignToken | TokenGroup | string | Record<string, unknown>
}

/** Набор токенов одной темы и режима: корень — группа с описанием */
export type TokenDocument = TokenGroup

/** Режим темы */
export type TokenMode = 'light' | 'dark'

/** Тема на входе экспорта: то, что вернул `createTheme` (литералы сидов) */
export interface TokenThemeSource {
	name: string
	vars: Readonly<Record<string, string>>
	darkVars: Readonly<Record<string, string>>
}

/** Файл экспорта: путь относительно `dist` и содержимое */
export interface TokenFile {
	path: string
	document: TokenDocument
}

/** Объявления свойств `--rise-*` из скомпилированного `_tokens.scss`, разложенные по блокам */
export interface TokenDeclarations {
	base: ReadonlyMap<string, string>
	light: ReadonlyMap<string, string>
	dark: ReadonlyMap<string, string>
	derived: ReadonlyMap<string, string>
}

/** Цвет в sRGB: каналы 0…255, прозрачность 0…1 */
export interface Rgba {
	r: number
	g: number
	b: number
	a: number
}
