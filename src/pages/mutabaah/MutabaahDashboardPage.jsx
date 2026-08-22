import React from 'react'
import MutabaahAnalyticsPage from '../MutabaahAnalyticsPage'

export default function MutabaahDashboardPage() {
  return (
    <div data-testid="mutabaah-dashboard-page" className="mutabaah-dashboard-wrapper">
      <MutabaahAnalyticsPage view="dashboard" />
    </div>
  )
}
