import {
  AlertCircle,
  Bell,
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Edit,
  Eye,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
  X
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import './App.css';

const JobTrackerApp = () => {
  // State Management
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add', 'edit', 'view'
  const [selectedJob, setSelectedJob] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    appliedDate: '',
    notes: ''
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sortBy: 'dateDesc'
  });
  
  // Auth state
  const [authMode, setAuthMode] = useState('login');
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Demo users
  const demoUsers = [
    { id: 1, email: 'admin@demo.com', password: 'password123', name: 'Admin User', role: 'admin' },
    { id: 2, email: 'user@demo.com', password: 'password123', name: 'John Doe', role: 'user' }
  ];

  // Demo jobs
  const demoJobs = [
    {
      id: 1,
      userId: 2,
      company: 'Google',
      role: 'Frontend Developer',
      status: 'Interview',
      appliedDate: '2025-06-10',
      notes: 'Had initial phone screening. Technical interview scheduled for next week.',
      createdAt: new Date('2025-06-10')
    },
    {
      id: 2,
      userId: 2,
      company: 'Microsoft',
      role: 'Full Stack Developer',
      status: 'Applied',
      appliedDate: '2025-06-15',
      notes: 'Applied through LinkedIn. Waiting for response.',
      createdAt: new Date('2025-06-15')
    },
    {
      id: 3,
      userId: 2,
      company: 'Apple',
      role: 'Software Engineer',
      status: 'Offer',
      appliedDate: '2025-06-01',
      notes: 'Completed all rounds. Received offer letter.',
      createdAt: new Date('2025-06-01')
    }
  ];

  // Initialize app
  useEffect(() => {
    setJobs(demoJobs);
    setFormData({
      ...formData,
      appliedDate: new Date().toISOString().split('T')[0]
    });
  }, []);

  // Filter jobs
  useEffect(() => {
    let filtered = jobs.filter(job => {
      if (currentUser?.role !== 'admin' && job.userId !== currentUser?.id) {
        return false;
      }
      
      if (filters.search && 
          !job.company.toLowerCase().includes(filters.search.toLowerCase()) && 
          !job.role.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      if (filters.status && job.status !== filters.status) {
        return false;
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'dateAsc':
          return new Date(a.appliedDate) - new Date(b.appliedDate);
        case 'dateDesc':
          return new Date(b.appliedDate) - new Date(a.appliedDate);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'role':
          return a.role.localeCompare(b.role);
        default:
          return new Date(b.appliedDate) - new Date(a.appliedDate);
      }
    });

    setFilteredJobs(filtered);
  }, [jobs, filters, currentUser]);

  // Add notification
  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  // Authentication
  const handleAuth = () => {
    
    if (authMode === 'signup') {
      // For demo, just switch to login
      addNotification('For demo purposes, use existing credentials', 'info');
      setAuthMode('login');
      return;
    }

    const user = demoUsers.find(u => 
      u.email === authData.email && u.password === authData.password
    );

    if (user) {
      setCurrentUser(user);
      addNotification(`Welcome back, ${user.name}!`, 'success');
      
      // Simulate real-time notification
      setTimeout(() => {
        addNotification('You have 3 job applications pending review', 'info');
      }, 2000);
    } else {
      addNotification('Invalid credentials', 'error');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setAuthData({ email: '', password: '', name: '' });
    addNotification('Logged out successfully', 'info');
  };

  // Job CRUD operations
  const openModal = (type, job = null) => {
    setModalType(type);
    setSelectedJob(job);
    
    if (type === 'add') {
      setFormData({
        company: '',
        role: '',
        status: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } else if (job) {
      setFormData({
        company: job.company,
        role: job.role,
        status: job.status,
        appliedDate: job.appliedDate,
        notes: job.notes || ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleJobSubmit = () => {
    
    // Validation
    if (!formData.company.trim() || !formData.role.trim()) {
      addNotification('Company and role are required', 'error');
      return;
    }

    if (new Date(formData.appliedDate) > new Date()) {
      addNotification('Applied date cannot be in the future', 'error');
      return;
    }

    const jobData = {
      ...formData,
      userId: currentUser.id,
      createdAt: new Date()
    };

    if (modalType === 'edit' && selectedJob) {
      setJobs(prev => prev.map(job => 
        job.id === selectedJob.id ? { ...job, ...jobData } : job
      ));
      addNotification('Job application updated successfully!', 'success');
    } else {
      jobData.id = Date.now();
      setJobs(prev => [...prev, jobData]);
      addNotification('Job application added successfully!', 'success');
      
      setTimeout(() => {
        addNotification(`New application for ${jobData.role} at ${jobData.company} has been tracked`, 'info');
      }, 1000);
    }

    closeModal();
  };

  const deleteJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setJobs(prev => prev.filter(j => j.id !== jobId));
      addNotification(`Job application for ${job.role} at ${job.company} deleted`, 'success');
    }
  };

  // Get statistics
  const getStats = () => {
    const userJobs = jobs.filter(j => currentUser?.role === 'admin' || j.userId === currentUser?.id);
    return {
      total: userJobs.length,
      interviews: userJobs.filter(j => j.status === 'Interview').length,
      offers: userJobs.filter(j => j.status === 'Offer').length,
      accepted: userJobs.filter(j => j.status === 'Accepted').length
    };
  };

  const stats = getStats();

  // Status badge colors
  const getStatusColor = (status) => {
    const colors = {
      'Applied': 'bg-blue-100 text-blue-800',
      'Interview': 'bg-purple-100 text-purple-800',
      'Offer': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Accepted': 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If not authenticated, show login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
            <p className="text-gray-600 mt-2">
              {authMode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <div className="space-y-6">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={authData.name}
                  onChange={(e) => setAuthData({...authData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({...authData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={authData.password}
                onChange={(e) => setAuthData({...authData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              onClick={handleAuth}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">Demo Credentials:</p>
            <p className="text-xs text-gray-600 text-center">admin@demo.com / password123</p>
            <p className="text-xs text-gray-600 text-center">user@demo.com / password123</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Job Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-900" />
                {notifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                {currentUser.role === 'admin' && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Admin</span>
                )}
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Applications</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Interviews</p>
                <p className="text-3xl font-bold">{stats.interviews}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Offers</p>
                <p className="text-3xl font-bold">{stats.offers}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Accepted</p>
                <p className="text-3xl font-bold">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
                <option value="Accepted">Accepted</option>
              </select>
              
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="dateDesc">Latest First</option>
                <option value="dateAsc">Oldest First</option>
                <option value="company">Company A-Z</option>
                <option value="role">Role A-Z</option>
              </select>
            </div>
            
            <button
              onClick={() => openModal('add')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add Job</span>
            </button>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No job applications found</h3>
            <p className="text-gray-600 mb-6">Start tracking your job applications by adding your first one!</p>
            <button
              onClick={() => openModal('add')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Add Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.role}</h3>
                      <div className="flex items-center text-blue-600 mb-2">
                        <Building className="w-4 h-4 mr-1" />
                        <span className="font-medium">{job.company}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Applied: {formatDate(job.appliedDate)}</span>
                    </div>
                    
                    {currentUser.role === 'admin' && (
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>User: {demoUsers.find(u => u.id === job.userId)?.name || 'Unknown'}</span>
                      </div>
                    )}
                    
                    {job.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">{job.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('view', job)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => openModal('edit', job)}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this job application?')) {
                          deleteJob(job.id);
                        }
                      }}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalType === 'add' && 'Add New Job Application'}
                {modalType === 'edit' && 'Edit Job Application'}
                {modalType === 'view' && 'Job Application Details'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {modalType === 'view' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <p className="text-gray-900">{selectedJob?.company}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <p className="text-gray-900">{selectedJob?.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedJob?.status)}`}>
                      {selectedJob?.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Applied Date</label>
                    <p className="text-gray-900">{formatDate(selectedJob?.appliedDate)}</p>
                  </div>
                  {selectedJob?.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <p className="text-gray-900">{selectedJob.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Role *</label>
                    <input
                      type="text"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Accepted">Accepted</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Applied Date *</label>
                    <input
                      type="date"
                      value={formData.appliedDate}
                      onChange={(e) => setFormData({...formData, appliedDate: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleJobSubmit}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Application</span>
                    </button>
                    
                    <button
                      onClick={closeModal}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`px-6 py-4 rounded-lg shadow-lg text-white max-w-sm transform transition-all duration-300 ${
              notification.type === 'success' ? 'bg-green-500' :
              notification.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {notification.type === 'info' && <Bell className="w-5 h-5" />}
              <span className="text-sm font-medium">{notification.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return <JobTrackerApp />;
}

export default App;