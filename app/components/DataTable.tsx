'use client'
import React, { useState } from 'react'

type Column<T> = { key: keyof T; label: string }

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
}: {
  data: T[]
  columns: Column<T>[]
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [asc, setAsc] = useState(true)

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey]
        const bv = b[sortKey]
        if (av === bv) return 0
        if (av > bv) return asc ? 1 : -1
        return asc ? -1 : 1
      })
    : data

  function toggle(col: keyof T) {
    if (sortKey === col) setAsc(!asc)
    else { setSortKey(col); setAsc(true) }
  }

  return (
    <table>
      <thead>
        <tr>
          {columns.map(c => (
            <th key={String(c.key)} onClick={() => toggle(c.key)} style={{ cursor:'pointer' }}>
              {c.label} {sortKey===c.key ? (asc?'▲':'▼') : ''}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={i}>
            {columns.map(c => (
              <td key={String(c.key)}>{String(row[c.key] ?? '')}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
