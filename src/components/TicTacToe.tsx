import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { LayoutEntry } from '../lib/layout'
import './TicTacToe.css'

type Player = 'chicken' | 'egg'
type CellState = Player | null

const EMPTY: CellState[] = [null, null, null, null, null, null, null, null, null]

const EMOJI: Record<Player, string> = { chicken: '🐔', egg: '🥚' }

const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

const MSG_CHICKEN = 'The chicken came first!'
const MSG_EGG = 'The egg came first!'
const MSG_TIE = 'Still undecided, apparently.'

const AI_BLUNDER = 0.35

type GameResult =
  | { winner: Player; line: number[] }
  | { winner: 'tie'; line: [] }
  | { winner: null; line: [] }

function checkWinner(cells: CellState[]): GameResult {
  for (const line of LINES) {
    const [a, b, c] = line
    if (cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a] as Player, line }
    }
  }
  if (cells.every((c) => c !== null)) return { winner: 'tie', line: [] }
  return { winner: null, line: [] }
}

function search(cells: CellState[], mover: CellState, depth: number): number {
  const result = checkWinner(cells)
  if (result.winner === 'egg') return 10 - depth
  if (result.winner === 'chicken') return depth - 10
  if (result.winner === 'tie') return 0

  if (mover === 'egg') {
    let best = -Infinity
    for (let i = 0; i < 9; i++) {
      if (cells[i] === null) {
        cells[i] = 'egg'
        best = Math.max(best, search(cells, 'chicken', depth + 1))
        cells[i] = null
      }
    }
    return best
  }

  let best = Infinity
  for (let i = 0; i < 9; i++) {
    if (cells[i] === null) {
      cells[i] = 'chicken'
      best = Math.min(best, search(cells, 'egg', depth + 1))
      cells[i] = null
    }
  }
  return best
}

function emptyIndexes(cells: CellState[]): number[] {
  const out: number[] = []
  for (let i = 0; i < 9; i++) if (cells[i] === null) out.push(i)
  return out
}

function aiMove(cells: CellState[]): number {
  const legal = emptyIndexes(cells)
  if (legal.length === 0) return -1
  if (Math.random() < AI_BLUNDER) return legal[Math.floor(Math.random() * legal.length)]

  let bestScore = -Infinity
  let bestMoves: number[] = []
  for (const i of legal) {
    cells[i] = 'egg'
    const score = search(cells, 'chicken', 1)
    cells[i] = null
    if (score > bestScore) {
      bestScore = score
      bestMoves = [i]
    } else if (score === bestScore) {
      bestMoves.push(i)
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)]
}

export default function TicTacToe({
  entry,
  shadow,
  filterStyle,
}: {
  entry: LayoutEntry
  shadow: string
  filterStyle: CSSProperties
}) {
  const [cells, setCells] = useState<CellState[]>(EMPTY)
  const [turn, setTurn] = useState<Player>('chicken')

  const game = checkWinner(cells)
  const over = game.winner !== null
  const thinking = turn === 'egg' && !over
  const winLine = game.winner !== null && game.winner !== 'tie' ? game.line : []

  useEffect(() => {
    if (!thinking) return
    const t = window.setTimeout(() => {
      setCells((prev) => {
        const move = aiMove(prev)
        if (move < 0) return prev
        const next = [...prev]
        next[move] = 'egg'
        return next
      })
      setTurn('chicken')
    }, 350)
    return () => window.clearTimeout(t)
  }, [thinking])

  const onCell = (i: number) => {
    if (over || thinking || turn !== 'chicken' || cells[i] !== null) return
    const next = [...cells]
    next[i] = 'chicken'
    setCells(next)
    setTurn('egg')
  }

  const reset = () => {
    setCells(EMPTY)
    setTurn('chicken')
  }

  const stopDrag = (e: React.PointerEvent<HTMLElement>) => e.stopPropagation()

  const filter = filterStyle.filter

  let message: string
  if (game.winner === 'chicken') message = MSG_CHICKEN
  else if (game.winner === 'egg') message = MSG_EGG
  else if (game.winner === 'tie') message = MSG_TIE
  else message = turn === 'chicken' ? 'Your move — pick a square' : 'Egg is thinking…'

  return (
    <div className="tic-tac-toe" style={{ width: entry.width, height: entry.height }}>
      <div
        className="tic-tac-toe__bg"
        style={{ boxShadow: shadow, ...(filter ? { filter } : {}) }}
      />
      <div className="tic-tac-toe__inner">
        <h3 className="tic-tac-toe__title">Chicken vs Egg</h3>
        {!over && (
          <div className="tic-tac-toe__board">
          {cells.map((c, i) => (
            <button
              key={i}
              type="button"
              className={`tic-tac-toe__cell${winLine.includes(i) ? ' tic-tac-toe__cell--hit' : ''}`}
              aria-label={c ?? `empty cell ${i + 1}`}
              disabled={over || thinking || turn !== 'chicken' || c !== null}
              onPointerDown={stopDrag}
              onClick={() => onCell(i)}
            >
              {c ? EMOJI[c] : ''}
            </button>
          ))}
        </div>
        )}
        <p className="tic-tac-toe__status">{message}</p>
        {over && (
          <button type="button" className="tic-tac-toe__replay" onPointerDown={stopDrag} onClick={reset}>
            ↺ play again
          </button>
        )}
      </div>
    </div>
  )
}