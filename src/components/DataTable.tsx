// src/components/DataTable.tsx
'use client'
import React, { useState } from 'react'

type Props<T> = {
  data: T[]
  columns: { key: keyof T; label: string }[]
}

export function DataTable<T>({ data, columns }: Props<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [asc, setAsc] = useState(true)

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = a[sortKey] as any
        const vb = b[sortKey] as any
        return asc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
      })
    : data

  return (
    <table>
      <thead>
        <tr>
          {columns.map((c) => (
            <th
              key={String(c.key)}
              onClick={() => {
                if (sortKey === c.key) setAsc(!asc)
                else {
                  setSortKey(c.key)
                  setAsc(true)
                }
              }}
            >
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={String(c.key)}>{String(row[c.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
