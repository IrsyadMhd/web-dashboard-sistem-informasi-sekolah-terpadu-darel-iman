import React from 'react'
import { Tabs as TabsPrimitive } from '../ui/tabs'

/**
 * AppTabs - canonical tab bar.
 * Delegasi ke ui/tabs: tabs={[{id,label,icon,badge}]}, activeTab, onChange.
 */
export default function AppTabs(props) {
  return <TabsPrimitive {...props} />
}
