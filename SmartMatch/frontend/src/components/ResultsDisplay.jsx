const ResultsDisplay = ({ results, onReset }) => {
    const { match_score, gaps } = results
  
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
            <div className="mt-4">
              <div className="text-lg font-medium">Match Score: {match_score.toFixed(1)}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full"
                  style={{ width: `${match_score}%` }}
                ></div>
              </div>
            </div>
          </div>
  
          {gaps.missing_skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Missing Skills</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {gaps.missing_skills.map((skill, index) => (
                  <li key={index} className="text-gray-600">{skill}</li>
                ))}
              </ul>
            </div>
          )}
  
          {gaps.feedback.skills && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Recommendations</h3>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                {gaps.feedback.skills.map((feedback, index) => (
                  <li key={index} className="text-gray-600">{feedback}</li>
                ))}
              </ul>
            </div>
          )}
  
          <button
            onClick={onReset}
            className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>
    )
  }
  
  export default ResultsDisplay