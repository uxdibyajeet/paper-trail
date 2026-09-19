import type { Breakpoint } from '../../lib/breakpoints'
import type { LayoutConfig, LayoutData, LayoutEntry } from '../../lib/layout'
import type { BuilderApi } from './builderContext'

export const BUILDER_CHANNEL = 'pt-builder-v1'

export type BuilderAction =
  | { type: 'hello' }
  | { type: 'select'; id: string | null }
  | { type: 'updateConfig'; id: string; bp: Breakpoint; patch: Partial<LayoutConfig> }
  | { type: 'updateEntry'; id: string; patch: Partial<LayoutEntry> }
  | { type: 'addEntry'; section?: string }
  | { type: 'removeEntry'; id: string }
  | { type: 'undo' }
  | { type: 'save' }

export interface BuilderStateMessage {
  type: 'state'
  data: LayoutData
  selectedId: string | null
  saveState: BuilderApi['saveState']
}