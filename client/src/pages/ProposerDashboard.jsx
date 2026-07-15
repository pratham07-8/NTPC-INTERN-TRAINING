import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import WorkflowStepper from '../components/WorkflowStepper';
import LOGO from '../assets/ntpc-logo.png';

const ProposerDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/Review', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setRequests(res.data.requests);
        }
      } catch (err) {
        console.error('Error fetching requests', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchRequests();
  }, [token]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_GUIDE':
        return <span className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700 rounded-full border border-amber-200/60">Pending Guide</span>;
      case 'PENDING_GGM':
        return <span className="px-3 py-1 text-xs font-bold bg-yellow-50 text-yellow-800 rounded-full border border-yellow-250/60">Pending Dept GM</span>;
      case 'PENDING_TO':
        return <span className="px-3 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200/60">Pending Training Officer</span>;
      case 'PENDING_HR':
        return <span className="px-3 py-1 text-xs font-bold bg-purple-50 text-purple-700 rounded-full border border-purple-200/60">Pending HR GM</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-250/60">Approved</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 text-xs font-bold bg-red-50 text-red-700 rounded-full border border-red-200/60">Rejected / Correction</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold bg-slate-50 text-slate-600 rounded-full border border-slate-200/60">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <img src={LOGO} alt="NTPC Logo" className="h-10 w-auto object-contain" />
          <span className="text-slate-400 border-l border-slate-200 pl-4 text-sm tracking-widest font-semibold uppercase">
            Proposer Portal
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-600 text-xs font-bold rounded-xl transition duration-150 shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">Your Intern Requests</h1>
            <p className="text-sm text-slate-500 mt-1">Submit and track Trainee approval requests in real-time</p>
          </div>
          <button
            onClick={() => navigate('/TraineeDetails')}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl tracking-wide shadow-lg shadow-orange-500/20 transform active:scale-95 transition"
          >
            + Create New Request
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="text-slate-400 text-6xl mb-4">🗂️</div>
            <h3 className="text-xl font-bold text-slate-700">No requests submitted yet</h3>
            <p className="text-sm text-slate-550 mt-2 max-w-md mx-auto">
              Start by clicking the button above to fill out details for trainee recruitment approval.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Trainee Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Institute</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Guide & Dept</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Remarks</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {requests.map((request) => (
                  <React.Fragment key={request.id}>
                    <tr
                      onClick={() => toggleRow(request.id)}
                      className="hover:bg-slate-50 transition cursor-pointer border-b border-slate-100"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        <span className="mr-2 text-slate-400">{expandedRequestId === request.id ? '▼' : '▶'}</span>
                        {request.trainee?.salutation} {request.trainee?.full_name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {request.trainee?.institute}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="text-slate-700 font-semibold">{request.guide?.full_name}</div>
                        <div className="text-xs text-slate-400">{request.guide?.department}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                        {request.remarks || <em className="text-slate-350">No remarks</em>}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs">
                        {new Date(request.submitted_at).toLocaleDateString()}
                      </td>
                    </tr>
                    
                    {expandedRequestId === request.id && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-6 py-6 border-b border-slate-100">
                          <div className="max-w-4xl mx-auto">
                            <WorkflowStepper status={request.status} theme="light" />
                            
                            {request.remarks && (
                              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-left">
                                <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">
                                  Return Remarks / Correction Comments
                                </h4>
                                <p className="text-sm text-slate-700">{request.remarks}</p>
                              </div>
                            )}
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 text-left bg-white p-4 rounded-2xl border border-slate-200">
                              <div>
                                <p className="font-semibold text-slate-700 mb-1">Training Detail Specs:</p>
                                <p>Area of Training: {request.trainee?.area_of_training || 'General'}</p>
                                <p>Dates: {new Date(request.trainee?.from_date).toLocaleDateString()} to {new Date(request.trainee?.to_date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700 mb-1">Assigned Guide Specs:</p>
                                <p>Guide Designation: {request.guide?.designation}</p>
                                <p>Guide Department: {request.guide?.department}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProposerDashboard;
