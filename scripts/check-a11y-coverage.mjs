/** Проверяет покрытие компонентов accessibility: наличие stories, обязательных состояний (Default/Disabled/Error), play-функций и keyboard navigation. */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(process.cwd())
const COMPONENTS_DIR = join(ROOT, 'src/components')

function findStoryPath(componentDir, componentName) {
	const directPath = join(componentDir, `${componentName}.stories.ts`)
	const nestedPath = join(componentDir, 'stories', `${componentName}.stories.ts`)

	if (existsSync(directPath)) {
		return directPath
	}

	if (existsSync(nestedPath)) {
		return nestedPath
	}

	return null
}

/** Stories компонента разложены по файлам папки stories/: meta, части meta и cases/ с самими stories */
function readStories(storyPath) {
	const dir = dirname(storyPath)
	return readdirSync(dir, { recursive: true })
		.filter(file => String(file).endsWith('.ts'))
		.map(file => readFileSync(join(dir, String(file)), 'utf-8'))
		.join('\n')
}

/** Интерактивные компоненты, требующие keyboard navigation */
const INTERACTIVE_COMPONENTS = new Set([
	'BaseImageCompare',
	'BaseMarquee',
	'BaseCommandPalette',
	'BaseButton',
	'BaseBanner',
	'BaseCookieConsent',
	'BaseInput',
	'BaseTextarea',
	'BaseSelect',
	'BaseCheckbox',
	'BaseRadio',
	'BaseSwitch',
	'BaseSlider',
	'BaseRange',
	'BaseDropdown',
	'BaseTabs',
	'BaseAccordion',
	'BaseModal',
	'BaseTooltip',
	'BasePopover',
	'BaseBadge',
	'BaseAvatar',
	'BaseCard',
	'BaseChip',
	'BaseMenu',
	'BaseMegaMenu',
	'BasePin',
	'BaseSearch',
	'BaseFileUpload',
	'BaseDatePicker',
	'BaseEditor',
	'BaseTree',
	'BaseSideBar',
	'BaseSlideover',
	'BasePagination',
	'BaseStepper',
	'BaseTable',
	'BaseCalendar',
	'BaseNotification',
	'BaseConfirm',
	'BaseColorModeButton',
	'BaseLink',
	'BaseDropdownMenu',
	'BaseContextMenu',
	'BasePopconfirm',
	'BaseCheckboxGroup',
	'BaseInputNumber',
	'BaseAutocomplete',
	'BaseTimePicker',
	'BaseInputTags',
	'BaseSegmented',
	'BaseSplitButton',
	'BaseToolbar',
	'BaseFab',
	'BaseInplace',
	'BaseLayout',
	'BaseHeader',
	'BaseSplitter',
	'BaseScrollArea',
	'BaseDrawer',
	'BaseBackTop',
	'BaseInfiniteScroll',
	'BaseVirtualList',
	'BaseMediaPlayer',
	'BaseWaveform',
	'BaseAudioPlayer',
	'BaseVoiceRecorder',
	'BaseSubtitleEditor',
	'BaseReasoning',
	'BaseToolCall',
	'BasePromptInput',
	'BaseEmojiPicker',
	'BaseMention',
	'BaseKanban',
	'BaseFilterBuilder',
	'BaseChecklist',
	'BasePhoneInput',
	'BaseMoneyInput',
	'BaseRequisiteInput',
	'BaseAddressInput',
	'BaseJsonViewer',
	'BaseSignaturePad',
	'BaseAvatarCropper',
	'BaseNotificationCenter',
	'BaseCommentThread',
	'BaseDadataInput',
	'BaseMap',
	'BaseChart',
	'BaseBottomNav',
	'BaseEventCalendar',
	'BaseTag',
	'BaseTagGroup',
	'BasePresentationPlayer',
	'BaseImageMap',
	'BaseCardInput',
	'BaseList',
	'BaseTransfer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseCryptoProSign',
	'BaseImageMapEditor',
	'BaseImageMap3D',
	'BaseHoverCard',

	'BaseDashboardGrid',
	'BaseGantt',
])

/** Интерактивные компоненты с естественным Disabled-состоянием */
const INTERACTIVE_WITH_DISABLED = new Set([
	'BaseButton',
	'BaseBadge',
	'BaseAvatar',
	'BaseCard',
	'BaseInput',
	'BaseTextarea',
	'BaseSelect',
	'BaseCheckbox',
	'BaseRadio',
	'BaseSwitch',
	'BaseRange',
	'BasePin',
	'BaseSearch',
	'BaseFileUpload',
	'BaseDatePicker',
	'BaseColorModeButton',
	'BaseLink',
	'BaseDropdownMenu',
	'BaseContextMenu',
	'BaseCheckboxGroup',
	'BaseInputNumber',
	'BaseAutocomplete',
	'BaseTimePicker',
	'BaseInputTags',
	'BaseSegmented',
	'BaseSplitButton',
	'BaseToolbar',
	'BaseFab',
	'BaseInplace',
	'BaseSplitter',
	'BaseWaveform',
	'BaseAudioPlayer',
	'BaseVoiceRecorder',
	'BaseSubtitleEditor',
	'BasePromptInput',
	'BaseEmojiPicker',
	'BaseMention',
	'BaseKanban',
	'BaseFilterBuilder',
	'BaseChecklist',
	'BasePhoneInput',
	'BaseMoneyInput',
	'BaseRequisiteInput',
	'BaseAddressInput',
	'BaseSignaturePad',
	'BaseAvatarCropper',
	'BaseDadataInput',
	'BaseBottomNav',
	'BaseTag',
	'BaseTagGroup',
	'BaseImageMap',
	'BaseCardInput',
	'BaseList',
	'BaseTransfer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseCryptoProSign',
	'BaseImageMapEditor',
	'BaseHoverCard',

	'BaseDashboardGrid',
	'BaseGantt',
])

/** Формовые компоненты, требующие story Error */
const FORM_COMPONENTS = new Set([
	'BaseInput',
	'BaseTextarea',
	'BaseSelect',
	'BaseCheckbox',
	'BaseRadio',
	'BaseSwitch',
	'BasePin',
	'BaseSearch',
	'BaseFileUpload',
	'BaseDatePicker',
	'BaseCheckboxGroup',
	'BaseInputNumber',
	'BaseAutocomplete',
	'BaseTimePicker',
	'BaseInputTags',
	'BaseSegmented',
	'BasePromptInput',
	'BaseMention',
	'BasePhoneInput',
	'BaseMoneyInput',
	'BaseRequisiteInput',
	'BaseAddressInput',
	'BaseSignaturePad',
	'BaseDadataInput',
	'BaseCardInput',
	'BaseList',
	'BaseTransfer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseImageMapEditor',
])

const LOADING_COMPONENTS = new Set([
	'BaseButton',
	'BaseSearch',
	'BaseFileUpload',
	'BaseTable',
	'BaseEditor',
	'BaseChat',
	'BaseSlider',
	'BaseDadataInput',
	'BaseMap',
	'BasePresentationPlayer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseCryptoProSign',
	'BaseGantt',
])

const EMPTY_COMPONENTS = new Set([
	'BaseInput',
	'BaseTextarea',
	'BaseSelect',
	'BasePin',
	'BaseSearch',
	'BaseFileUpload',
	'BaseDatePicker',
	'BaseDropdown',
	'BaseTabs',
	'BaseAccordion',
	'BaseMenu',
	'BaseMegaMenu',
	'BaseSlider',
	'BaseTable',
	'BaseTree',
	'BasePagination',
	'BaseBreadcrumbs',
	'BaseChat',
	'BaseDadataInput',
	'BaseChart',
	'BaseDescriptions',
	'BaseEventCalendar',
	'BaseAnchor',
	'BaseList',
	'BaseTransfer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseCode',
	'BaseCryptoProSign',
	'BaseDashboardGrid',
	'BaseGantt',
])

const LONG_CONTENT_COMPONENTS = new Set([
	'BaseInput',
	'BaseBanner',
	'BaseCookieConsent',
	'BaseResult',
	'BaseTextarea',
	'BaseSelect',
	'BaseCheckbox',
	'BaseRadio',
	'BaseSwitch',
	'BaseSearch',
	'BaseDropdown',
	'BaseTabs',
	'BaseAccordion',
	'BaseModal',
	'BaseTooltip',
	'BasePopover',
	'BaseMenu',
	'BaseMegaMenu',
	'BaseSlider',
	'BaseTable',
	'BaseTree',
	'BaseSideBar',
	'BaseSlideover',
	'BaseNotification',
	'BaseEditor',
	'BaseChat',
	'BaseCard',
	'BaseAlert',
	'BaseBreadcrumbs',
	'BaseChip',
	'BaseFormField',
	'BaseText',
	'BaseStepper',
	'BaseConfirm',
	'BaseDadataInput',
	'BaseDescriptions',
	'BaseAnchor',
	'BaseList',
	'BaseTransfer',
	'BaseTreeSelect',
	'BaseCascader',
	'BaseCode',
	'BaseDashboardGrid',
	'BaseGantt',
])

const REQUIRED_STORIES_INTERACTIVE = ['Default', 'Disabled']

const REQUIRED_STORIES_INTERACTIVE_NO_DISABLED = ['Default']

const REQUIRED_STORIES_FORM = ['Default', 'Disabled', 'Error']

const KEYBOARD_PATTERNS = ['userEvent.tab', 'userEvent.keyboard', 'userEvent.type', 'fireEvent.keyDown', 'fireEvent.keyUp']

const KEYBOARD_FOCUS_PATTERNS = [
	'userEvent.tab',
	'userEvent.keyboard',
	'playFocusTest',
	'playKeyboardNavigation',
	'playShiftTab',
	'playActivation',
]

/** Алиасы для обязательных story-состояний (ключ = требуемое состояние) */
const STATE_ALIASES = {
	Error: ['Error', 'WithError', 'ErrorInvalid'],
	Loading: ['Loading', 'IsLoading'],
	Empty: ['Empty', 'NoData', 'NoItems'],
	LongContent: ['LongContent', 'Long', 'Overflow'],
}

/** Метка незаполненных мест заготовки scripts/create-component.mjs: пока она есть, компонент не готов. */
const SCAFFOLD_TODO = 'TODO(scaffold)'

function findScaffoldTodos() {
	return readdirSync(COMPONENTS_DIR, { recursive: true, withFileTypes: true })
		.filter(entry => entry.isFile() && /\.(ts|vue|scss)$/.test(entry.name))
		.map(entry => join(entry.parentPath ?? entry.path, entry.name))
		.filter(path => readFileSync(path, 'utf-8').includes(SCAFFOLD_TODO))
		.map(path => path.replace(`${ROOT}/`, ''))
}

function checkA11yCoverage() {
	console.log('=== Запуск проверки покрытия Accessibility-тестами ===\n')

	if (!existsSync(COMPONENTS_DIR)) {
		console.error(`❌ Ошибка: Директория компонентов не найдена: ${COMPONENTS_DIR}`)
		process.exit(1)
	}

	const items = readdirSync(COMPONENTS_DIR, { withFileTypes: true })
	const baseComponents = items
		.filter(item => item.isDirectory() && item.name.startsWith('Base'))
		.map(item => item.name)
		.sort()

	if (baseComponents.length === 0) {
		console.error('❌ Ошибка: Не найдено ни одного компонента Base* в src/components')
		process.exit(1)
	}

	const results = {
		total: baseComponents.length,
		hasStory: 0,
		missingStory: [],
		hasPlay: 0,
		missingPlay: [],
		hasKeyboard: 0,
		missingKeyboard: [],
		missingStates: [],
		missingLoading: [],
		missingEmpty: [],
		missingLongContent: [],
		missingKeyboardFocus: [],
	}

	for (const component of baseComponents) {
		const componentDir = join(COMPONENTS_DIR, component)
		const storyPath = findStoryPath(componentDir, component)

		if (!storyPath) {
			results.missingStory.push(component)
			continue
		}
		results.hasStory++

		const content = readStories(storyPath)
		const isInteractive = INTERACTIVE_COMPONENTS.has(component)
		const isForm = FORM_COMPONENTS.has(component)

		if (isInteractive) {
			// Граница слова: иначе `display:` в стилях шаблона засчитывался бы как play-функция
			const hasPlay = /\bplay\s*[:=]/.test(content)
			if (hasPlay) {
				results.hasPlay++
				const hasKeyboard = KEYBOARD_PATTERNS.some(p => content.includes(p))
				if (hasKeyboard) {
					results.hasKeyboard++
				} else {
					results.missingKeyboard.push(component)
				}
			} else {
				results.missingPlay.push(component)
			}
		}

		const hasDisabledState = INTERACTIVE_WITH_DISABLED.has(component)
		const requiredStates = isForm
			? REQUIRED_STORIES_FORM
			: isInteractive && hasDisabledState
				? REQUIRED_STORIES_INTERACTIVE
				: isInteractive
					? REQUIRED_STORIES_INTERACTIVE_NO_DISABLED
					: ['Default']

		const missingStates = requiredStates.filter(state => {
			const aliases = STATE_ALIASES[state] || [state]
			return !aliases.some(alias => content.includes(`export const ${alias}`))
		})

		if (missingStates.length > 0) {
			results.missingStates.push({ component, states: missingStates })
		}

		if (LOADING_COMPONENTS.has(component)) {
			const aliases = STATE_ALIASES.Loading || ['Loading']
			const hasLoading = aliases.some(a => content.includes(`export const ${a}`))
			if (!hasLoading) results.missingLoading.push(component)
		}

		if (EMPTY_COMPONENTS.has(component)) {
			const aliases = STATE_ALIASES.Empty || ['Empty']
			const hasEmpty = aliases.some(a => content.includes(`export const ${a}`))
			if (!hasEmpty) results.missingEmpty.push(component)
		}

		if (LONG_CONTENT_COMPONENTS.has(component)) {
			const aliases = STATE_ALIASES.LongContent || ['LongContent']
			const hasLong = aliases.some(a => content.includes(`export const ${a}`))
			if (!hasLong) results.missingLongContent.push(component)
		}

		if (isInteractive) {
			const hasFocus = KEYBOARD_FOCUS_PATTERNS.some(p => content.includes(p))
			if (!hasFocus) results.missingKeyboardFocus.push(component)
		}
	}

	console.log('=== Результаты проверки ===')
	console.log(`Всего компонентов: ${results.total}`)
	console.log(`Покрыто stories: ${results.hasStory}/${results.total}`)
	console.log(`Интерактивных с play: ${results.hasPlay}`)
	console.log(`С keyboard navigation: ${results.hasKeyboard}`)
	console.log()

	let hasErrors = false

	if (results.missingStory.length > 0) {
		console.log('❌ Компоненты без .stories.ts:')
		results.missingStory.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingPlay.length > 0) {
		console.log('❌ Интерактивные компоненты без play-функций:')
		results.missingPlay.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingKeyboard.length > 0) {
		console.log('⚠️  Компоненты с play, но без keyboard navigation:')
		results.missingKeyboard.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingStates.length > 0) {
		console.log('⚠️  Компоненты без обязательных story-состояний:')
		results.missingStates.forEach(({ component, states }) => {
			console.log(`  - ${component}: отсутствуют ${states.join(', ')}`)
		})
		hasErrors = true
	}

	if (results.missingLoading.length > 0) {
		console.log(`⚠️  Компоненты без Loading stories (${results.missingLoading.length}):`)
		results.missingLoading.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingEmpty.length > 0) {
		console.log(`⚠️  Компоненты без Empty stories (${results.missingEmpty.length}):`)
		results.missingEmpty.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingLongContent.length > 0) {
		console.log(`⚠️  Компоненты без LongContent stories (${results.missingLongContent.length}):`)
		results.missingLongContent.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	if (results.missingKeyboardFocus.length > 0) {
		console.log(`⚠️  Компоненты без Focused/Keyboard play (${results.missingKeyboardFocus.length}):`)
		results.missingKeyboardFocus.forEach(c => console.log(`  - ${c}`))
		hasErrors = true
	}

	const scaffoldTodos = findScaffoldTodos()
	if (scaffoldTodos.length > 0) {
		console.log(`❌ Незаполненные места заготовки (${SCAFFOLD_TODO}):`)
		scaffoldTodos.forEach(path => console.log(`  - ${path}`))
		hasErrors = true
	}

	if (hasErrors) {
		console.log('\n❌ Проверка завершилась с ошибками.')
		process.exit(1)
	} else {
		console.log('\n✅ Все компоненты покрыты accessibility-тестами.')
		process.exit(0)
	}
}

checkA11yCoverage()
