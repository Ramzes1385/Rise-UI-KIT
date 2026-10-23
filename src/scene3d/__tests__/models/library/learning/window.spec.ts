import { describeLibraryModel } from '../../libraryChecks'
import { buildWindow } from '../../../../models/library/learning/window'

describeLibraryModel('window', buildWindow, { parts: ['body', 'accent', 'detail', 'light'], animations: [], anchorY: 1.1 })
