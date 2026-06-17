/**
 * Экспорт всех глобальных констант UI-библиотеки.
 *
 * Группированные объекты (для нового кода):
 *   import { UI_TEXT, UI_TIMING, UI_FONT_WEIGHT, UI_CHAT_TEXT, UI_EDITOR } from '@constants'
 *
 * Плоские реэкспорты (обратная совместимость):
 *   import { UI_FONT_WEIGHT_SEMIBOLD, UI_CHAT_SCALE_ICON } from '@constants'
 */

import { UI_ARIA, UI_CALENDAR, UI_COLOR_PICKER, UI_FILTER, UI_FONT_WEIGHT, UI_RATING, UI_SCALE, UI_SIZE, UI_TEXT, UI_TIMING, UI_TOUR } from './ui'
import { UI_CHAT_SCALE, UI_CHAT_TEXT } from './chat'
import { UI_EDITOR } from './editor'

export { UI_ARIA, UI_CALENDAR, UI_COLOR_PICKER, UI_FILTER, UI_FONT_WEIGHT, UI_RATING, UI_SCALE, UI_SIZE, UI_TEXT, UI_TIMING, UI_TOUR, CALENDAR_GRID_CELLS, MS_PER_DAY, UI_PROGRESS_STEP_MIN, UI_PROGRESS_STEP_RANGE } from './ui'
export { UI_CHAT_SCALE, UI_CHAT_TEXT } from './chat'
export { UI_EDITOR } from './editor'

// ─── Обратная совместимость: плоские реэкспорты ───────────────────

// UI_TEXT
/** @deprecated Use UI_TEXT.EMPTY instead */
export const UI_EMPTY_TEXT = UI_TEXT.EMPTY
/** @deprecated Use UI_TEXT.NO_RESULTS instead */
export const UI_NO_RESULTS_TEXT = UI_TEXT.NO_RESULTS
/** @deprecated Use UI_TEXT.SEARCH_PLACEHOLDER instead */
export const UI_SEARCH_PLACEHOLDER = UI_TEXT.SEARCH_PLACEHOLDER
/** @deprecated Use UI_TEXT.TODAY instead */
export const UI_TODAY_TEXT = UI_TEXT.TODAY
/** @deprecated Use UI_TEXT.LOADING instead */
export const UI_LOADING_TEXT = UI_TEXT.LOADING
/** @deprecated Use UI_TEXT.LOADING_ARIA instead */
export const UI_LOADING_ARIA = UI_TEXT.LOADING_ARIA
/** @deprecated Use UI_TEXT.LOAD_MORE instead */
export const UI_LOAD_MORE_TEXT = UI_TEXT.LOAD_MORE
/** @deprecated Use UI_TEXT.IMAGE_ERROR instead */
export const UI_IMAGE_ERROR_TEXT = UI_TEXT.IMAGE_ERROR
/** @deprecated Use UI_TEXT.FILE_STATUS_DONE instead */
export const UI_FILE_STATUS_DONE = UI_TEXT.FILE_STATUS_DONE
/** @deprecated Use UI_TEXT.FILE_STATUS_ERROR instead */
export const UI_FILE_STATUS_ERROR = UI_TEXT.FILE_STATUS_ERROR
/** @deprecated Use UI_TEXT.FILE_STATUS_PENDING instead */
export const UI_FILE_STATUS_PENDING = UI_TEXT.FILE_STATUS_PENDING
/** @deprecated Use UI_TEXT.DELETE instead */
export const UI_DELETE_TEXT = UI_TEXT.DELETE
/** @deprecated Use UI_TEXT.NO_COLOR instead */
export const UI_NO_COLOR_TEXT = UI_TEXT.NO_COLOR
/** @deprecated Use UI_TEXT.CANCEL instead */
export const UI_CANCEL_TEXT = UI_TEXT.CANCEL
/** @deprecated Use UI_TEXT.APPLY instead */
export const UI_APPLY_TEXT = UI_TEXT.APPLY
/** @deprecated Use UI_TEXT.SELECT_PLACEHOLDER instead */
export const UI_SELECT_PLACEHOLDER = UI_TEXT.SELECT_PLACEHOLDER
/** @deprecated Use UI_TEXT.SELECT_DATE instead */
export const UI_SELECT_DATE_TEXT = UI_TEXT.SELECT_DATE
/** @deprecated Use UI_TEXT.EXPAND instead */
export const UI_EXPAND_TEXT = UI_TEXT.EXPAND
/** @deprecated Use UI_TEXT.COLLAPSE instead */
export const UI_COLLAPSE_TEXT = UI_TEXT.COLLAPSE
/** @deprecated Use UI_TEXT.FILE_SELECT instead */
export const UI_FILE_SELECT_TEXT = UI_TEXT.FILE_SELECT
/** @deprecated Use UI_TEXT.FILE_DROP instead */
export const UI_FILE_DROP_TEXT = UI_TEXT.FILE_DROP
/** @deprecated Use UI_TEXT.FILE_MAX_SIZE_PREFIX instead */
export const UI_FILE_MAX_SIZE_PREFIX = UI_TEXT.FILE_MAX_SIZE_PREFIX
/** @deprecated Use UI_TEXT.FILE_MAX_SIZE_SUFFIX instead */
export const UI_FILE_MAX_SIZE_SUFFIX = UI_TEXT.FILE_MAX_SIZE_SUFFIX
/** @deprecated Use UI_TEXT.FILE_MAX_COUNT_PREFIX instead */
export const UI_FILE_MAX_COUNT_PREFIX = UI_TEXT.FILE_MAX_COUNT_PREFIX

// UI_ARIA
/** @deprecated Use UI_ARIA.BREADCRUMBS instead */
export const UI_BREADCRUMBS_ARIA = UI_ARIA.BREADCRUMBS
/** @deprecated Use UI_ARIA.CLOSE instead */
export const UI_CLOSE_ARIA = UI_ARIA.CLOSE
/** @deprecated Use UI_ARIA.PREV_YEAR instead */
export const UI_PREV_YEAR_ARIA = UI_ARIA.PREV_YEAR
/** @deprecated Use UI_ARIA.PREV_MONTH instead */
export const UI_PREV_MONTH_ARIA = UI_ARIA.PREV_MONTH
/** @deprecated Use UI_ARIA.NEXT_MONTH instead */
export const UI_NEXT_MONTH_ARIA = UI_ARIA.NEXT_MONTH
/** @deprecated Use UI_ARIA.NEXT_YEAR instead */
export const UI_NEXT_YEAR_ARIA = UI_ARIA.NEXT_YEAR
/** @deprecated Use UI_ARIA.SORT instead */
export const UI_SORT_ARIA = UI_ARIA.SORT
/** @deprecated Use UI_ARIA.PASSWORD_HIDE instead */
export const UI_PASSWORD_HIDE_ARIA = UI_ARIA.PASSWORD_HIDE
/** @deprecated Use UI_ARIA.PASSWORD_SHOW instead */
export const UI_PASSWORD_SHOW_ARIA = UI_ARIA.PASSWORD_SHOW

// UI_TIMING
/** @deprecated Use UI_TIMING.DEBOUNCE_DEFAULT instead */
export const UI_DEBOUNCE_DEFAULT_MS = UI_TIMING.DEBOUNCE_DEFAULT
/** @deprecated Use UI_TIMING.ANIMATION_DURATION instead */
export const UI_ANIMATION_DURATION_MS = UI_TIMING.ANIMATION_DURATION
/** @deprecated Use UI_TIMING.HOVER_DELAY instead */
export const UI_HOVER_DELAY_MS = UI_TIMING.HOVER_DELAY
/** @deprecated Use UI_TIMING.TRANSITION_DURATION instead */
export const UI_TRANSITION_DURATION_MS = UI_TIMING.TRANSITION_DURATION
/** @deprecated Use UI_TIMING.PROGRESS_INTERVAL instead */
export const UI_PROGRESS_INTERVAL_MS = UI_TIMING.PROGRESS_INTERVAL
/** @deprecated Use UI_TIMING.TOOLTIP_SHOW_DELAY instead */
export const UI_TOOLTIP_SHOW_DELAY_MS = UI_TIMING.TOOLTIP_SHOW_DELAY
/** @deprecated Use UI_TIMING.TOOLTIP_HIDE_DELAY instead */
export const UI_TOOLTIP_HIDE_DELAY_MS = UI_TIMING.TOOLTIP_HIDE_DELAY
/** @deprecated Use UI_TIMING.SLIDER_HOLD_INTERVAL instead */
export const UI_SLIDER_HOLD_INTERVAL_MS = UI_TIMING.SLIDER_HOLD_INTERVAL
/** @deprecated Use UI_TIMING.HIGHLIGHT_DURATION instead */
export const UI_HIGHLIGHT_DURATION_MS = UI_TIMING.HIGHLIGHT_DURATION
/** @deprecated Use UI_TIMING.NOTIFICATION_AUTO_CLOSE instead */
export const UI_NOTIFICATION_AUTO_CLOSE_MS = UI_TIMING.NOTIFICATION_AUTO_CLOSE
/** @deprecated Use UI_TIMING.IMAGE_LOAD_TIMEOUT instead */
export const UI_IMAGE_LOAD_TIMEOUT_MS = UI_TIMING.IMAGE_LOAD_TIMEOUT

// UI_SIZE
/** @deprecated Use UI_SIZE.PANEL_MAX_HEIGHT instead */
export const UI_PANEL_MAX_HEIGHT = UI_SIZE.PANEL_MAX_HEIGHT
/** @deprecated Use UI_SIZE.SIDEBAR_DEFAULT_WIDTH instead */
export const UI_SIDEBAR_DEFAULT_WIDTH = UI_SIZE.SIDEBAR_DEFAULT_WIDTH
/** @deprecated Use UI_SIZE.MODAL_DEFAULT_WIDTH instead */
export const UI_MODAL_DEFAULT_WIDTH = UI_SIZE.MODAL_DEFAULT_WIDTH
/** @deprecated Use UI_SIZE.CONTEXT_MENU_WIDTH instead */
export const UI_CONTEXT_MENU_DEFAULT_WIDTH = UI_SIZE.CONTEXT_MENU_WIDTH
/** @deprecated Use UI_SIZE.CONTEXT_MENU_HEIGHT instead */
export const UI_CONTEXT_MENU_DEFAULT_HEIGHT = UI_SIZE.CONTEXT_MENU_HEIGHT
/** @deprecated Use UI_SIZE.CHAT_DEFAULT_HEIGHT instead */
export const UI_CHAT_DEFAULT_HEIGHT = UI_SIZE.CHAT_DEFAULT_HEIGHT
/** @deprecated Use UI_SIZE.SLIDER_DEFAULT_HEIGHT instead */
export const UI_SLIDER_DEFAULT_HEIGHT = UI_SIZE.SLIDER_DEFAULT_HEIGHT
/** @deprecated Use UI_SIZE.IMAGE_LOADING_MIN_HEIGHT instead */
export const UI_IMAGE_LOADING_MIN_HEIGHT = UI_SIZE.IMAGE_LOADING_MIN_HEIGHT
/** @deprecated Use UI_SIZE.MINIMAP_WIDTH instead */
export const UI_MINIMAP_WIDTH = UI_SIZE.MINIMAP_WIDTH
/** @deprecated Use UI_SIZE.MINIMAP_HEIGHT instead */
export const UI_MINIMAP_HEIGHT = UI_SIZE.MINIMAP_HEIGHT
/** @deprecated Use UI_SIZE.PROGRESS_CIRCLE_RADIUS instead */
export const UI_PROGRESS_CIRCLE_RADIUS = UI_SIZE.PROGRESS_CIRCLE_RADIUS

// UI_SCALE
/** @deprecated Use UI_SCALE.SMALL instead */
export const UI_SCALE_SMALL = UI_SCALE.SMALL
/** @deprecated Use UI_SCALE.MEDIUM instead */
export const UI_SCALE_MEDIUM = UI_SCALE.MEDIUM
/** @deprecated Use UI_SCALE.LARGE instead */
export const UI_SCALE_LARGE = UI_SCALE.LARGE
/** @deprecated Use UI_SCALE.AUTOCOMPLETE instead */
export const UI_SCALE_AUTOCOMPLETE = UI_SCALE.AUTOCOMPLETE
/** @deprecated Use UI_SCALE.ROTATION_STEP_DEG instead */
export const UI_ROTATION_STEP_DEG = UI_SCALE.ROTATION_STEP_DEG
/** @deprecated Use UI_SCALE.FULL_ROTATION_DEG instead */
export const UI_FULL_ROTATION_DEG = UI_SCALE.FULL_ROTATION_DEG

// UI_FONT_WEIGHT
/** @deprecated Use UI_FONT_WEIGHT.MEDIUM instead */
export const UI_FONT_WEIGHT_MEDIUM = UI_FONT_WEIGHT.MEDIUM
/** @deprecated Use UI_FONT_WEIGHT.SEMIBOLD instead */
export const UI_FONT_WEIGHT_SEMIBOLD = UI_FONT_WEIGHT.SEMIBOLD
/** @deprecated Use UI_FONT_WEIGHT.BOLD instead */
export const UI_FONT_WEIGHT_BOLD = UI_FONT_WEIGHT.BOLD

// UI_TOUR
/** @deprecated Use UI_TOUR.SKIP instead */
export const UI_SKIP_TOUR_TEXT = UI_TOUR.SKIP
/** @deprecated Use UI_TOUR.NEXT instead */
export const UI_NEXT_TEXT = UI_TOUR.NEXT
/** @deprecated Use UI_TOUR.PREV instead */
export const UI_PREV_TEXT = UI_TOUR.PREV
/** @deprecated Use UI_TOUR.FINISH instead */
export const UI_FINISH_TOUR_TEXT = UI_TOUR.FINISH
/** @deprecated Use UI_TOUR.TITLE instead */
export const UI_TOUR_TITLE = UI_TOUR.TITLE

// UI_FILTER
/** @deprecated Use UI_FILTER.COLUMN instead */
export const UI_FILTER_COLUMN_TEXT = UI_FILTER.COLUMN
/** @deprecated Use UI_FILTER.CONDITION instead */
export const UI_FILTER_CONDITION_TEXT = UI_FILTER.CONDITION
/** @deprecated Use UI_FILTER.VALUE_PLACEHOLDER instead */
export const UI_FILTER_VALUE_PLACEHOLDER = UI_FILTER.VALUE_PLACEHOLDER

// UI_CALENDAR
/** @deprecated Use UI_CALENDAR.EVENT_TEXT instead */
export const UI_CALENDAR_EVENT_TEXT = UI_CALENDAR.EVENT_TEXT

// UI_CHAT_SCALE
/** @deprecated Use UI_CHAT_SCALE.ICON instead */
export const UI_CHAT_SCALE_ICON = UI_CHAT_SCALE.ICON
/** @deprecated Use UI_CHAT_SCALE.META instead */
export const UI_CHAT_SCALE_META = UI_CHAT_SCALE.META
/** @deprecated Use UI_CHAT_SCALE.MEMBER instead */
export const UI_CHAT_SCALE_MEMBER = UI_CHAT_SCALE.MEMBER
/** @deprecated Use UI_CHAT_SCALE.SUBTEXT instead */
export const UI_CHAT_SCALE_SUBTEXT = UI_CHAT_SCALE.SUBTEXT
/** @deprecated Use UI_CHAT_SCALE.AVATAR_LARGE instead */
export const UI_CHAT_SCALE_AVATAR_LARGE = UI_CHAT_SCALE.AVATAR_LARGE
/** @deprecated Use UI_CHAT_SCALE.NAME instead */
export const UI_CHAT_SCALE_NAME = UI_CHAT_SCALE.NAME
/** @deprecated Use UI_CHAT_SCALE.FILE_ICON instead */
export const UI_CHAT_SCALE_FILE_ICON = UI_CHAT_SCALE.FILE_ICON
/** @deprecated Use UI_CHAT_SCALE.CONFIRM instead */
export const UI_CHAT_SCALE_CONFIRM = UI_CHAT_SCALE.CONFIRM
/** @deprecated Use UI_CHAT_SCALE.STATUS instead */
export const UI_CHAT_SCALE_STATUS = UI_CHAT_SCALE.STATUS
/** @deprecated Use UI_CHAT_SCALE.SPINNER instead */
export const UI_CHAT_SCALE_SPINNER = UI_CHAT_SCALE.SPINNER

// UI_CHAT_TEXT
/** @deprecated Use UI_CHAT_TEXT.REPLY instead */
export const UI_CHAT_REPLY = UI_CHAT_TEXT.REPLY
/** @deprecated Use UI_CHAT_TEXT.SELECT instead */
export const UI_CHAT_SELECT = UI_CHAT_TEXT.SELECT
/** @deprecated Use UI_CHAT_TEXT.COPY instead */
export const UI_CHAT_COPY_TEXT = UI_CHAT_TEXT.COPY
/** @deprecated Use UI_CHAT_TEXT.PIN instead */
export const UI_CHAT_PIN = UI_CHAT_TEXT.PIN
/** @deprecated Use UI_CHAT_TEXT.UNPIN instead */
export const UI_CHAT_UNPIN = UI_CHAT_TEXT.UNPIN
/** @deprecated Use UI_CHAT_TEXT.DELETE instead */
export const UI_CHAT_DELETE = UI_CHAT_TEXT.DELETE
/** @deprecated Use UI_CHAT_TEXT.MESSAGE_PLACEHOLDER instead */
export const UI_CHAT_MESSAGE_PLACEHOLDER = UI_CHAT_TEXT.MESSAGE_PLACEHOLDER
/** @deprecated Use UI_CHAT_TEXT.SEND_ARIA instead */
export const UI_CHAT_SEND_ARIA = UI_CHAT_TEXT.SEND_ARIA
/** @deprecated Use UI_CHAT_TEXT.ATTACH_ARIA instead */
export const UI_CHAT_ATTACH_ARIA = UI_CHAT_TEXT.ATTACH_ARIA
/** @deprecated Use UI_CHAT_TEXT.CANCEL_REPLY_ARIA instead */
export const UI_CHAT_CANCEL_REPLY_ARIA = UI_CHAT_TEXT.CANCEL_REPLY_ARIA
/** @deprecated Use UI_CHAT_TEXT.SHOW_COMMANDS_ARIA instead */
export const UI_CHAT_SHOW_COMMANDS_ARIA = UI_CHAT_TEXT.SHOW_COMMANDS_ARIA
/** @deprecated Use UI_CHAT_TEXT.EMOJI_ARIA instead */
export const UI_CHAT_EMOJI_ARIA = UI_CHAT_TEXT.EMOJI_ARIA
/** @deprecated Use UI_CHAT_TEXT.FILE_SELECT_ARIA instead */
export const UI_CHAT_FILE_SELECT_ARIA = UI_CHAT_TEXT.FILE_SELECT_ARIA
/** @deprecated Use UI_CHAT_TEXT.SEARCH_ARIA instead */
export const UI_CHAT_SEARCH_ARIA = UI_CHAT_TEXT.SEARCH_ARIA
/** @deprecated Use UI_CHAT_TEXT.INFO_ARIA instead */
export const UI_CHAT_INFO_ARIA = UI_CHAT_TEXT.INFO_ARIA
/** @deprecated Use UI_CHAT_TEXT.DELETE_CONFIRM instead */
export const UI_CHAT_DELETE_CONFIRM = UI_CHAT_TEXT.DELETE_CONFIRM
/** @deprecated Use UI_CHAT_TEXT.REPLY_ARIA instead */
export const UI_CHAT_REPLY_ARIA = UI_CHAT_TEXT.REPLY_ARIA
/** @deprecated Use UI_CHAT_TEXT.SELECT_ARIA instead */
export const UI_CHAT_SELECT_ARIA = UI_CHAT_TEXT.SELECT_ARIA
/** @deprecated Use UI_CHAT_TEXT.TYPING_SUFFIX instead */
export const UI_CHAT_TYPING_SUFFIX = UI_CHAT_TEXT.TYPING_SUFFIX
/** @deprecated Use UI_CHAT_TEXT.TYPING_LABEL instead */
export const UI_CHAT_TYPING_LABEL = UI_CHAT_TEXT.TYPING_LABEL
/** @deprecated Use UI_CHAT_TEXT.SEARCH_CLOSE instead */
export const UI_CHAT_SEARCH_CLOSE = UI_CHAT_TEXT.SEARCH_CLOSE
/** @deprecated Use UI_CHAT_TEXT.PINNED_MESSAGE instead */
export const UI_CHAT_PINNED_MESSAGE = UI_CHAT_TEXT.PINNED_MESSAGE
/** @deprecated Use UI_CHAT_TEXT.PINNED_COUNTER instead */
export const UI_CHAT_PINNED_COUNTER = UI_CHAT_TEXT.PINNED_COUNTER
/** @deprecated Use UI_CHAT_TEXT.PREV_PINNED_ARIA instead */
export const UI_CHAT_PREV_PINNED_ARIA = UI_CHAT_TEXT.PREV_PINNED_ARIA
/** @deprecated Use UI_CHAT_TEXT.NEXT_PINNED_ARIA instead */
export const UI_CHAT_NEXT_PINNED_ARIA = UI_CHAT_TEXT.NEXT_PINNED_ARIA
/** @deprecated Use UI_CHAT_TEXT.UNPIN_ARIA instead */
export const UI_CHAT_UNPIN_ARIA = UI_CHAT_TEXT.UNPIN_ARIA
/** @deprecated Use UI_CHAT_TEXT.PHOTO instead */
export const UI_CHAT_PHOTO = UI_CHAT_TEXT.PHOTO
/** @deprecated Use UI_CHAT_TEXT.FILE instead */
export const UI_CHAT_FILE = UI_CHAT_TEXT.FILE
/** @deprecated Use UI_CHAT_TEXT.SELECTED_PREFIX instead */
export const UI_CHAT_SELECTED_PREFIX = UI_CHAT_TEXT.SELECTED_PREFIX
/** @deprecated Use UI_CHAT_TEXT.FORWARD instead */
export const UI_CHAT_FORWARD = UI_CHAT_TEXT.FORWARD
/** @deprecated Use UI_CHAT_TEXT.CANCEL instead */
export const UI_CHAT_CANCEL = UI_CHAT_TEXT.CANCEL
/** @deprecated Use UI_CHAT_TEXT.WRITE_MESSAGE instead */
export const UI_CHAT_WRITE_MESSAGE = UI_CHAT_TEXT.WRITE_MESSAGE
/** @deprecated Use UI_CHAT_TEXT.ROLE instead */
export const UI_CHAT_ROLE = UI_CHAT_TEXT.ROLE
/** @deprecated Use UI_CHAT_TEXT.WARNINGS instead */
export const UI_CHAT_WARNINGS = UI_CHAT_TEXT.WARNINGS
/** @deprecated Use UI_CHAT_TEXT.BACK_TO_LIST instead */
export const UI_CHAT_BACK_TO_LIST = UI_CHAT_TEXT.BACK_TO_LIST
/** @deprecated Use UI_CHAT_TEXT.NO_MEDIA instead */
export const UI_CHAT_NO_MEDIA = UI_CHAT_TEXT.NO_MEDIA
/** @deprecated Use UI_CHAT_TEXT.NO_FILES instead */
export const UI_CHAT_NO_FILES = UI_CHAT_TEXT.NO_FILES
/** @deprecated Use UI_CHAT_TEXT.NO_LINKS instead */
export const UI_CHAT_NO_LINKS = UI_CHAT_TEXT.NO_LINKS
/** @deprecated Use UI_CHAT_TEXT.PROFILE instead */
export const UI_CHAT_PROFILE = UI_CHAT_TEXT.PROFILE
/** @deprecated Use UI_CHAT_TEXT.INFORMATION instead */
export const UI_CHAT_INFORMATION = UI_CHAT_TEXT.INFORMATION
/** @deprecated Use UI_CHAT_TEXT.PARTICIPANTS instead */
export const UI_CHAT_PARTICIPANTS = UI_CHAT_TEXT.PARTICIPANTS
/** @deprecated Use UI_CHAT_TEXT.INFO_TAB instead */
export const UI_CHAT_INFO_TAB = UI_CHAT_TEXT.INFO_TAB
/** @deprecated Use UI_CHAT_TEXT.MEDIA_TAB instead */
export const UI_CHAT_MEDIA_TAB = UI_CHAT_TEXT.MEDIA_TAB
/** @deprecated Use UI_CHAT_TEXT.FILES_TAB instead */
export const UI_CHAT_FILES_TAB = UI_CHAT_TEXT.FILES_TAB
/** @deprecated Use UI_CHAT_TEXT.LINKS_TAB instead */
export const UI_CHAT_LINKS_TAB = UI_CHAT_TEXT.LINKS_TAB
/** @deprecated Use UI_CHAT_TEXT.DEMOTE instead */
export const UI_CHAT_DEMOTE = UI_CHAT_TEXT.DEMOTE
/** @deprecated Use UI_CHAT_TEXT.MAKE_ADMIN instead */
export const UI_CHAT_MAKE_ADMIN = UI_CHAT_TEXT.MAKE_ADMIN
/** @deprecated Use UI_CHAT_TEXT.EXCLUDE instead */
export const UI_CHAT_EXCLUDE = UI_CHAT_TEXT.EXCLUDE
/** @deprecated Use UI_CHAT_TEXT.BAN instead */
export const UI_CHAT_BAN = UI_CHAT_TEXT.BAN
/** @deprecated Use UI_CHAT_TEXT.PHONE instead */
export const UI_CHAT_PHONE = UI_CHAT_TEXT.PHONE
/** @deprecated Use UI_CHAT_TEXT.VIOLATION instead */
export const UI_CHAT_VIOLATION = UI_CHAT_TEXT.VIOLATION
/** @deprecated Use UI_CHAT_TEXT.CLOSE_PANEL instead */
export const UI_CHAT_CLOSE_PANEL = UI_CHAT_TEXT.CLOSE_PANEL
/** @deprecated Use UI_CHAT_TEXT.PARTICIPANTS_SUFFIX instead */
export const UI_CHAT_PARTICIPANTS_SUFFIX = UI_CHAT_TEXT.PARTICIPANTS_SUFFIX
/** @deprecated Use UI_CHAT_TEXT.PARTICIPANTS_TITLE instead */
export const UI_CHAT_PARTICIPANTS_TITLE = UI_CHAT_TEXT.PARTICIPANTS_TITLE
/** @deprecated Use UI_CHAT_TEXT.MEMBER_ACTIONS instead */
export const UI_CHAT_MEMBER_ACTIONS = UI_CHAT_TEXT.MEMBER_ACTIONS
/** @deprecated Use UI_CHAT_TEXT.DOWNLOAD_IMAGE instead */
export const UI_CHAT_DOWNLOAD_IMAGE = UI_CHAT_TEXT.DOWNLOAD_IMAGE
/** @deprecated Use UI_CHAT_TEXT.DOWNLOAD_FILE instead */
export const UI_CHAT_DOWNLOAD_FILE = UI_CHAT_TEXT.DOWNLOAD_FILE
/** @deprecated Use UI_CHAT_TEXT.ADD_REACTION instead */
export const UI_CHAT_ADD_REACTION = UI_CHAT_TEXT.ADD_REACTION
/** @deprecated Use UI_CHAT_TEXT.MESSAGE_INPUT instead */
export const UI_CHAT_MESSAGE_INPUT = UI_CHAT_TEXT.MESSAGE_INPUT
/** @deprecated Use UI_CHAT_TEXT.QUICK_REPLY instead */
export const UI_CHAT_QUICK_REPLY = UI_CHAT_TEXT.QUICK_REPLY
/** @deprecated Use UI_CHAT_TEXT.REMOVE_ATTACHMENT instead */
export const UI_CHAT_REMOVE_ATTACHMENT = UI_CHAT_TEXT.REMOVE_ATTACHMENT
/** @deprecated Use UI_CHAT_TEXT.INSERT_EMOJI instead */
export const UI_CHAT_INSERT_EMOJI = UI_CHAT_TEXT.INSERT_EMOJI
/** @deprecated Use UI_CHAT_TEXT.ADMIN instead */
export const UI_CHAT_ADMIN = UI_CHAT_TEXT.ADMIN
/** @deprecated Use UI_CHAT_TEXT.MEMBER instead */
export const UI_CHAT_MEMBER = UI_CHAT_TEXT.MEMBER
/** @deprecated Use UI_CHAT_TEXT.ONLINE instead */
export const UI_CHAT_ONLINE = UI_CHAT_TEXT.ONLINE
/** @deprecated Use UI_CHAT_TEXT.OFFLINE instead */
export const UI_CHAT_OFFLINE = UI_CHAT_TEXT.OFFLINE
/** @deprecated Use UI_CHAT_TEXT.DEMO_GROUP_DESCRIPTION instead */
export const UI_CHAT_DEMO_GROUP_DESCRIPTION = UI_CHAT_TEXT.DEMO_GROUP_DESCRIPTION
/** @deprecated Use UI_CHAT_TEXT.DEMO_PROFILE_DESCRIPTION instead */
export const UI_CHAT_DEMO_PROFILE_DESCRIPTION = UI_CHAT_TEXT.DEMO_PROFILE_DESCRIPTION
/** @deprecated Use UI_CHAT_TEXT.DEMO_PHONE instead */
export const UI_CHAT_DEMO_PHONE = UI_CHAT_TEXT.DEMO_PHONE
/** @deprecated Use UI_CHAT_TEXT.DEMO_EMAIL instead */
export const UI_CHAT_DEMO_EMAIL = UI_CHAT_TEXT.DEMO_EMAIL

// UI_EDITOR
/** @deprecated Use UI_EDITOR.BOLD instead */
export const UI_EDITOR_BOLD = UI_EDITOR.BOLD
/** @deprecated Use UI_EDITOR.ITALIC instead */
export const UI_EDITOR_ITALIC = UI_EDITOR.ITALIC
/** @deprecated Use UI_EDITOR.UNDERLINE instead */
export const UI_EDITOR_UNDERLINE = UI_EDITOR.UNDERLINE
/** @deprecated Use UI_EDITOR.STRIKETHROUGH instead */
export const UI_EDITOR_STRIKETHROUGH = UI_EDITOR.STRIKETHROUGH
/** @deprecated Use UI_EDITOR.TEXT_COLOR instead */
export const UI_EDITOR_TEXT_COLOR = UI_EDITOR.TEXT_COLOR
/** @deprecated Use UI_EDITOR.TEXT_COLOR_RESET instead */
export const UI_EDITOR_TEXT_COLOR_RESET = UI_EDITOR.TEXT_COLOR_RESET
/** @deprecated Use UI_EDITOR.BG_COLOR instead */
export const UI_EDITOR_BG_COLOR = UI_EDITOR.BG_COLOR
/** @deprecated Use UI_EDITOR.BG_COLOR_RESET instead */
export const UI_EDITOR_BG_COLOR_RESET = UI_EDITOR.BG_COLOR_RESET
/** @deprecated Use UI_EDITOR.ALIGN_LEFT instead */
export const UI_EDITOR_ALIGN_LEFT = UI_EDITOR.ALIGN_LEFT
/** @deprecated Use UI_EDITOR.ALIGN_CENTER instead */
export const UI_EDITOR_ALIGN_CENTER = UI_EDITOR.ALIGN_CENTER
/** @deprecated Use UI_EDITOR.ALIGN_RIGHT instead */
export const UI_EDITOR_ALIGN_RIGHT = UI_EDITOR.ALIGN_RIGHT
/** @deprecated Use UI_EDITOR.ALIGN_JUSTIFY instead */
export const UI_EDITOR_ALIGN_JUSTIFY = UI_EDITOR.ALIGN_JUSTIFY
/** @deprecated Use UI_EDITOR.LIST_BULLET instead */
export const UI_EDITOR_LIST_BULLET = UI_EDITOR.LIST_BULLET
/** @deprecated Use UI_EDITOR.LIST_NUMBERED instead */
export const UI_EDITOR_LIST_NUMBERED = UI_EDITOR.LIST_NUMBERED
/** @deprecated Use UI_EDITOR.FORMAT instead */
export const UI_EDITOR_FORMAT = UI_EDITOR.FORMAT
/** @deprecated Use UI_EDITOR.LINK instead */
export const UI_EDITOR_LINK = UI_EDITOR.LINK
/** @deprecated Use UI_EDITOR.IMAGE instead */
export const UI_EDITOR_IMAGE = UI_EDITOR.IMAGE
/** @deprecated Use UI_EDITOR.VIDEO instead */
export const UI_EDITOR_VIDEO = UI_EDITOR.VIDEO
/** @deprecated Use UI_EDITOR.QUOTE instead */
export const UI_EDITOR_QUOTE = UI_EDITOR.QUOTE
/** @deprecated Use UI_EDITOR.CODE_BLOCK instead */
export const UI_EDITOR_CODE_BLOCK = UI_EDITOR.CODE_BLOCK
/** @deprecated Use UI_EDITOR.CLEAR_FORMAT instead */
export const UI_EDITOR_CLEAR_FORMAT = UI_EDITOR.CLEAR_FORMAT
/** @deprecated Use UI_EDITOR.DIVIDER instead */
export const UI_EDITOR_DIVIDER = UI_EDITOR.DIVIDER
/** @deprecated Use UI_EDITOR.VISUAL_MODE instead */
export const UI_EDITOR_VISUAL_MODE = UI_EDITOR.VISUAL_MODE
/** @deprecated Use UI_EDITOR.CODE_MODE instead */
export const UI_EDITOR_CODE_MODE = UI_EDITOR.CODE_MODE
/** @deprecated Use UI_EDITOR.PARAGRAPH instead */
export const UI_EDITOR_PARAGRAPH = UI_EDITOR.PARAGRAPH
/** @deprecated Use UI_EDITOR.HEADING_PREFIX instead */
export const UI_EDITOR_HEADING_PREFIX = UI_EDITOR.HEADING_PREFIX
/** @deprecated Use UI_EDITOR.WIDTH instead */
export const UI_EDITOR_WIDTH = UI_EDITOR.WIDTH
/** @deprecated Use UI_EDITOR.HEIGHT instead */
export const UI_EDITOR_HEIGHT = UI_EDITOR.HEIGHT
/** @deprecated Use UI_EDITOR.APPLY instead */
export const UI_EDITOR_APPLY = UI_EDITOR.APPLY
/** @deprecated Use UI_EDITOR.DELETE instead */
export const UI_EDITOR_DELETE = UI_EDITOR.DELETE
/** @deprecated Use UI_EDITOR.URL_PROMPT instead */
export const UI_EDITOR_URL_PROMPT = UI_EDITOR.URL_PROMPT
/** @deprecated Use UI_EDITOR.DEFAULT_TEXT_COLOR instead */
export const UI_EDITOR_DEFAULT_TEXT_COLOR = UI_EDITOR.DEFAULT_TEXT_COLOR
/** @deprecated Use UI_EDITOR.DEFAULT_BG_COLOR instead */
export const UI_EDITOR_DEFAULT_BG_COLOR = UI_EDITOR.DEFAULT_BG_COLOR

// UI_COLOR_PICKER
/** @deprecated Use UI_COLOR_PICKER.SELECTED_COLOR instead */
export const UI_COLOR_PICKER_SELECTED_COLOR = UI_COLOR_PICKER.SELECTED_COLOR
/** @deprecated Use UI_COLOR_PICKER.SATURATION_BRIGHTNESS instead */
export const UI_COLOR_PICKER_SATURATION_BRIGHTNESS = UI_COLOR_PICKER.SATURATION_BRIGHTNESS
/** @deprecated Use UI_COLOR_PICKER.HUE instead */
export const UI_COLOR_PICKER_HUE = UI_COLOR_PICKER.HUE
/** @deprecated Use UI_COLOR_PICKER.HEX_VALUE instead */
export const UI_COLOR_PICKER_HEX_VALUE = UI_COLOR_PICKER.HEX_VALUE
/** @deprecated Use UI_COLOR_PICKER.PRESET instead */
export const UI_COLOR_PICKER_PRESET = UI_COLOR_PICKER.PRESET

// UI_RATING
/** @deprecated Use UI_RATING.ARIA_PREFIX instead */
export const UI_RATING_ARIA_PREFIX = UI_RATING.ARIA_PREFIX

// UI_CHAT_TEXT (new)
/** @deprecated Use UI_CHAT_TEXT.SEARCH_PLACEHOLDER instead */
export const UI_CHAT_SEARCH_PLACEHOLDER = UI_CHAT_TEXT.SEARCH_PLACEHOLDER
/** @deprecated Use UI_CHAT_TEXT.DELETE_SINGLE_CONFIRM instead */
export const UI_CHAT_DELETE_SINGLE_CONFIRM = UI_CHAT_TEXT.DELETE_SINGLE_CONFIRM
/** @deprecated Use UI_CHAT_TEXT.DELETE_MULTI_CONFIRM instead */
export const UI_CHAT_DELETE_MULTI_CONFIRM = UI_CHAT_TEXT.DELETE_MULTI_CONFIRM
