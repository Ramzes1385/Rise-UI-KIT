import { inject } from 'vue'
import type { InjectionKey } from 'vue'
import type { MediaPlayerContext } from '../../types/BaseMediaPlayer.types'

export const PLAYER_CONTEXT_KEY: InjectionKey<MediaPlayerContext> = Symbol('BaseMediaPlayer')

export function usePlayerContext(): MediaPlayerContext {
	return inject(PLAYER_CONTEXT_KEY) as MediaPlayerContext
}
