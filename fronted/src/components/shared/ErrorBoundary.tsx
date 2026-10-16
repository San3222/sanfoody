import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error caught by ErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-5 text-center">
          <h1 className="font-display text-2xl font-bold text-charcoal">Something went wrong</h1>
          <p className="max-w-md text-sm text-warm-gray">{this.state.error.message}</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ error: null })
              window.location.reload()
            }}
            className="rounded-full bg-linear-to-r from-tomato to-orange px-6 py-3 text-sm font-bold text-cream shadow-warm"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}