import { computed, ref, watchEffect } from 'vue'
import { applyTheme } from '@composables/app/useTheme'
import type { ThemeContrastRow, ThemeInput, ThemePresetName } from '@utils/theme/themeUtils'
import {
	createTheme,
	THEME_DENSITIES,
	THEME_MOTIONS,
	THEME_PRESET_NAMES,
	THEME_PRESETS,
	THEME_RADII,
	THEME_SHADOWS,
} from '@utils/theme/themeUtils'

interface Option {
	value: string
	label: string
}

interface ContrastLine {
	key: string
	pair: string
	min: number
	informational: boolean
	light: ThemeContrastRow
	dark: ThemeContrastRow
}

const options = (values: readonly string[]): Option[] => values.map(value => ({ value, label: value }))

const presetOptions = options(THEME_PRESET_NAMES)
const radiusOptions = options(THEME_RADII)
const densityOptions = options(THEME_DENSITIES)
const shadowOptions = options(THEME_SHADOWS)
const motionOptions = options(THEME_MOTIONS)
const neutralOptions: Option[] = [
	{ value: 'tinted', label: 'С оттенком бренда' },
	{ value: 'gray', label: 'Серый' },
	{ value: '#64748b', label: 'Slate — сине-серый' },
	{ value: '#78716c', label: 'Stone — тёплый серый' },
]
const fontOptions: Option[] = [
	{ value: '', label: 'Как в ките — Rise Grotesk' },
	{ value: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif', label: 'Системный' },
	{ value: 'Georgia, "Times New Roman", serif', label: 'С засечками' },
	{ value: "'Rise Mono', monospace", label: 'Моноширинный — Rise Mono' },
]
const roleOptions: Option[] = [
	{ value: 'editor', label: 'Редактор' },
	{ value: 'viewer', label: 'Читатель' },
]
const tabs = [
	{ id: 'general', label: 'Общее' },
	{ id: 'access', label: 'Доступ' },
	{ id: 'billing', label: 'Оплата' },
]
const columns = [
	{ key: 'name', label: 'Проект' },
	{ key: 'owner', label: 'Владелец' },
	{ key: 'status', label: 'Статус' },
]
const rows = [
	{ id: 1, data: { name: 'Сайт студии', owner: 'Анна', status: 'В работе' } },
	{ id: 2, data: { name: 'Мобильное приложение', owner: 'Илья', status: 'На проверке' } },
]

/** Входы без пустых полей — объект для `createTheme({...})` */
function compactInput(input: ThemeInput): ThemeInput {
	const font = Object.fromEntries(Object.entries(input.font ?? {}).filter(([, value]) => value))
	const entries = Object.entries({ ...input, font: Object.keys(font).length ? font : undefined })
	return Object.fromEntries(entries.filter(([, value]) => value !== undefined && value !== '')) as unknown as ThemeInput
}

/** Объект как код JS: ключи без кавычек, строки — в одинарных */
function jsLiteral(value: unknown, depth = 0): string {
	if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
	if (typeof value !== 'object' || value === null) return String(value)
	const pad = '\t'.repeat(depth + 1)
	const lines = Object.entries(value).map(([key, item]) => `${pad}${key}: ${jsLiteral(item, depth + 1)},`)
	return `{\n${lines.join('\n')}\n${'\t'.repeat(depth)}}`
}

export function setup() {
	const input = ref<ThemeInput>({ ...structuredClone(THEME_PRESETS.corporate), name: 'brand', primaryDark: '#60a5fa' })
	const hasPrimaryDark = ref(false)
	const tab = ref('general')
	const search = ref('Сайт студии')
	const role = ref('editor')
	const copied = ref('')
	const lightPanel = ref<HTMLElement | null>(null)
	const darkPanel = ref<HTMLElement | null>(null)

	const themeInput = computed(() =>
		compactInput({ ...input.value, primaryDark: hasPrimaryDark.value ? input.value.primaryDark : undefined }),
	)
	const theme = computed(() => createTheme(themeInput.value))
	const jsCode = computed(() =>
		[
			"import { applyTheme, createTheme } from '@ramzes1385/rise-ui-kit'",
			'',
			`applyTheme(createTheme(${jsLiteral(themeInput.value)}))`,
		].join('\n'),
	)
	const cssCode = computed(() => theme.value.css)
	const contrast = computed<ContrastLine[]>(() => {
		const light = theme.value.contrast.filter(row => row.mode === 'light')
		const dark = theme.value.contrast.filter(row => row.mode === 'dark')
		return light.map((row, index) => ({
			key: `${row.fg}|${row.bg}`,
			pair: `${row.fg} на ${row.bg}`,
			min: row.min,
			informational: Boolean(row.informational),
			light: row,
			dark: dark[index],
		}))
	})
	const failures = computed(() => theme.value.contrast.filter(row => !row.ok && !row.informational).length)
	const fontSans = computed({
		get: () => input.value.font?.sans ?? '',
		set: (sans: string) => {
			input.value = { ...input.value, font: { ...input.value.font, sans } }
		},
	})

	watchEffect(() => {
		for (const panel of [lightPanel.value, darkPanel.value]) if (panel) applyTheme(theme.value, { target: panel })
	})

	function loadPreset(name: ThemePresetName): void {
		const preset = structuredClone(THEME_PRESETS[name])
		hasPrimaryDark.value = Boolean(preset.primaryDark)
		input.value = { ...preset, palettes: undefined, name: 'brand', primaryDark: preset.primaryDark ?? '#60a5fa' }
	}

	async function copy(kind: 'js' | 'css'): Promise<void> {
		const label = kind === 'js' ? 'Код JS' : 'CSS'
		copied.value = await navigator.clipboard.writeText(kind === 'js' ? jsCode.value : cssCode.value).then(
			() => `${label} скопирован`,
			() => `${label} не скопирован: браузер не дал доступ к буферу — выделите код ниже`,
		)
	}

	return {
		input,
		hasPrimaryDark,
		tab,
		search,
		role,
		copied,
		lightPanel,
		darkPanel,
		themeInput,
		theme,
		jsCode,
		cssCode,
		contrast,
		failures,
		fontSans,
		presetOptions,
		radiusOptions,
		densityOptions,
		shadowOptions,
		motionOptions,
		neutralOptions,
		fontOptions,
		roleOptions,
		tabs,
		columns,
		rows,
		loadPreset,
		copy,
	}
}
