// Plain CSV export — no dependency. Two things easy to get wrong here:
// RFC 4180 field escaping (title/address are free text and can contain
// commas/quotes/newlines) and a UTF-8 BOM (without it, Excel on Windows
// mangles Romanian diacritics like ă/â/î/ș/ț).

function escapeCell(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCSV(rows, columns) {
  const header = columns.map(c => escapeCell(c.label)).join(',')
  const body = rows.map(row => columns.map(c => escapeCell(c.value(row))).join(',')).join('\n')
  return '﻿' + header + '\n' + body
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
