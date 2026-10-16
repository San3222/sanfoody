import { cn } from '@/lib/utils'

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
}

export function Table<T>({ columns, data, className }: { columns: Column<T>[]; data: T[]; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-charcoal/10 bg-white shadow-soft', className)}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-charcoal/10 bg-beige/50">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 font-semibold text-charcoal">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-charcoal/5">
              {columns.map((col) => (
                <td key={col.header} className="px-4 py-3 text-charcoal">
                  {typeof col.accessor === 'function' ? col.accessor(row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}