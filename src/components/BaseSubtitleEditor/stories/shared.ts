import { parseSubtitles } from '@utils/media/subtitleUtils'
import demoSubtitles from '@components/BaseMediaPlayer/stories/media/subtitles/demo.ru.vtt?raw'

export const DEMO_CUES = parseSubtitles(demoSubtitles)
