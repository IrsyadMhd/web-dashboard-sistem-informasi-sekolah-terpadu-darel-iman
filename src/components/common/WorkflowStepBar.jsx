import React from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react'

export function WorkflowStepBar({ steps, currentStepIndex, onNextStep, moduleName }) {
  const navigate = useNavigate()

  const handleStepClick = (step, index) => {
    if (step.onClick) {
      step.onClick()
    } else if (step.link) {
      navigate(step.link)
    }
  }

  const nextStep = steps[currentStepIndex + 1]

  return (
    <div className="mb-6 rounded-[18px] border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#1B2433]">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-extrabold text-[#0E5C44] dark:bg-emerald-950/60 dark:text-[#3FBF75]">
            Flow
          </span>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Alur Kerjanya: {moduleName || 'Modul Sistem'}
          </h4>
        </div>
        {nextStep && (
          <button
            type="button"
            onClick={() => handleStepClick(nextStep, currentStepIndex + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0E5C44] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1E8E5A] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:bg-[#0E5C44] dark:hover:bg-[#1E8E5A]"
          >
            <span>Langkah Berikutnya: {nextStep.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex
          const isCurrent = idx === currentStepIndex
          return (
            <React.Fragment key={idx}>
              <div
                onClick={() => handleStepClick(step, idx)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-[#0E5C44] text-white shadow-md ring-2 ring-[#0E5C44]/30 dark:bg-[#0E5C44]'
                    : isDone
                    ? 'bg-emerald-50 text-[#0E5C44] hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-[#3FBF75]'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-[#3FBF75]" />
                ) : (
                  <span className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[10px] ${isCurrent ? 'bg-white text-[#0E5C44]' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                    {idx + 1}
                  </span>
                )}
                <span>{step.label}</span>
              </div>

              {idx < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

WorkflowStepBar.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      link: PropTypes.string,
      onClick: PropTypes.func,
    })
  ).isRequired,
  currentStepIndex: PropTypes.number.isRequired,
  onNextStep: PropTypes.func,
  moduleName: PropTypes.string,
}
