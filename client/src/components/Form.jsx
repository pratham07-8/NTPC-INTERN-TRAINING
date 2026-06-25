import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useForm } from '../context/FormContext';

const Form = () => {

  const {form,updateField} = useForm();

  const navigate = useNavigate();

  const handleContinue = () => {

    navigate('/GuideDetails')
  }

  useEffect(() => {

  },[])

  return (
    <>

    <Navbar/> 
      <div className="w-full max-w-2xl mx-auto mt-8 bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-6 pb-3 border-b-2 border-blue-100">
        Trainee Details
      </h2>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Trainee Name <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 w-24"
            value = {form.salutation}
            onChange = {(e) => updateField('salutation',e.target.value)}
          >
            <option>Mr.</option>
            <option>Ms.</option>
            <option>Dr.</option>
          </select>
          <input
            type="text"
            placeholder="Enter full name"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value = {form.traineeName}
            onChange={(e) => updateField('traineeName',e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Relationship <span className="text-red-500">*</span>
        </label>
        <select className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value = {form.relationship}
          onChange = {(e) => updateField('relationship',e.target.value)}
        >
          <option value="">Select relationship</option>
          <option>Son</option>
          <option>Daughter</option>
          <option>Relative</option>
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Name of Institute <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. IIT Delhi, NIT Allahabad"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value = {form.instituteName}
          onChange={(e) => updateField('instituteName',e.target.value)}
        />
      </div>

      <div className="flex gap-4 mb-5">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Training From <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value = {form.fromDate}
            onChange={(e) => updateField('fromDate',e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Training To <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value = {form.toDate}
            onChange={(e) => updateField('toDate',e.target.value)}
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Area of Training <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Electrical Engineering, HR Management"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value = {form.areaOfTraining}
          onChange={(e) => updateField('areaOfTraining',e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">Specify the domain of training at Corporate Centre, NTPC Ltd.</p>
      </div>

      <div className="flex justify-end mt-6">
        <button className="bg-blue-800 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition" onClick = {() => handleContinue()}>
          Continue →
        </button>
      </div> 

     </div> 


    </>
  )
}

export default Form