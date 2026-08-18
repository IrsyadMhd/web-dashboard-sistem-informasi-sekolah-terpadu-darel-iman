import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahOverviewPage from '../MutabaahPage'

export default function MutabaahParentMonitoringPage() {
  return (
    <div data-testid="mutabaah-parent-monitoring-page" className="mutabaah-parent-monitoring-wrapper">
      <MutabaahSubNav />
      <MutabaahOverviewPage view="parents" />
    </div>
  )
}
