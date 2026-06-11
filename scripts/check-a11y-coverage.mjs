/**
 * Скрипт проверки покрытия UI Kit компонентов accessibility-тестами.
 * Проверяет:
 * 1. Наличие .stories.ts для каждого Base* компонента
 * 2. Наличие обязательных story-состояний (Default, Disabled, Error)
 * 3. Наличие play-функций для интерактивных компонентов
 * 4. Наличие keyboard navigation в play-функциях
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

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

/** Интерактивные компоненты, требующие keyboard navigation */
const INTERACTIVE_COMPONENTS = new Set([
  'BaseButton', 'BaseInput', 'BaseTextarea', 'BaseSelect',
  'BaseCheckbox', 'BaseRadio', 'BaseSwitch', 'BaseSlider',
  'BaseRange', 'BaseDropdown', 'BaseTabs', 'BaseAccordion',
  'BaseModal', 'BaseTooltip', 'BasePopover', 'BaseMenu',
  'BaseMegaMenu', 'BasePin', 'BaseSearch', 'BaseFileUpload',
  'BaseDatePicker', 'BaseEditor', 'BaseTree', 'BaseSideBar',
  'BaseSlideover', 'BasePagination', 'BaseStepper', 'BaseTable',
  'BaseCalendar', 'BaseNotification',
])

/** Интерактивные компоненты с естественным Disabled-состоянием */
const INTERACTIVE_WITH_DISABLED = new Set([
  'BaseButton', 'BaseInput', 'BaseTextarea', 'BaseSelect',
  'BaseCheckbox', 'BaseRadio', 'BaseSwitch',
  'BaseRange', 'BasePin', 'BaseSearch', 'BaseFileUpload',
  'BaseDatePicker',
])

/** Формовые компоненты, требующие story Error */
const FORM_COMPONENTS = new Set([
  'BaseInput', 'BaseTextarea', 'BaseSelect', 'BaseCheckbox',
  'BaseRadio', 'BaseSwitch', 'BasePin', 'BaseSearch',
  'BaseFileUpload', 'BaseDatePicker',
])

/** Компоненты с состоянием Loading */
const LOADING_COMPONENTS = new Set([
  'BaseButton', 'BaseSearch', 'BaseFileUpload',
  'BaseTable', 'BaseEditor', 'BaseChat', 'BaseSlider',
])

/** Компоненты с состоянием Empty */
const EMPTY_COMPONENTS = new Set([
  'BaseInput', 'BaseTextarea', 'BaseSelect', 'BasePin',
  'BaseSearch', 'BaseFileUpload', 'BaseDatePicker',
  'BaseDropdown', 'BaseTabs', 'BaseAccordion',
  'BaseMenu', 'BaseMegaMenu', 'BaseSlider',
  'BaseTable', 'BaseTree', 'BasePagination',
  'BaseBreadcrumbs', 'BaseChat',
])

/** Компоненты с состоянием LongContent */
const LONG_CONTENT_COMPONENTS = new Set([
  'BaseInput', 'BaseTextarea', 'BaseSelect', 'BaseCheckbox',
  'BaseRadio', 'BaseSwitch', 'BaseSearch', 'BaseDropdown',
  'BaseTabs', 'BaseAccordion', 'BaseModal', 'BaseTooltip',
  'BasePopover', 'BaseMenu', 'BaseMegaMenu', 'BaseSlider',
  'BaseTable', 'BaseTree', 'BaseSideBar', 'BaseSlideover',
  'BaseNotification', 'BaseEditor', 'BaseChat', 'BaseCard',
  'BaseAlert', 'BaseBreadcrumbs', 'BaseChip', 'BaseFormField',
  'BaseText', 'BaseStepper',
])

/** Обязательные story-состояния для интерактивных компонентов с Disabled */
const REQUIRED_STORIES_INTERACTIVE = ['Default', 'Disabled']

/** Обязательные story-состояния для интерактивных компонентов без Disabled */
const REQUIRED_STORIES_INTERACTIVE_NO_DISABLED = ['Default']

/** Обязательные story-состояния для формовых компонентов */
const REQUIRED_STORIES_FORM = ['Default', 'Disabled', 'Error']

/** Признаки keyboard navigation в play-функциях */
const KEYBOARD_PATTERNS = [
  'userEvent.tab', 'userEvent.keyboard', 'userEvent.type',
  'fireEvent.keyDown', 'fireEvent.keyUp',
]

/** Признаки Focused/Keyboard состояния в play-функции */
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

    const content = readFileSync(storyPath, 'utf-8')
    const isInteractive = INTERACTIVE_COMPONENTS.has(component)
    const isForm = FORM_COMPONENTS.has(component)

    // Проверка play-функций для интерактивных компонентов
    if (isInteractive) {
      const hasPlay = content.includes('play:') || content.includes('play =')
      if (hasPlay) {
        results.hasPlay++
        // Проверка keyboard navigation
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

    // Проверка обязательных story-состояний
    const hasDisabledState = INTERACTIVE_WITH_DISABLED.has(component)
    const requiredStates = isForm
      ? REQUIRED_STORIES_FORM
      : isInteractive && hasDisabledState
        ? REQUIRED_STORIES_INTERACTIVE
        : isInteractive
          ? REQUIRED_STORIES_INTERACTIVE_NO_DISABLED
          : ['Default']

    const missingStates = requiredStates.filter(
      state => {
        const aliases = STATE_ALIASES[state] || [state]
        return !aliases.some(alias => content.includes(`export const ${alias}`))
      }
    )

    if (missingStates.length > 0) {
      results.missingStates.push({ component, states: missingStates })
    }

    // Проверка Loading stories
    if (LOADING_COMPONENTS.has(component)) {
      const aliases = STATE_ALIASES.Loading || ['Loading']
      const hasLoading = aliases.some(a => content.includes(`export const ${a}`))
      if (!hasLoading) results.missingLoading.push(component)
    }

    // Проверка Empty stories
    if (EMPTY_COMPONENTS.has(component)) {
      const aliases = STATE_ALIASES.Empty || ['Empty']
      const hasEmpty = aliases.some(a => content.includes(`export const ${a}`))
      if (!hasEmpty) results.missingEmpty.push(component)
    }

    // Проверка LongContent stories
    if (LONG_CONTENT_COMPONENTS.has(component)) {
      const aliases = STATE_ALIASES.LongContent || ['LongContent']
      const hasLong = aliases.some(a => content.includes(`export const ${a}`))
      if (!hasLong) results.missingLongContent.push(component)
    }

    // Проверка Focused/Keyboard в Default story
    if (isInteractive) {
      const hasFocus = KEYBOARD_FOCUS_PATTERNS.some(p => content.includes(p))
      if (!hasFocus) results.missingKeyboardFocus.push(component)
    }
  }

  // Вывод результатов
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

  if (hasErrors) {
    console.log('\n❌ Проверка завершилась с ошибками.')
    process.exit(1)
  } else {
    console.log('\n✅ Все компоненты покрыты accessibility-тестами.')
    process.exit(0)
  }
}

checkA11yCoverage()
