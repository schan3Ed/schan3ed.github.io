import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';

export function LoadingSpinnerButton() {
  return (
    <CircularProgress size={24} thickness={7} className="loading-spin-button" />
  )
}

export function LoadingSpinnerPage() {
  return (
    <div className="loading-spin-wrapper">
      <CircularProgress size={68} thickness={5} className="loading-spin-page" />
    </div>
  )
}
