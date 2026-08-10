import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('Dashboard crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-lg mx-auto px-4 py-10">
          <div className="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-2xl p-6">
            <h2 className="font-bold text-red-600 mb-2">A apărut o eroare</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{this.state.error?.message || String(this.state.error)}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-sm font-semibold text-primary-600 hover:underline"
            >
              Încearcă din nou
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
