import * as React from 'react'
import PropTypes from 'prop-types'
import { TextField as AriaTextField } from 'react-aria-components'
import { cn } from '../../lib/utils'

export function TextField({ className, ...props }) {
  return (
    <AriaTextField
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  )
}

TextField.propTypes = {
  className: PropTypes.string,
}

export default TextField
