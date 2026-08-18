import * as React from 'react'
import PropTypes from 'prop-types'
import {
  TableRoot as TailGridsTableRoot,
  TableHeader as TailGridsTableHeader,
  TableBody as TailGridsTableBody,
  TableRow as TailGridsTableRow,
  TableHead as TailGridsTableHead,
  TableCell as TailGridsTableCell
} from '../tailgrids/core/table'
import { cn } from '../../lib/utils'

export const Table = React.forwardRef(({ className, fullBleed, ...props }, ref) => (
  <TailGridsTableRoot ref={ref} fullBleed={fullBleed} className={cn('w-full', className)} {...props} />
))
Table.displayName = 'Table'

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <TailGridsTableHeader ref={ref} className={cn(className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

export const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <TailGridsTableBody ref={ref} className={cn(className)} {...props} />
))
TableBody.displayName = 'TableBody'

export const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn('border-t border-slate-200/80 bg-slate-50/80 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300', className)} {...props} />
))
TableFooter.displayName = 'TableFooter'

export const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <TailGridsTableRow ref={ref} className={cn(className)} {...props} />
))
TableRow.displayName = 'TableRow'

export const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <TailGridsTableHead ref={ref} className={cn(className)} {...props} />
))
TableHead.displayName = 'TableHead'

export const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <TailGridsTableCell ref={ref} className={cn(className)} {...props} />
))
TableCell.displayName = 'TableCell'

export const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn('mt-4 text-xs text-slate-400 dark:text-slate-500', className)} {...props} />
))
TableCaption.displayName = 'TableCaption'

Table.propTypes = { className: PropTypes.string }
TableHeader.propTypes = { className: PropTypes.string }
TableBody.propTypes = { className: PropTypes.string }
TableFooter.propTypes = { className: PropTypes.string }
TableRow.propTypes = { className: PropTypes.string }
TableHead.propTypes = { className: PropTypes.string }
TableCell.propTypes = { className: PropTypes.string }
TableCaption.propTypes = { className: PropTypes.string }
