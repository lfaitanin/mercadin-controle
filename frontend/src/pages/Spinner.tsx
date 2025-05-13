import React from 'react'

export default function Spinner({className = ''}: {className?: string}) {
  return (
    <div className={`spinner ${className}`}></div>
  )
} 