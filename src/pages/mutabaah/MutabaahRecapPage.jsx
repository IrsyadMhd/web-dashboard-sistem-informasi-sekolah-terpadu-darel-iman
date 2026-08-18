import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahAnalyticsPage from '../MutabaahAnalyticsPage'

export default function MutabaahRecapPage() {
  return (
    <div data-testid="mutabaah-recap-page" className="mutabaah-recap-wrapper">
      <MutabaahSubNav />
      <MutabaahAnalyticsPage view="rekap" />
    </div>
  )
}
