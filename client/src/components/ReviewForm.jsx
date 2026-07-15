import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useForm } from '../context/FormContext'

const ReviewRow = ({ label, value }) => (
    <div className="flex border-b border-gray-100 py-3">
        <span className="w-48 text-sm text-gray-500 flex-shrink-0">{label}</span>
        <span className="text-sm font-semibold text-blue-900">
            {value || <em className="text-gray-300 font-normal">Not filled</em>}
        </span>
    </div>
)

const ReviewForm = () => {

    const { form, submitForm, resetForm } = useForm()
    const navigate = useNavigate()

    const handleBack = () => navigate('/GuideDetails')

    const handleSubmit = async () => {
        const result = await submitForm();
        if (result && result.success) {
            resetForm();
            navigate('/proposer-dashboard');
        }
    }

    return (
        <>
        <Navbar />
        <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-8">

            <h2 className="text-2xl font-bold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100">
                Review & Submit
            </h2>

            <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                Trainee Details
            </p>
            <div className="bg-gray-50 rounded-xl px-5 py-2 mb-6">
                <ReviewRow label="Name"             value={`${form.salutation} ${form.traineeName}`} />
                <ReviewRow label="Relationship"     value={form.relationship} />
                <ReviewRow label="Institute"        value={form.instituteName} />
                <ReviewRow label="Training From"    value={form.fromDate} />
                <ReviewRow label="Training To"      value={form.toDate} />
                <ReviewRow label="Area of Training" value={form.areaOfTraining} />
            </div>

            <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-2">
                Guide / Facilitator Details
            </p>
            <div className="bg-gray-50 rounded-xl px-5 py-2 mb-6">
                <ReviewRow label="Name"        value={`${form.guideSalutation} ${form.guideName}`} />
                <ReviewRow label="Designation" value={form.guideDesignation} />
                <ReviewRow label="Department"  value={form.guideDepartment} />
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={handleBack}
                    className="bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition"
                >
                    ← Back
                </button>
                <button
                    onClick={handleSubmit}
                    className="bg-green-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit
                </button>
            </div>

        </div>
        </>
    )
}

export default ReviewForm