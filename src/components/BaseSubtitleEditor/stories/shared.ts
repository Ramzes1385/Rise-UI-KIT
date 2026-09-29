import { parseSubtitles } from '@utils/subtitleUtils'
import demoSubtitles from '@components/BaseMediaPlayer/stories/media/demo.ru.vtt?raw'

export const DEMO_CUES = parseSubtitles(demoSubtitles)
