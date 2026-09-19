import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Breakpoint } from '../../lib/breakpoints'
import type { LayoutConfig, LayoutData, LayoutEntry } from '../../lib/layout'
import layoutData from '../../data/layout.json'
import { BUILDER_CHANNEL } from './channel'
import type { BuilderAction, BuilderStateMessage } from './channel'
import { BuilderContext } from './builderContext'
import type { BuilderApi, DragSession, MutationOpts } from './builderContext'

const staticData = layoutData as LayoutData
const emptyData: LayoutData = {}
const HISTORY_LIMIT = 100
const noop = () => {}

interface Mirror {
  data: LayoutData
  selectedId: string | null
  saveState: BuilderApi['saveState']
}

export function BuilderProvider({
  children,
  panelMode = false,
}: {
  children: ReactNode
  panelMode?: boolean
}) {
  const [data, setData] = useState<LayoutData>(() => JSON.parse(JSON.stringify(staticData)) as LayoutData)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saveState, setSaveState] = useState<BuilderApi['saveState']>('idle')
  const [dragSession, setDragSession] = useState<DragSession | null>(null)
  const [mirror, setMirror] = useState<Mirror | null>(null)

  const dataRef = useRef(data)
  const stateRef = useRef({ data, selectedId, saveState })
  const dragSessionRef = useRef<DragSession | null>(null)
  const historyRef = useRef<LayoutData[]>([])
  const pendingRef = useRef<LayoutData | null>(null)
  const flushRef = useRef<number | undefined>(undefined)
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    dataRef.current = data
    stateRef.current = { data, selectedId, saveState }
  }, [data, selectedId, saveState])

  const commitPending = useCallback(() => {
    window.clearTimeout(flushRef.current)
    flushRef.current = undefined
    if (pendingRef.current) {
      historyRef.current = [pendingRef.current, ...historyRef.current].slice(0, HISTORY_LIMIT)
      pendingRef.current = null
    }
  }, [])

  const snapshot = useCallback(() => {
    if (!pendingRef.current) pendingRef.current = JSON.parse(JSON.stringify(dataRef.current)) as LayoutData
    window.clearTimeout(flushRef.current)
    flushRef.current = window.setTimeout(commitPending, 250)
  }, [commitPending])

  const undo = useCallback(() => {
    commitPending()
    if (historyRef.current.length === 0) return
    const prev = historyRef.current[0]
    historyRef.current = historyRef.current.slice(1)
    setData(prev)
  }, [commitPending])

  const select = useCallback((id: string | null) => setSelectedId(id), [])
  const clearSelection = useCallback(() => setSelectedId(null), [])

  const updateConfig = useCallback(
    (id: string, bp: Breakpoint, patch: Partial<LayoutConfig>, opts?: MutationOpts) => {
      if (!opts?.silent) snapshot()
      setData((prev) => {
        const entry = prev[id]
        if (!entry) return prev
        const current = entry[bp] ?? { ...entry.desktop }
        const next = { ...entry, [bp]: { ...current, ...patch } } as LayoutEntry
        return { ...prev, [id]: next }
      })
    },
    [snapshot],
  )

  const updateEntry = useCallback(
    (id: string, patch: Partial<LayoutEntry>, opts?: MutationOpts) => {
      if (!opts?.silent) snapshot()
      setData((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], ...patch } } : prev))
    },
    [snapshot],
  )

  const addEntry = useCallback(
    (section: string = 'home'): string => {
      snapshot()
      let n = 1
      let id = 'element-1'
      const current = dataRef.current
      while (id in current) {
        n += 1
        id = `element-${n}`
      }
      const entry: LayoutEntry = {
        section,
        type: 'text',
        content: 'New',
        desktop: { x: 50, y: 50, rotate: 0, scale: 1, z: 1 },
      }
      setData((prev) => ({ ...prev, [id]: entry }))
      setSelectedId(id)
      setDrawerOpen(true)
      return id
    },
    [snapshot],
  )

  const removeEntry = useCallback(
    (id: string) => {
      snapshot()
      setSelectedId((sel) => (sel === id ? null : sel))
      setData((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    },
    [snapshot],
  )

  const beginDrag = useCallback(
    (session: DragSession) => {
      snapshot()
      commitPending()
      dragSessionRef.current = session
      setDragSession(session)
    },
    [snapshot, commitPending],
  )

  const endDrag = useCallback(() => {
    dragSessionRef.current = null
    setDragSession(null)
  }, [])

  const cancelActiveDrag = useCallback(() => {
    const session = dragSessionRef.current
    if (session) updateConfig(session.id, session.bp, { x: session.x, y: session.y }, { silent: true })
    dragSessionRef.current = null
    setDragSession(null)
  }, [updateConfig])

  const toggleDrawer = useCallback(() => setDrawerOpen((o) => !o), [])

  const save = useCallback(() => {
    setSaveState('saving')
    fetch('/__layout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ layout: data }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('save failed')
        setSaveState('saved')
        window.setTimeout(() => setSaveState('idle'), 1600)
      })
      .catch(() => {
        setSaveState('error')
        window.setTimeout(() => setSaveState('idle'), 2000)
      })
  }, [data])

  const post = useCallback((msg: BuilderAction) => {
    channelRef.current?.postMessage(msg)
  }, [])

  const actionsRef = useRef({ select, updateConfig, updateEntry, addEntry, removeEntry, undo, save })

  useEffect(() => {
    actionsRef.current = { select, updateConfig, updateEntry, addEntry, removeEntry, undo, save }
  }, [select, updateConfig, updateEntry, addEntry, removeEntry, undo, save])

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel(BUILDER_CHANNEL)
    channelRef.current = channel

    if (panelMode) {
      channel.onmessage = (ev: MessageEvent) => {
        const msg = ev.data as BuilderAction | BuilderStateMessage
        if (msg && msg.type === 'state') {
          setMirror({ data: msg.data, selectedId: msg.selectedId, saveState: msg.saveState })
        }
      }
      channel.postMessage({ type: 'hello' } satisfies BuilderAction)
      const onFocus = () => channel.postMessage({ type: 'hello' } satisfies BuilderAction)
      window.addEventListener('focus', onFocus)
      return () => {
        window.removeEventListener('focus', onFocus)
        channel.close()
        channelRef.current = null
      }
    }

    channel.onmessage = (ev: MessageEvent) => {
      const msg = ev.data as BuilderAction | BuilderStateMessage
      if (!msg || typeof msg !== 'object' || msg.type === 'state') return
      const a = actionsRef.current
      switch (msg.type) {
        case 'hello':
          channel.postMessage({ type: 'state', ...stateRef.current } satisfies BuilderStateMessage)
          break
        case 'select':
          a.select(msg.id)
          break
        case 'updateConfig':
          a.updateConfig(msg.id, msg.bp, msg.patch)
          break
        case 'updateEntry':
          a.updateEntry(msg.id, msg.patch)
          break
        case 'addEntry':
          a.addEntry(msg.section)
          break
        case 'removeEntry':
          a.removeEntry(msg.id)
          break
        case 'undo':
          a.undo()
          break
        case 'save':
          a.save()
          break
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [panelMode])

  useEffect(() => {
    if (panelMode) return
    if (typeof BroadcastChannel === 'undefined') return
    channelRef.current?.postMessage({ type: 'state', data, selectedId, saveState } satisfies BuilderStateMessage)
  }, [panelMode, data, selectedId, saveState])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const inEditable =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        save()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (inEditable) return
        e.preventDefault()
        undo()
        return
      }
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (inEditable) return
        e.preventDefault()
        setDrawerOpen((o) => !o)
        return
      }
      if (e.key === 'Escape') {
        if (dragSessionRef.current) cancelActiveDrag()
        else setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [save, undo, cancelActiveDrag])

  const api = useMemo<BuilderApi>(() => {
    if (panelMode) {
      return {
        editing: true,
        panel: true,
        data: mirror?.data ?? emptyData,
        selectedId: mirror?.selectedId ?? null,
        select: (id) => post({ type: 'select', id }),
        clearSelection: () => post({ type: 'select', id: null }),
        updateConfig: (id, bp, patch) => post({ type: 'updateConfig', id, bp, patch }),
        updateEntry: (id, patch) => post({ type: 'updateEntry', id, patch }),
        addEntry: (section?: string) => {
          post({ type: 'addEntry', section })
          return ''
        },
        removeEntry: (id) => post({ type: 'removeEntry', id }),
        undo: () => post({ type: 'undo' }),
        beginDrag: noop,
        endDrag: noop,
        dragSession: null,
        drawerOpen: true,
        setDrawerOpen: noop,
        toggleDrawer: noop,
        save: () => post({ type: 'save' }),
        saveState: mirror?.saveState ?? 'idle',
      }
    }
    return {
      editing: true,
      panel: false,
      data,
      selectedId,
      select,
      clearSelection,
      updateConfig,
      updateEntry,
      addEntry,
      removeEntry,
      undo,
      beginDrag,
      endDrag,
      dragSession,
      drawerOpen,
      setDrawerOpen,
      toggleDrawer,
      save,
      saveState,
    }
  }, [
    panelMode,
    data,
    selectedId,
    mirror,
    select,
    clearSelection,
    updateConfig,
    updateEntry,
    addEntry,
    removeEntry,
    undo,
    beginDrag,
    endDrag,
    dragSession,
    drawerOpen,
    toggleDrawer,
    save,
    saveState,
    post,
  ])

  return <BuilderContext.Provider value={api}>{children}</BuilderContext.Provider>
}