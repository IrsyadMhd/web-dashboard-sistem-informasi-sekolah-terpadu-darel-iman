import * as React from 'react'
import PropTypes from 'prop-types'
import { cn } from '../../lib/utils'

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-xs font-bold text-slate-700 dark:text-slate-300 leading-none select-none', className)}
    {...props}
  />
))
Label.displayName = 'Label'

Label.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
}

export default Label
