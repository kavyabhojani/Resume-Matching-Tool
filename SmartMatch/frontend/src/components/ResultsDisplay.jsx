const ResultsDisplay = ({ results, onReset }) => {
  const { match_score, gaps, job_info, resume_info } = results;

  const MatchScoreRing = ({ score }) => {
    // Get color based on score
    const getScoreColor = (score) => {
      if (score >= 80) return 'rgb(34, 197, 94)' // green-500
      if (score >= 60) return 'rgb(99, 102, 241)' // indigo-500
      if (score >= 40) return 'rgb(234, 179, 8)' // yellow-500
      return 'rgb(239, 68, 68)' // red-500
    };
  
    // Get text feedback based on score
    const getScoreFeedback = (score) => {
      if (score >= 80) return 'Excellent Match'
      if (score >= 60) return 'Good Match'
      if (score >= 40) return 'Fair Match'
      return 'Needs Improvement'
    };
  
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const scoreColor = getScoreColor(score);
    
    return (
      <div className="relative flex flex-col items-center">
        <div className="relative inline-flex items-center justify-center">
          {/* Main SVG */}
          <svg className="w-40 h-40 transform -rotate-90">
            {/* Outer decorative ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/20"
            />
            
            {/* Main background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-white/10"
            />
            
            {/* Progress ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              style={{
                filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))'
              }}
            />
            
            {/* Small decorative notches */}
            {[...Array(12)].map((_, i) => (
              <line
                key={i}
                x1="80"
                y1="10"
                x2="80"
                y2="15"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white/30"
                transform={`rotate(${i * 30} 80 80)`}
              />
            ))}
          </svg>
  
          {/* Central display */}
          <div className="absolute flex flex-col items-center justify-center text-white">
            <span className="text-4xl font-bold">
              {score.toFixed(0)}%
            </span>
          </div>
        </div>
  
        {/* Score feedback */}
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-white">
            {getScoreFeedback(score)}
          </span>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ value, title }) => (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm font-medium text-indigo-600">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  const SkillTag = ({ skill }) => (
    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
      {skill}
    </span>
  );

  const ComparisonCard = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );  
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-white text-center md:text-left mb-6 md:mb-0">
                <h1 className="text-3xl font-bold">Resume Analysis Results</h1>
                <p className="mt-2 opacity-90">Based on job requirements match</p>
              </div>
              <MatchScoreRing score={match_score} />
            </div>
          </div>
          
          <div className="p-8">
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-green-50 rounded-xl p-4">
      <div className="text-green-600 text-sm font-medium">Matching Skills</div>
      <div className="text-2xl font-bold text-green-700 mt-2">
        {job_info.skills ? Object.values(job_info.skills).flat().length - gaps.missing_skills.length : 0}
      </div>
    </div>
    <div className="bg-red-50 rounded-xl p-4">
      <div className="text-red-600 text-sm font-medium">Missing Skills</div>
      <div className="text-2xl font-bold text-red-700 mt-2">
        {gaps.missing_skills.length}
      </div>
    </div>
  </div>
</div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Required Skills & Education */}
          <div className="space-y-6">
            <ComparisonCard title="Required Profile">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Skills Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(job_info.skills || {}).flat().map((skill, index) => (
                      <SkillTag key={index} skill={skill} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Education Required</h4>
                  <div className="space-y-2">
                    {job_info.education?.map((edu, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                        </svg>
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ComparisonCard>
          </div>

          {/* Your Profile */}
          <div className="space-y-6">
            <ComparisonCard title="Your Profile">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Your Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(resume_info.skills || {}).flat().map((skill, index) => (
                      <SkillTag key={index} skill={skill} />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Your Education</h4>
                  <div className="space-y-2">
                    {resume_info.education?.map((edu, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-700">
                        <svg className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                        </svg>
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ComparisonCard>
          </div>

          {/* Gap Analysis */}
          {/* Replace your existing Gap Analysis section with this */}
<div className="space-y-6">
  <ComparisonCard title="Gap Analysis">
    {!gaps.missing_skills.length && !gaps.missing_education.length && 
     !gaps.experience_gap && Object.values(gaps.feedback).every(f => f.length === 0) ? (
      // Perfect Match - No Gaps
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Good Match!</h4>
        <p className="text-gray-500 max-w-sm">
          Your profile matches the base requirements for this position. You're an good candidate for this role!
        </p>
      </div>
    ) : (
      <div className="space-y-6">
        {/* Skills Gap Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Skills Assessment</h4>
          {gaps.missing_skills.length > 0 ? (
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <h5 className="text-red-700 font-medium">Skills to Develop</h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {gaps.missing_skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1.5 bg-white text-red-600 rounded-full text-sm font-medium border border-red-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700">All required skills match!</span>
              </div>
            </div>
          )}
        </div>

        {/* Education Gap Section */}
        {gaps.missing_education.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Education Requirements</h4>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <h5 className="text-orange-700 font-medium">Missing Qualifications</h5>
              </div>
              <div className="flex flex-wrap gap-2">
                {gaps.missing_education.map((edu, index) => (
                  <span key={index} className="px-3 py-1.5 bg-white text-orange-600 rounded-full text-sm font-medium border border-orange-100">
                    {edu.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Experience Gap Section */}
        {gaps.experience_gap > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Experience Gap</h4>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-700">
                  {gaps.experience_gap} year{gaps.experience_gap > 1 ? 's' : ''} of additional experience needed
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {Object.entries(gaps.feedback).some(([_, feedbacks]) => feedbacks.length > 0) && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Improvement Suggestions</h4>
            <div className="space-y-4">
              {Object.entries(gaps.feedback).map(([category, feedbacks]) => 
                feedbacks.length > 0 && (
                  <div key={category} className="bg-indigo-50 rounded-lg p-4">
                    <h5 className="text-indigo-700 font-medium mb-3">
                      {category.charAt(0).toUpperCase() + category.slice(1)} Feedback
                    </h5>
                    <ul className="space-y-2">
                      {feedbacks.map((feedback, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-indigo-700">{feedback}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    )}
  </ComparisonCard>
</div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={onReset}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl px-4 py-3 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;