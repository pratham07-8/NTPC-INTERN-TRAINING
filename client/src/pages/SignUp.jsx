import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LOGO from '../assets/ntpc-logo.png';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PROPOSER',
    department: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'PROPOSER', label: 'Proposer (Intern Coordinator)' },
    { value: 'GUIDE', label: 'Guide (Mentor / Facilitator)' },
    { value: 'GUIDE_GM', label: 'Guide General Manager (Dept GM)' },
    { value: 'TRAINING_OFFICER', label: 'Training Officer' },
    { value: 'HR_GM', label: 'HR General Manager' },
  ];

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all fields.');
      return;
    }
    if (formData.role === 'GUIDE_GM' && !formData.department) {
      setError('Please select a department.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await signup(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
      formData.role === 'GUIDE_GM' ? formData.department : null
    );
    setLoading(false);
    if (res.success) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img src={LOGO} alt="NTPC Logo" className="mx-auto h-20 w-auto mb-4 object-contain" />
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          NTPC Intern Portal
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Create an account to join the approval workflow
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-4 shadow-xl rounded-3xl sm:px-10">
          <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">Register New Account</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-4">
              {success}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="email@ntpc.co.in"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Portal Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value} className="bg-white text-slate-900">
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.role === 'GUIDE_GM' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-white text-slate-900">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold tracking-wide shadow-lg shadow-orange-500/25 hover:shadow-orange-600/35 transition duration-250 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-500 font-semibold transition">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;