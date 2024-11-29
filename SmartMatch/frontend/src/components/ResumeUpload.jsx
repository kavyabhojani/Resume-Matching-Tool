import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const ResumeUpload = ({ setResults }) => {
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescFile, setJobDescFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!resumeFile || !jobDescFile) {
      toast.error('Please upload both files')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_description', jobDescFile)

    try {
      toast.loading('Processing files...')
      
      // Upload files
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      const { resume_text, job_desc_text } = uploadResponse.data

      // Analyze texts
      const analysisResponse = await api.post('/analyze', {
        resume: resume_text,
        job_description: job_desc_text
      })

      setResults(analysisResponse.data)
      toast.dismiss()
      toast.success('Analysis complete!')
    } catch (error) {
      toast.dismiss()
      console.error('Error details:', error.response || error)
      const errorMessage = error.response?.data?.error || error.message || 'Error processing files'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  const validateFile = (file) => {
    if (!file) return false;
    
    const validExtensions = ['.pdf', '.txt']
    const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error(`Invalid file type. Please upload only PDF or TXT files. Got: ${fileExtension}`)
      return false
    }
    
    // 5MB size limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Please upload files smaller than 5MB')
      return false
    }
    
    return true
  }
  
  const handleFileChange = (setter) => (e) => {
    const file = e.target.files[0]
    if (file && validateFile(file)) {
      setter(file)
      toast.success(`File "${file.name}" selected`)
    } else {
      e.target.value = ''  // Reset input
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Resume (PDF or TXT only, max 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange(setResumeFile)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Job Description (PDF or TXT only, max 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange(setJobDescFile)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {loading ? 'Processing...' : 'Analyze Match'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResumeUpload