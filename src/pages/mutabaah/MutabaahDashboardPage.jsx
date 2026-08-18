import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahAnalyticsPage from '../MutabaahAnalyticsPage'

export default function MutabaahDashboardPage() {
  return (
    <div data-testid="mutabaah-dashboard-page" className="mutabaah-dashboard-wrapper">
      <MutabaahSubNav />
      <MutabaahAnalyticsPage view="dashboard" />
    </div>
  )
}
