import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import WorkflowStepper from '../components/WorkflowStepper';
import LOGO from '../assets/ntpc-logo.png';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getRejectButtonLabel = () => {
    if (!user) return 'Reject / Send Back';
    switch (user.role) {
      case 'GUIDE':
        return 'Send Back to Proposer';
      case 'GUIDE_GM':
        return 'Send Back to Guide';
      case 'TRAINING_OFFICER':
        return 'Send Back to Dept GM';
      case 'HR_GM':
        return 'Send Back to Training Officer';
      default:
        return 'Reject / Send Back';
    }
  };

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/Review', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRequests(res.data.requests);
        if (res.data.requests.length > 0) {
          setSelectedRequest(res.data.requests[0]);
        } else {
          setSelectedRequest(null);
        }
      }
    } catch (err) {
      console.error('Error fetching pending requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPendingRequests();
  }, [token]);

  const handleAction = async (action) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    setMessage('');
    try {
      const res = await axios.post(
        `http://localhost:5000/Review/${selectedRequest.id}/action`,
        { action, remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setMessage(`Request successfully ${action.toLowerCase()}d!`);
        setRemarks('');
        // Refresh list
        await fetchPendingRequests();
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error processing request action.');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'GUIDE':
        return 'Guide (Mentor)';
      case 'GUIDE_GM':
        return 'Guide General Manager (Dept GM)';
      case 'TRAINING_OFFICER':
        return 'Training Officer';
      case 'HR_GM':
        return 'HR General Manager';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-4">
          <img src={LOGO} alt="NTPC Logo" className="h-10 w-auto object-contain" />
          <span className="text-slate-400 border-l border-slate-200 pl-4 text-sm tracking-widest font-semibold uppercase">
            Approval Board
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">{user?.name}</p>
            <p className="text-xs text-orange-600 font-bold tracking-wide">{getRoleLabel(user?.role)}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 text-red-650 text-xs font-bold rounded-xl transition duration-150 shadow-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Dashboard Split-Pane */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Left Side: Pending List */}
        <div className="w-full md:w-5/12 flex flex-col bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between text-slate-800">
            <span>Pending Requests</span>
            <span className="bg-orange-50 text-orange-600 border border-orange-200/60 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {requests.length} Active
            </span>
          </h2>

          {loading ? (
            <div className="flex-1 flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-20 text-center">
              <div className="text-slate-400 text-5xl mb-3">✅</div>
              <h3 className="text-md font-bold text-slate-700">All caught up!</h3>
              <p className="text-xs text-slate-400 mt-1">No requests are pending your review at this time.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[70vh]">
              {requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedRequest(req);
                    setMessage('');
                  }}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    selectedRequest?.id === req.id
                      ? 'bg-orange-50/50 border-orange-500/50 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <p className="font-bold text-slate-800">
                    {req.trainee?.salutation} {req.trainee?.full_name}
                  </p>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>{req.trainee?.institute}</span>
                    <span>{new Date(req.submitted_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Details View */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          {selectedRequest ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Request Details</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Submitted by Proposer ID: {selectedRequest.proposer_id}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200/60 text-xs font-bold rounded-full">
                    {selectedRequest.status}
                  </span>
                </div>

                <WorkflowStepper status={selectedRequest.status} theme="light" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 text-left">
                  {/* Trainee Details */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Trainee Info</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-400">Name:</span> <span className="font-semibold text-slate-700">{selectedRequest.trainee?.salutation} {selectedRequest.trainee?.full_name}</span></p>
                      <p><span className="text-slate-400">Relationship:</span> <span className="text-slate-650">{selectedRequest.trainee?.relationship}</span></p>
                      <p><span className="text-slate-400">Institute:</span> <span className="text-slate-650">{selectedRequest.trainee?.institute}</span></p>
                      <p><span className="text-slate-400">Duration:</span> <span className="text-slate-650">{new Date(selectedRequest.trainee?.from_date).toLocaleDateString()} to {new Date(selectedRequest.trainee?.to_date).toLocaleDateString()}</span></p>
                      <p><span className="text-slate-400">Area of Training:</span> <span className="text-slate-650">{selectedRequest.trainee?.area_of_training}</span></p>
                    </div>
                  </div>

                  {/* Guide Details */}
                  <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80">
                    <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3">Guide / Department</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-400">Guide Name:</span> <span className="font-semibold text-slate-700">{selectedRequest.guide?.salutation} {selectedRequest.guide?.full_name}</span></p>
                      <p><span className="text-slate-400">Designation:</span> <span className="text-slate-650">{selectedRequest.guide?.designation}</span></p>
                      <p><span className="text-slate-400">Department:</span> <span className="text-slate-650">{selectedRequest.guide?.department}</span></p>
                    </div>
                  </div>
                </div>

                {selectedRequest.remarks && (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-left mb-6">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Previous Remarks</h4>
                    <p className="text-sm text-slate-650">{selectedRequest.remarks}</p>
                  </div>
                )}

                {message && (
                  <div className="bg-orange-50 border border-orange-250 text-orange-700 p-4 rounded-xl text-sm mb-4">
                    {message}
                  </div>
                )}
              </div>

              {/* Review Section */}
              <div className="border-t border-slate-100 pt-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-left">
                  Review Remarks / Comments
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter approval comments or rejection reasons..."
                  rows="3"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition mb-4 resize-none"
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => handleAction('REJECT')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-650 font-bold rounded-xl text-sm transition duration-150 disabled:opacity-50 shadow-sm"
                  >
                    {getRejectButtonLabel()}
                  </button>
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm transition duration-150 shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                  >
                    Approve & Forward
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center text-slate-400">
              <span className="text-6xl mb-4">🔍</span>
              <p className="text-lg text-slate-700">No request selected</p>
              <p className="text-sm mt-1 text-slate-400">Select a request from the left list to review its details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
