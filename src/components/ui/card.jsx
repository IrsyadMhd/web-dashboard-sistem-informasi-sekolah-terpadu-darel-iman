import * as React from 'react'
import PropTypes from 'prop-types'
import {
  Card as TailGridsCard,
  CardHeader as TailGridsCardHeader,
  CardTitle as TailGridsCardTitle,
  CardDescription as TailGridsCardDescription,
  CardAction as TailGridsCardAction,
  CardContent as TailGridsCardContent,
  CardFooter as TailGridsCardFooter,
} from '../tailgrids/core/card'

export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCard ref={ref} className={className} {...props}>
    {children}
  </TailGridsCard>
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardHeader ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardHeader>
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardTitle ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardTitle>
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardDescription ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardDescription>
))
CardDescription.displayName = 'CardDescription'

export const CardAction = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardAction ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardAction>
))
CardAction.displayName = 'CardAction'

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardContent ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardContent>
))
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <TailGridsCardFooter ref={ref} className={className} {...props}>
    {children}
  </TailGridsCardFooter>
))
CardFooter.displayName = 'CardFooter'

Card.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardHeader.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardTitle.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardDescription.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardAction.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardContent.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardFooter.propTypes = { className: PropTypes.string, children: PropTypes.node }

export default Card
