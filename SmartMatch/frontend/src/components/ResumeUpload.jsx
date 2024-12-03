import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

const FileUploadZone = ({ onFileChange, accept, label, icon: Icon, file }) => {
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    onFileChange({ target: { files: [file] } })
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative rounded-lg p-8 transition-all duration-200 ease-in-out cursor-pointer 
        ${file ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-gray-50 border-2 border-dashed border-gray-300 hover:bg-gray-100'}`}
    >
      <input
        type="file"
        onChange={onFileChange}
        accept={accept}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Icon */}
        <div className={`p-4 rounded-full ${file ? 'bg-indigo-100' : 'bg-white shadow-sm'}`}>
          <Icon className={`w-8 h-8 ${file ? 'text-indigo-600' : 'text-gray-400'}`} />
        </div>

        {/* Upload Instructions or File Info */}
        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium text-indigo-600 break-all max-w-[200px]">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium text-gray-700">{label}</p>
            <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
            <p className="text-xs text-gray-400 mt-2">PDF or TXT (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ResumeUpload = ({ setResults }) => {
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescFile, setJobDescFile] = useState(null)
  const [error, setError] = useState('')

  const validateFile = (file) => {
    if (!file) return false
    
    const validExtensions = ['.pdf', '.txt']
    const fileExtension = file.name.toLowerCase().substr(file.name.lastIndexOf('.'))
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error(`Please upload a PDF or TXT file. Received: ${fileExtension}`)
      return false
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit. Please upload a smaller file.')
      return false
    }
    
    return true
  }
  
  const handleFileChange = (setter) => (e) => {
    setError('')
    const file = e.target.files[0]
    if (file && validateFile(file)) {
      setter(file)
      toast.success(`File uploaded: ${file.name}`)
    } else {
      e.target.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!resumeFile || !jobDescFile) {
      setError('Please upload both resume and job description files')
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_description', jobDescFile)

    try {
      const uploadToastId = toast.loading('Uploading files...')
      
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      toast.loading('Analyzing files...', { id: uploadToastId })
      
      const { resume_text, job_desc_text } = uploadResponse.data

      const analysisResponse = await api.post('/analyze', {
        resume: resume_text,
        job_description: job_desc_text
      })

      setResults(analysisResponse.data)
      toast.dismiss(uploadToastId)
      toast.success('Analysis complete!')
    } catch (error) {
      console.error('Error details:', error.response || error)
      const errorMessage = error.response?.data?.error || error.message || 'Error processing files'
      setError(errorMessage)
      toast.dismiss()
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const FileIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  const BriefcaseIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Analysis Tool</h1>
          <p className="mt-2 text-gray-600">Upload your resume and job description to get a detailed match analysis</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FileUploadZone
                onFileChange={handleFileChange(setResumeFile)}
                accept=".pdf,.txt"
                label="Upload Resume"
                icon={FileIcon}
                file={resumeFile}
              />
              
              <FileUploadZone
                onFileChange={handleFileChange(setJobDescFile)}
                accept=".pdf,.txt"
                label="Upload Job Description"
                icon={BriefcaseIcon}
                file={jobDescFile}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center px-8 py-4 rounded-lg text-white text-lg font-medium transition-all duration-200 
                ${loading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Analyze Resume Match'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResumeUpload