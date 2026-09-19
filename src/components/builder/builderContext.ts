import { createContext, useContext } from 'react'
import type { Breakpoint } from '../../lib/breakpoints'
import type { LayoutConfig, LayoutData, LayoutEntry } from '../../lib/layout'
import layoutData from '../../data/layout.json'

const staticData = layoutData as LayoutData

export interface MutationOpts {
  silent?: boolean
}

export interface DragSession {
  id: string
  bp: Breakpoint
  x: number
  y: number
}

export interface BuilderApi {
  editing: boolean
  panel: boolean
  data: LayoutData
  selectedId: string | null
  select: (id: string) => void
  clearSelection: () => void
  updateConfig: (id: string, bp: Breakpoint, patch: Partial<LayoutConfig>, opts?: MutationOpts) => void
  updateEntry: (id: string, patch: Partial<LayoutEntry>, opts?: MutationOpts) => void
  addEntry: (section?: string) => string
  removeEntry: (id: string) => void
  undo: () => void
  beginDrag: (session: DragSession) => void
  endDrag: () => void
  dragSession: DragSession | null
  drawerOpen: boolean
  setDrawerOpen: (open: boolean) => void
  toggleDrawer: () => void
  save: () => void
  saveState: 'idle' | 'saving' | 'saved' | 'error'
}

const noop = () => {}

const defaultApi: BuilderApi = {
  editing: false,
  panel: false,
  data: staticData,
  selectedId: null,
  select: noop,
  clearSelection: noop,
  updateConfig: noop,
  updateEntry: noop,
  addEntry: () => '',
  removeEntry: noop,
  undo: noop,
  beginDrag: noop,
  endDrag: noop,
  dragSession: null,
  drawerOpen: false,
  setDrawerOpen: noop,
  toggleDrawer: noop,
  save: noop,
  saveState: 'idle',
}

export const BuilderContext = createContext<BuilderApi>(defaultApi)

export function useBuilder() {
  return useContext(BuilderContext)
}