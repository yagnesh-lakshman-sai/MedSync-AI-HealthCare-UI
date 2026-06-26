import React, { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import Modal from './common/Modal'
import { Sparkles, Download } from 'lucide-react'

export default function DietPlanModal({ appointment, loading, onClose, onGenerate }) {
  const contentRef = useRef(null)
  const dietPlan = appointment?.dietPlan

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true, logging: false })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width / 2, canvas.height / 2] })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2)
      pdf.save(`Diet_Plan_${Date.now()}.pdf`)
    } catch { toast.error('Failed to generate PDF.') }
  }

  return (
    <Modal open={!!appointment} onClose={onClose} title="AI Diet Plan" size="lg">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center mb-4 animate-pulse-slow">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="font-display font-700 text-slate-800 text-base mb-2">Generating Diet Plan...</h3>
          <p className="text-slate-400 text-sm max-w-xs">Our AI is analysing the diagnosis and medications to create personalised recommendations.</p>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
          </div>
        </div>
      ) : dietPlan ? (
        <>
          <div ref={contentRef} className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-teal-100">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-display font-700 text-teal-800">MedSync AI Diet Plan</h3>
                <p className="text-teal-600 text-xs">Generated {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700">
              <ReactMarkdown>{dietPlan}</ReactMarkdown>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDownloadPDF} className="btn-secondary flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <h3 className="font-700 text-slate-800 mb-2">No Diet Plan Yet</h3>
          <p className="text-slate-400 text-sm mb-6">Generate a personalised AI diet plan based on diagnosis and medicines.</p>
          <div className="flex gap-3 justify-center">
            {onGenerate && <button onClick={() => onGenerate(appointment)} className="btn-primary text-sm">Generate Diet Plan</button>}
            <button onClick={onClose} className="btn-secondary text-sm">Close</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
