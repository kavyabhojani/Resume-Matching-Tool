import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import ResultsDisplay from './components/ResultsDisplay'
import { Toaster } from 'react-hot-toast'

function App() {
  const [results, setResults] = useState(null)

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">SmartMatch</h1>
          <p className="mt-1 text-sm text-gray-500">Resume Matching and Feedback Tool</p>
        </div>
      </header>
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