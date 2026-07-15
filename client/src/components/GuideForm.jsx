import React from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from './Navbar';
import { useForm } from '../context/FormContext';

const departments = [
  'HR',
  'Finance',
  'Civil',
  'Electrical',
  'Mechanical',
  'C&I',
  'O&M',
  'C&M',
  'IT',
  'Chemistry',
  'Safety',
  'Renewable Energy'
];

const GuideForm = () => {

    const {form,updateField} = useForm();
    
    const navigate = useNavigate();

    const handleBack = () => {

        navigate('/TraineeDetails')
    }

    const handleContinue = () => {

        navigate('/Review')

    }

  return (
    <>

    <Navbar />
    <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100">
        Guide Details
      </h2>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Guide Name <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 w-24"
           value = {form.guideSalutation}
           onChange = {(e) => updateField('guideSalutation',e.target.value)}
          >
            <option>Mr.</option>
            <option>Ms.</option>
            <option>Mrs.</option>
            <option>Dr.</option>
          </select>
          <input
            type="text"
            placeholder="Name of Guide/Facilitator"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value = {form.guideName}
            onChange={(e) => updateField('guideName',e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Designation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Senior Manager, DGM"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value = {form.guideDesignation}
          onChange={(e) => updateField('guideDesignation',e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value = {form.guideDepartment}
          onChange={(e) => updateField('guideDepartment',e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>


      <div className="flex justify-between mt-6">
        <button className="flex bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition" onClick = {() => handleBack()}>
          ← Back
        </button>
        <span>
            <button className="flex bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition" onClick = {() => handleContinue()}>
            Continue →
            </button>
        </span>
      </div> 

     </div> 
    </>
  )
}

export default GuideForm