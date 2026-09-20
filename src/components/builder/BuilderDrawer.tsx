import { useMemo, useState } from 'react'
import type { Breakpoint } from '../../lib/breakpoints'
import type { FxKind } from '../../lib/noise'
import type { FontKind, LayoutConfig, LayoutEntry, PaperRadius, TextTransform } from '../../lib/layout'
import { useBuilder } from './builderContext'
import { CheckField, NumField, Row, TextArea, TextInput, inputCls } from './fields'

const breakpoints: Breakpoint[] = ['desktop', 'laptop', 'tablet', 'mobile']
const shadowOptions = ['none', 'pinned', 'card', 'lifted']
const fxOptions: FxKind[] = ['noise', 'torn']
const typeOptions: LayoutEntry['type'][] = ['text', 'note', 'paper', 'tape', 'photo', 'sticker', 'graffiti', 'name-card', 'section-label', 'tic-tac-toe', 'word']

function RadiusField({ radius, onChange }: { radius?: PaperRadius; onChange: (r: PaperRadius | undefined) => void }) {
  const mode = radius === 'none' ? 'none' : radius === 'full' ? 'full' : typeof radius === 'number' ? 'custom' : 'default'
  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        className={inputCls}
        value={mode}
        onChange={(e) => {
          const m = e.target.value
          if (m === 'none') onChange('none')
          else if (m === 'full') onChange('full')
          else if (m === 'default') onChange(undefined)
          else onChange(24)
        }}
      >
        <option value="default">small</option>
        <option value="none">none</option>
        <option value="full">full</option>
        <option value="custom">custom</option>
      </select>
      {mode === 'custom' && (
        <NumField value={typeof radius === 'number' ? radius : 24} onChange={(v) => onChange(v ?? 24)} />
      )}
    </div>
  )
}

export default function BuilderDrawer() {
  const {
    drawerOpen,
    setDrawerOpen,
    panel,
    data,
    selectedId,
    select,
    updateConfig,
    updateEntry,
    addEntry,
    removeEntry,
    undo,
    save,
    saveState,
  } = useBuilder()
  const [bp, setBp] = useState<Breakpoint>('desktop')

  const groups = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const id of Object.keys(data)) {
      const s = data[id]?.section ?? 'home'
      const list = map.get(s) ?? []
      list.push(id)
      map.set(s, list)
    }
    return [...map.entries()]
  }, [data])

  if (!drawerOpen) return null

  const ids = Object.keys(data)
  const entry = selectedId ? data[selectedId] : undefined

  const patch = (p: Partial<LayoutEntry>) => {
    if (entry && selectedId) updateEntry(selectedId, p)
  }

  const patchedNoise = (p: Partial<NonNullable<LayoutEntry['noise']>>) => {
    patch({ noise: { ...(entry?.noise ?? {}), ...p } })
  }

  const fx: FxKind[] = entry?.fx ?? []
  const toggleFx = (kind: FxKind) => {
    const next = fx.includes(kind) ? fx.filter((f) => f !== kind) : [...fx, kind]
    patch({ fx: next.length ? next : undefined })
  }

  const cfgFor = (b: Breakpoint, e: LayoutEntry): LayoutConfig => e[b] ?? e.desktop
  const setCfg = (b: Breakpoint, p: Partial<LayoutConfig>) => {
    if (selectedId) updateConfig(selectedId, b, p)
  }

  const openPopup = () => {
    if (typeof BroadcastChannel === 'undefined') {
      window.alert('BroadcastChannel is not supported in this browser')
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set('panel', 'builder')
    window.open(url.toString(), 'pt-builder-panel', 'popup=yes,width=420,height=760')
  }

  return (
    <div
      className={
        panel
          ? 'flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-slate-100'
          : 'fixed inset-y-0 right-0 z-[999] flex w-[24rem] max-w-[92vw] flex-col border-l-2 border-amber-400/40 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur'
      }
    >
      <header className="flex items-center justify-between border-b border-amber-400/20 px-4 py-2">
        <span className="font-mono text-sm font-bold uppercase tracking-widest text-amber-300">Builder</span>
        <div className="flex items-center gap-1">
          {!panel && (
            <button
              onClick={openPopup}
              title="Open builder in a separate window"
              className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              ⧉
            </button>
          )}
          <button
            onClick={panel ? () => window.close() : () => setDrawerOpen(false)}
            className="rounded px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            {panel ? 'Close ✕' : 'Esc ✕'}
          </button>
        </div>
      </header>

      <div className="max-h-40 overflow-y-auto border-b border-amber-400/20 px-4 py-2">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wider text-amber-200/60">Elements</span>
          <button
            onClick={() => addEntry(entry?.section)}
            title={entry ? `Add to section "${entry.section}"` : 'Add to "home"'}
            className="ml-auto rounded border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 hover:bg-amber-400/10"
          >
            + NEW
          </button>
        </div>
        <div className="space-y-2">
          {groups.map(([section, sectionIds]) => (
            <div key={section}>
              <button
                onClick={() => {
                  if (sectionIds.includes(selectedId ?? '')) return
                  select(sectionIds[0])
                }}
                className="text-[10px] font-bold uppercase tracking-wider text-amber-200/50 hover:text-amber-200/80"
              >
                {section}
              </button>
              <div className="mt-1 flex flex-wrap gap-1">
                {sectionIds.map((id) => (
                  <button
                    key={id}
                    onClick={() => select(id)}
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${selectedId === id ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-amber-200/60">Element</span>
              <button
                onClick={() => {
                  if (selectedId && window.confirm(`Delete "${selectedId}"?`)) removeEntry(selectedId)
                }}
                className="text-[10px] text-red-400 hover:text-red-300"
              >
                delete
              </button>
            </div>
            <div className="truncate rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-xs text-slate-300">
              {selectedId}
            </div>
            <Row label="Section">
              <TextInput value={entry.section} onChange={(v) => patch({ section: v })} />
            </Row>
            <Row label="Type">
              <select
                className={inputCls}
                value={entry.type ?? 'text'}
                onChange={(e) => patch({ type: e.target.value as LayoutEntry['type'] })}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Row>
            <Row label="Anchor">
              <input
                className={inputCls}
                list="builder-anchors"
                value={entry.anchor ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  patch({ anchor: v === '' ? undefined : v })
                }}
              />
              <datalist id="builder-anchors">
                {ids
                  .filter((id) => id !== selectedId)
                  .map((id) => (
                    <option key={id} value={id} />
                  ))}
              </datalist>
            </Row>
            <div className="flex flex-wrap gap-4">
              <CheckField
                label="Hide on mobile"
                checked={entry.hideOnMobile === true}
                onChange={(v) => patch({ hideOnMobile: v || undefined })}
              />
              <CheckField
                label="Hide on tablet"
                checked={entry.hideOnTablet === true}
                onChange={(v) => patch({ hideOnTablet: v || undefined })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-amber-200/60">Content</span>
            {(entry.type === 'text' || entry.type === 'note' || entry.type === 'graffiti' || entry.type === 'section-label') && (
              <Row label="Content">
                <TextArea value={entry.content} onChange={(v) => patch({ content: v })} />
              </Row>
            )}
            {(entry.type === 'sticker' || entry.type === 'photo') && (
              <Row label="Src">
                <TextInput value={entry.src} placeholder="url or asset path" onChange={(v) => patch({ src: v })} />
              </Row>
            )}
            {entry.type === 'graffiti' && (
              <Row label="Fill color">
                <TextInput value={entry.fill} onChange={(v) => patch({ fill: v })} />
              </Row>
            )}
            {entry.type === 'section-label' && (
              <Row label="Fill (label bg)">
                <TextInput value={entry.fill} placeholder="amber-100 / hex / rgba" onChange={(v) => patch({ fill: v })} />
              </Row>
            )}
            {(entry.type === 'text' || entry.type === 'section-label') && (
              <Row label="Color">
                <TextInput value={entry.color} placeholder="amber-100 / hex / rgba" onChange={(v) => patch({ color: v })} />
              </Row>
            )}
            {(entry.type === 'text' || entry.type === 'paper' || entry.type === 'tape') && (
              <div className="grid grid-cols-2 gap-2">
                <Row label="Width px">
                  <NumField value={entry.width} onChange={(v) => patch({ width: v })} />
                </Row>
                {(entry.type === 'paper' || entry.type === 'tape') && (
                  <Row label="Height px">
                    <NumField value={entry.height} onChange={(v) => patch({ height: v })} />
                  </Row>
                )}
              </div>
            )}
            {(entry.type === 'paper' || entry.type === 'tape' || entry.type === 'section-label') && (
              <Row label="Corner radius">
                <RadiusField radius={entry.radius} onChange={(r) => patch({ radius: r })} />
              </Row>
            )}
            {entry.type === 'section-label' && (
              <Row label="Width px">
                <NumField value={entry.width} onChange={(v) => patch({ width: v })} />
              </Row>
            )}
            {entry.type === 'text' || entry.type === 'section-label' ? (
              <>
                {entry.type === 'text' && (
                  <Row label="Font">
                    <select
                      className={inputCls}
                      value={entry.font ?? 'geist'}
                      onChange={(e) => patch({ font: e.target.value as FontKind })}
                    >
                      <option value="geist">geist</option>
                      <option value="playpen">playpen</option>
                    </select>
                  </Row>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <Row label="Weight">
                    <NumField value={entry.weight} step={100} onChange={(v) => patch({ weight: v })} />
                  </Row>
                  <Row label="Transform">
                    <select
                      className={inputCls}
                      value={entry.textTransform ?? 'none'}
                      onChange={(e) => patch({ textTransform: e.target.value as TextTransform })}
                    >
                      {(['none', 'uppercase', 'lowercase', 'capitalize'] as const).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </Row>
                </div>
                {entry.type === 'section-label' && (
                  <Row label="Font size px">
                    <NumField value={entry.fontSize} onChange={(v) => patch({ fontSize: v })} />
                  </Row>
                )}
              </>
            ) : null}
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-amber-200/60">Effects</span>
            <div className="flex gap-4">
              {entry.type === 'tape' ? (
                <CheckField label="noise" checked={fx.includes('noise')} onChange={() => toggleFx('noise')} />
              ) : (
                fxOptions.map((k) => (
                  <CheckField key={k} label={k} checked={fx.includes(k)} onChange={() => toggleFx(k)} />
                ))
              )}
            </div>
            {fx.includes('noise') && (
              <div className="grid grid-cols-2 gap-2 rounded border border-amber-400/20 p-2">
                <Row label="Size">
                  <NumField value={entry.noise?.size} onChange={(v) => patchedNoise({ size: v })} />
                </Row>
                <Row label="Density">
                  <NumField value={entry.noise?.density} onChange={(v) => patchedNoise({ density: v })} />
                </Row>
                <Row label="Seed">
                  <NumField value={entry.noise?.seed} onChange={(v) => patchedNoise({ seed: v })} />
                </Row>
                <Row label="Rough">
                  <NumField value={entry.noise?.rough} onChange={(v) => patchedNoise({ rough: v })} />
                </Row>
                <div className="col-span-2">
                  <Row label="Noise color">
                    <TextInput
                      value={entry.noise?.color}
                      placeholder="rgba(0,0,0,0.25)"
                      onChange={(v) => patchedNoise({ color: v })}
                    />
                  </Row>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] uppercase tracking-wider text-amber-200/60">Position</span>
              {breakpoints.map((b) => (
                <button
                  key={b}
                  onClick={() => setBp(b)}
                  className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${bp === b ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  {b}
                </button>
              ))}
            </div>
            {bp !== 'desktop' && !entry[bp] && (
              <p className="text-[10px] text-slate-400">uses desktop values — editing creates a {bp} override</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Row label={entry.anchor ? `x (% of parent)` : 'x (% center)'}>
                <NumField value={cfgFor(bp, entry).x} onChange={(v) => setCfg(bp, { x: v ?? cfgFor(bp, entry).x })} />
              </Row>
              <Row label={entry.anchor ? 'y (% of parent)' : 'y (px)'}>
                <NumField value={cfgFor(bp, entry).y} onChange={(v) => setCfg(bp, { y: v ?? cfgFor(bp, entry).y })} />
              </Row>
              <Row label="Rotate °">
                <NumField value={cfgFor(bp, entry).rotate} onChange={(v) => setCfg(bp, { rotate: v ?? 0 })} />
              </Row>
              <Row label="Scale">
                <NumField value={cfgFor(bp, entry).scale} step={0.05} onChange={(v) => setCfg(bp, { scale: v ?? 1 })} />
              </Row>
              <Row label="Z">
                <NumField value={cfgFor(bp, entry).z} onChange={(v) => setCfg(bp, { z: v ?? 1 })} />
              </Row>
              <Row label="Shadow">
                <select
                  className={inputCls}
                  value={cfgFor(bp, entry).shadow ?? 'none'}
                  onChange={(e) =>
                    setCfg(bp, { shadow: e.target.value === 'none' ? undefined : e.target.value })
                  }
                >
                  {shadowOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Row>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 py-6 text-xs text-slate-400">
          {panel && ids.length === 0
            ? 'Waiting for main window…'
            : 'Click an element on the page (or a chip above) to edit its properties.'}
        </div>
      )}

      <footer className="flex items-center gap-2 border-t border-amber-400/20 px-4 py-2">
        <button
          onClick={undo}
          className="rounded border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-300 hover:bg-amber-400/10"
        >
          ↶ Undo
        </button>
        <button
          onClick={save}
          className="rounded bg-amber-400 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-amber-300"
        >
          Save
        </button>
        <span className="text-[10px] text-slate-400">
          {saveState === 'saved' ? 'saved ✓' : saveState === 'saving' ? 'saving…' : saveState === 'error' ? 'save failed' : 'Ctrl+S'}
        </span>
      </footer>
    </div>
  )
}