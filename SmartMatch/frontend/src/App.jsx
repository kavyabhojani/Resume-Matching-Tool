import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import ResultsDisplay from './components/ResultsDisplay'
import { Toaster } from 'react-hot-toast'

function App() {
  const [results, setResults] = useState(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <nav className="bg-gradient-to-r from-indigo-500 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-semibold text-white">SmartMatch</h1>
            </div>
            
            {results && (
              <button
                onClick={() => setResults(null)}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50 transition-colors duration-200"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {!results ? (
          <ResumeUpload setResults={setResults} />
        ) : (
          <ResultsDisplay results={results} onReset={() => setResults(null)} />
        )}
      </main>
    </div>
  )
}

export default App