import { describeLibraryModel } from '../../libraryChecks'
import { buildScales } from '../../../../models/library/edge/scales'

describeLibraryModel('scales', buildScales, { parts: ['body', 'accent', 'detail', 'metal'], animations: ['flow'], anchorY: 1.16 })
