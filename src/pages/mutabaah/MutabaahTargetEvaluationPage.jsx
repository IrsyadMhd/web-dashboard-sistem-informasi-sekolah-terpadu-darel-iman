import React from 'react'
import MutabaahSubNav from '../../components/mutabaah/MutabaahSubNav'
import MutabaahOverviewPage from '../MutabaahPage'

export default function MutabaahTargetEvaluationPage() {
  return (
    <div data-testid="mutabaah-target-page" className="mutabaah-target-wrapper">
      <MutabaahSubNav />
      <MutabaahOverviewPage view="evaluasi" />
    </div>
  )
}
