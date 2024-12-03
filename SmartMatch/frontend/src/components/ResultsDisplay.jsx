import React from 'react';

const SkillsSection = ({ title, skills }) => (
  skills && Object.keys(skills).length > 0 && (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(skills).map(([category, skillList]) => (
          <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-indigo-600">{category.replace(/_/g, ' ')}</h4>
            <ul className="mt-2 space-y-1">
              {skillList.map((skill, index) => (
                <li key={index} className="text-sm text-gray-600">• {skill}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
);


const ContextSection = ({ title, context }) => (
  context && Object.keys(context).length > 0 && (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(context).map(([category, items]) => items.length > 0 && (
          <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-indigo-600">{category.replace(/_/g, ' ')}</h4>
            <ul className="mt-2 space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-sm text-gray-600">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
);

const EducationSection = ({ title, education }) => (
  education && education.length > 0 && (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="mt-2 bg-white p-4 rounded-lg shadow-sm">
        <ul className="space-y-1">
          {education.map((edu, index) => (
            <li key={index} className="text-sm text-gray-600">
              • {edu.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
);

const GapAnalysis = ({ gaps }) => (
  <div className="mt-6">
    <h3 className="text-lg font-medium text-gray-900">Gap Analysis</h3>
    <div className="mt-2 space-y-4">
      {gaps.missing_skills.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-red-600">Missing Skills</h4>
          <ul className="mt-2 space-y-1">
            {gaps.missing_skills.map((skill, index) => (
              <li key={index} className="text-sm text-gray-600">• {skill}</li>
            ))}
          </ul>
        </div>
      )}
      
      {gaps.missing_education.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-red-600">Missing Education</h4>
          <ul className="mt-2 space-y-1">
            {gaps.missing_education.map((edu, index) => (
              <li key={index} className="text-sm text-gray-600">• {edu.replace(/_/g, ' ')}</li>
            ))}
          </ul>
        </div>
      )}

      {gaps.experience_gap > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="font-medium text-red-600">Experience Gap</h4>
          <p className="text-sm text-gray-600">
            {gaps.experience_gap} years of additional experience needed
          </p>
        </div>
      )}

      {Object.entries(gaps.feedback).map(([category, feedbacks]) => 
        feedbacks.length > 0 && (
          <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-indigo-600">{category.charAt(0).toUpperCase() + category.slice(1)} Feedback</h4>
            <ul className="mt-2 space-y-1">
              {feedbacks.map((feedback, index) => (
                <li key={index} className="text-sm text-gray-600">• {feedback}</li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  </div>
);

const ResultsDisplay = ({ results, onReset }) => {
  const { match_score, gaps, job_info, resume_info } = results;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          
          {/* Match Score */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Match Score</div>
              <div className="text-lg font-medium text-indigo-600">{match_score.toFixed(1)}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${match_score}%` }}
              ></div>
            </div>
          </div>
          
          {/* Job Requirements */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Job Requirements</h3>
            <SkillsSection title="Required Skills" skills={job_info.skills} />
            <EducationSection title="Required Education" education={job_info.education} />
            <ContextSection title="Job Context" context={job_info.context} />
          </div>

          {/* Your Profile */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Profile</h3>
            <SkillsSection title="Your Skills" skills={resume_info.skills} />
            <EducationSection title="Your Education" education={resume_info.education} />
            <ContextSection title="Your Context" context={resume_info.context} />
          </div>

          {/* Gap Analysis */}
          <GapAnalysis gaps={gaps} />
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Analyze Another Resume
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;