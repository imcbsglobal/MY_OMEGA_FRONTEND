import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Save, 
  TestTube, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  AlertCircle,
  Send,
  Eye,
  Copy,
  RefreshCw,
  Power,
  Phone,
  Mail,
  Activity,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  BarChart,
  Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/whatsapp/admin';

// ✅ FIXED: Helper function to extract list from DRF response
const extractList = (data) => {
  // If data is already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // If data has 'results' key (DRF paginated response), return results
  if (data && data.results && Array.isArray(data.results)) {
    return data.results;
  }
  
  // If data is a single object, wrap it in an array
  if (data && typeof data === 'object') {
    return [data];
  }
  
  // Otherwise return empty array
  return [];
};

const WhatsAppAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [configurations, setConfigurations] = useState([]);
  const [adminNumbers, setAdminNumbers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeConfig, setActiveConfig] = useState(null);
  const [stats, setStats] = useState({
    totalConfigs: 0,
    activeConfig: null,
    totalAdminNumbers: 0,
    activeAdminNumbers: 0,
    totalTemplates: 0,
    activeTemplates: 0,
    numbersByRole: {},
    systemStatus: 'Setup Required'
  });

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form states
  const [configForm, setConfigForm] = useState({
    provider: 'dxing',
    api_url: 'https://app.dxing.in/api/send/whatsapp',
    api_secret: '',
    account_id: '',
    default_priority: 1,
    is_active: true
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    phone_number: '',
    role: 'hr_admin',
    is_active: true,
    is_api_sender: false
  });

  const [templateForm, setTemplateForm] = useState({
    template_type: 'punch_in',
    recipient_type: 'both',
    template_text: '',
    is_active: true
  });

  const [testForm, setTestForm] = useState({
    test_number: '',
    test_message: '📱 Test message from WhatsApp Admin Panel'
  });

  const [previewContext, setPreviewContext] = useState({});

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate stats when data changes
  useEffect(() => {
    calculateStats();
  }, [configurations, adminNumbers, templates]);

  const calculateStats = () => {
    if (!Array.isArray(adminNumbers)) return;

    const numbersByRole = adminNumbers.reduce((acc, admin) => {
      if (admin.is_active && !admin.is_api_sender) {
        acc[admin.role] ??= [];
        acc[admin.role].push(admin);
      }
      return acc;
    }, {});

    const activeConf = configurations.find(c => c.is_active);
    const activeAdmins = adminNumbers.filter(a => a.is_active && !a.is_api_sender).length;
    const activeTemps = templates.filter(t => t.is_active).length;

    // Determine system status
    let systemStatus = 'Setup Required';
    if (activeConf && activeAdmins > 0 && activeTemps > 0) {
      systemStatus = 'Active';
    } else if (activeConf || activeAdmins > 0 || activeTemps > 0) {
      systemStatus = 'Partial Setup';
    }

    setStats({
      totalConfigs: configurations.length,
      activeConfig: activeConf,
      totalAdminNumbers: adminNumbers.length,
      activeAdminNumbers: activeAdmins,
      totalTemplates: templates.length,
      activeTemplates: activeTemps,
      numbersByRole,
      systemStatus
    });
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchConfigurations(),
        fetchAdminNumbers(),
        fetchTemplates()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/`);
      const data = await response.json();
      console.log('Configurations response:', data);
      setConfigurations(extractList(data));
    } catch (err) {
      console.error('Failed to fetch configurations:', err);
      setConfigurations([]);
    }
  };

  const fetchAdminNumbers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-numbers/`);
      const data = await response.json();
      console.log('Admin numbers response:', data);
      setAdminNumbers(extractList(data));
    } catch (err) {
      console.error('Failed to fetch admin numbers:', err);
      setAdminNumbers([]);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates/`);
      const data = await response.json();
      console.log('Templates response:', data);
      setTemplates(extractList(data));
    } catch (err) {
      console.error('Failed to fetch templates:', err);
      setTemplates([]);
    }
  };

  // Configuration handlers
  const handleSaveConfiguration = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = configForm.id ? 'PUT' : 'POST';
      const url = configForm.id 
        ? `${API_BASE_URL}/configurations/${configForm.id}/`
        : `${API_BASE_URL}/configurations/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(configForm)
      });

      if (response.ok) {
        setSuccess('Configuration saved successfully!');
        setShowConfigModal(false);
        fetchAllData();
        resetConfigForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || data.error || 'Failed to save configuration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateConfiguration = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/${id}/activate/`, {
        method: 'POST'
      });

      if (response.ok) {
        setSuccess('Configuration activated successfully!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to activate configuration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfiguration = async (id) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/${id}/`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        setSuccess('Configuration deleted successfully!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete configuration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfiguration = async (id) => {
    if (!testForm.test_number) {
      setError('Please enter a test phone number');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/${id}/test_connection/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testForm)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Test message sent successfully!');
        setShowTestModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.error || 'Failed to send test message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Number handlers
  const handleSaveAdminNumber = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = adminForm.id ? 'PUT' : 'POST';
      const url = adminForm.id 
        ? `${API_BASE_URL}/admin-numbers/${adminForm.id}/`
        : `${API_BASE_URL}/admin-numbers/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminForm)
      });

      if (response.ok) {
        setSuccess('Admin number saved successfully!');
        setShowAdminModal(false);
        fetchAllData();
        resetAdminForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || data.error || 'Failed to save admin number');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminNumber = async (id) => {
    if (!confirm('Are you sure you want to delete this admin number?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin-numbers/${id}/`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        setSuccess('Admin number deleted successfully!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete admin number');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Template handlers
  const handleSaveTemplate = async () => {
    setLoading(true);
    setError(null);
    try {
      const method = templateForm.id ? 'PUT' : 'POST';
      const url = templateForm.id 
        ? `${API_BASE_URL}/templates/${templateForm.id}/`
        : `${API_BASE_URL}/templates/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        setSuccess('Template saved successfully!');
        setShowTemplateModal(false);
        fetchAllData();
        resetTemplateForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || data.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/`, {
        method: 'DELETE'
      });

      if (response.ok || response.status === 204) {
        setSuccess('Template deleted successfully!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete template');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Form reset functions
  const resetConfigForm = () => {
    setConfigForm({
      provider: 'dxing',
      api_url: 'https://app.dxing.in/api/send/whatsapp',
      api_secret: '',
      account_id: '',
      default_priority: 1,
      is_active: true
    });
  };

  const resetAdminForm = () => {
    setAdminForm({
      name: '',
      phone_number: '',
      role: 'hr_admin',
      is_active: true,
      is_api_sender: false
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      template_type: 'punch_in',
      recipient_type: 'both',
      template_text: '',
      is_active: true
    });
  };

  // Edit handlers
  const handleEditConfiguration = (config) => {
    setConfigForm(config);
    setShowConfigModal(true);
  };

  const handleEditAdminNumber = (admin) => {
    setAdminForm(admin);
    setShowAdminModal(true);
  };

  const handleEditTemplate = (template) => {
    setTemplateForm(template);
    setShowTemplateModal(true);
  };

  return (
    <div className="whatsapp-admin-container">
      <div className="admin-header">
        <div className="header-content">
          <MessageSquare size={32} className="header-icon" />
          <h1>WhatsApp Admin Panel</h1>
        </div>
        <button className="btn btn-secondary" onClick={fetchAllData}>
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <XCircle size={20} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart size={20} />
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'configurations' ? 'active' : ''}`}
          onClick={() => setActiveTab('configurations')}
        >
          <Settings size={20} />
          Configurations
        </button>
        <button 
          className={`tab ${activeTab === 'admin-numbers' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin-numbers')}
        >
          <Users size={20} />
          Admin Numbers
        </button>
        <button 
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileText size={20} />
          Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              {/* Configurations Card */}
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e3f2fd' }}>
                  <Settings size={24} color="#1976d2" />
                </div>
                <div className="stat-details">
                  <h3>Configurations</h3>
                  <div className="stat-number">{stats.totalConfigs}</div>
                  <div className="stat-label">
                    {stats.activeConfig ? (
                      <span className="badge badge-success">
                        <CheckCircle size={14} />
                        Active Config
                      </span>
                    ) : (
                      <span className="badge badge-error">
                        <AlertCircle size={14} />
                        No active config
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Numbers Card */}
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#f3e5f5' }}>
                  <Users size={24} color="#7b1fa2" />
                </div>
                <div className="stat-details">
                  <h3>Admin Numbers</h3>
                  <div className="stat-number">{stats.activeAdminNumbers}</div>
                  <div className="stat-label">{stats.totalAdminNumbers} Total</div>
                </div>
              </div>

              {/* Templates Card */}
              <div className="stat-card">
                <div className="stat-icon" style={{ background: '#e8f5e9' }}>
                  <FileText size={24} color="#388e3c" />
                </div>
                <div className="stat-details">
                  <h3>Templates</h3>
                  <div className="stat-number">{stats.activeTemplates}</div>
                  <div className="stat-label">{stats.totalTemplates} Total</div>
                </div>
              </div>

              {/* System Status Card */}
              <div className="stat-card">
                <div className="stat-icon" style={{ background: stats.systemStatus === 'Active' ? '#e8f5e9' : '#fff3e0' }}>
                  <Activity size={24} color={stats.systemStatus === 'Active' ? '#388e3c' : '#f57c00'} />
                </div>
                <div className="stat-details">
                  <h3>System Status</h3>
                  <div className="stat-number">{stats.systemStatus}</div>
                  {stats.systemStatus === 'Setup Required' && (
                    <div className="stat-label">
                      <span className="badge badge-error">
                        <AlertCircle size={14} />
                        Setup Required
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Configuration Details */}
            {stats.activeConfig ? (
              <div className="config-details-section">
                <h2>⚡ Active Configuration</h2>
                <div className="config-details-card">
                  <div className="config-info-row">
                    <span className="label">Provider:</span>
                    <span className="value">{stats.activeConfig.provider.toUpperCase()}</span>
                  </div>
                  <div className="config-info-row">
                    <span className="label">API URL:</span>
                    <span className="value">{stats.activeConfig.api_url}</span>
                  </div>
                  <div className="config-info-row">
                    <span className="label">Account ID:</span>
                    <span className="value">{stats.activeConfig.account_id}</span>
                  </div>
                  <div className="config-info-row">
                    <span className="label">Priority:</span>
                    <span className="value">{stats.activeConfig.default_priority}</span>
                  </div>
                  <div className="config-info-row">
                    <span className="label">Status:</span>
                    <span className="badge badge-success">
                      <Power size={14} />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <Settings size={48} color="#999" />
                <h3>No Active Configuration</h3>
                <p>Please add and activate a WhatsApp configuration</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveTab('configurations');
                    setShowConfigModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Configuration
                </button>
              </div>
            )}

            {/* Active Admin Numbers by Role */}
            {stats.activeAdminNumbers > 0 && (
              <div className="admin-numbers-section">
                <h2>👥 Active Admin Numbers by Role</h2>
                <div className="role-grid">
                  {Object.entries(stats.numbersByRole).map(([role, admins]) => (
                    <div key={role} className="role-card">
                      <h4>{role.replace('_', ' ').toUpperCase()}</h4>
                      <div className="admin-list">
                        {admins.map(admin => (
                          <div key={admin.id} className="admin-item">
                            <Phone size={16} />
                            <span>{admin.name}</span>
                            <span className="phone-number">{admin.phone_number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Templates Summary */}
            {stats.activeTemplates > 0 && (
              <div className="templates-section">
                <h2>📋 Active Message Templates</h2>
                <div className="template-summary">
                  {templates.filter(t => t.is_active).map(template => (
                    <div key={template.id} className="template-summary-item">
                      <MessageSquare size={16} />
                      <span>{template.template_type_display || template.template_type}</span>
                      <span className="badge badge-info">
                        {template.recipient_type_display || template.recipient_type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configurations Tab */}
        {activeTab === 'configurations' && (
          <div className="configurations-section">
            <div className="section-header">
              <h2>⚙️ Active Configuration</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetConfigForm();
                  setShowConfigModal(true);
                }}
              >
                <Plus size={20} />
                Add Configuration
              </button>
            </div>

            {configurations.length === 0 ? (
              <div className="empty-state">
                <Settings size={48} color="#999" />
                <h3>No configurations found</h3>
                <p>Add your first WhatsApp configuration</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowConfigModal(true)}
                >
                  <Plus size={20} />
                  Create Configuration
                </button>
              </div>
            ) : (
              <div className="config-list">
                {configurations.map(config => (
                  <div key={config.id} className={`config-item ${config.is_active ? 'active' : ''}`}>
                    <div className="config-info">
                      <h3>{config.provider.toUpperCase()}</h3>
                      <p>{config.api_url}</p>
                      <span className="config-meta">Account: {config.account_id}</span>
                    </div>
                    <div className="config-actions">
                      {config.is_active ? (
                        <span className="badge badge-success">
                          <Power size={14} />
                          Active
                        </span>
                      ) : (
                        <button 
                          className="btn btn-small btn-secondary"
                          onClick={() => handleActivateConfiguration(config.id)}
                        >
                          <Power size={16} />
                          Activate
                        </button>
                      )}
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => {
                          setConfigForm(config);
                          setShowTestModal(true);
                        }}
                      >
                        <TestTube size={16} />
                        Test
                      </button>
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEditConfiguration(config)}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteConfiguration(config.id)}
                        disabled={config.is_active}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin Numbers Tab */}
        {activeTab === 'admin-numbers' && (
          <div className="admin-numbers-section">
            <div className="section-header">
              <h2>👥 Active Admin Numbers</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetAdminForm();
                  setShowAdminModal(true);
                }}
              >
                <Plus size={20} />
                Add Admin Number
              </button>
            </div>

            {adminNumbers.length === 0 ? (
              <div className="empty-state">
                <Users size={48} color="#999" />
                <h3>No admin numbers found</h3>
                <p>Add your first admin number</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAdminModal(true)}
                >
                  <Plus size={20} />
                  Add Admin Number
                </button>
              </div>
            ) : (
              <div className="admin-list-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone Number</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>API Sender</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminNumbers.map(admin => (
                      <tr key={admin.id}>
                        <td>{admin.name}</td>
                        <td>{admin.phone_number}</td>
                        <td>
                          <span className="badge badge-info">
                            {admin.role_display || admin.role}
                          </span>
                        </td>
                        <td>
                          {admin.is_active ? (
                            <span className="badge badge-success">
                              <CheckCircle size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="badge badge-error">
                              <XCircle size={14} />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>
                          {admin.is_api_sender ? (
                            <span className="badge badge-warning">Yes</span>
                          ) : (
                            <span className="badge badge-default">No</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-small btn-secondary"
                              onClick={() => handleEditAdminNumber(admin)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="btn btn-small btn-danger"
                              onClick={() => handleDeleteAdminNumber(admin.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="templates-section">
            <div className="section-header">
              <h2>📋 Message Templates</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  resetTemplateForm();
                  setShowTemplateModal(true);
                }}
              >
                <Plus size={20} />
                Add Template
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="empty-state">
                <FileText size={48} color="#999" />
                <h3>No templates found</h3>
                <p>Add your first message template</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <Plus size={20} />
                  Create Template
                </button>
              </div>
            ) : (
              <div className="template-grid">
                {templates.map(template => (
                  <div key={template.id} className={`template-card ${template.is_active ? 'active' : 'inactive'}`}>
                    <div className="template-header">
                      <h3>{template.template_type_display || template.template_type}</h3>
                      <span className={`badge ${template.is_active ? 'badge-success' : 'badge-default'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="template-content">
                      <div className="template-meta">
                        <span className="badge badge-info">
                          {template.recipient_type_display || template.recipient_type}
                        </span>
                      </div>
                      <pre className="template-text">{template.template_text}</pre>
                    </div>
                    <div className="template-actions">
                      <button 
                        className="btn btn-small btn-secondary"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{configForm.id ? 'Edit' : 'Add'} Configuration</h2>
              <button className="modal-close" onClick={() => setShowConfigModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Provider</label>
              <select 
                value={configForm.provider}
                onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value })}
              >
                <option value="dxing">DXING</option>
                <option value="twilio">Twilio</option>
                <option value="meta">Meta Cloud API</option>
              </select>
            </div>

            <div className="form-group">
              <label>API URL</label>
              <input 
                type="url"
                value={configForm.api_url}
                onChange={(e) => setConfigForm({ ...configForm, api_url: e.target.value })}
                placeholder="https://app.dxing.in/api/send/whatsapp"
              />
            </div>

            <div className="form-group">
              <label>API Secret</label>
              <input 
                type="password"
                value={configForm.api_secret}
                onChange={(e) => setConfigForm({ ...configForm, api_secret: e.target.value })}
                placeholder="Your API secret key"
              />
            </div>

            <div className="form-group">
              <label>Account ID</label>
              <input 
                type="text"
                value={configForm.account_id}
                onChange={(e) => setConfigForm({ ...configForm, account_id: e.target.value })}
                placeholder="Your account ID"
              />
            </div>

            <div className="form-group">
              <label>Default Priority (1-10)</label>
              <input 
                type="number"
                min="1"
                max="10"
                value={configForm.default_priority}
                onChange={(e) => setConfigForm({ ...configForm, default_priority: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group-checkbox">
              <input 
                type="checkbox"
                checked={configForm.is_active}
                onChange={(e) => setConfigForm({ ...configForm, is_active: e.target.checked })}
              />
              <label>Set as active configuration</label>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveConfiguration}
                disabled={loading}
              >
                <Save size={20} />
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Test Configuration</h2>
              <button className="modal-close" onClick={() => setShowTestModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Test Phone Number</label>
              <input 
                type="tel"
                value={testForm.test_number}
                onChange={(e) => setTestForm({ ...testForm, test_number: e.target.value })}
                placeholder="+918281561081"
              />
            </div>

            <div className="form-group">
              <label>Test Message</label>
              <textarea 
                value={testForm.test_message}
                onChange={(e) => setTestForm({ ...testForm, test_message: e.target.value })}
              />
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTestModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleTestConfiguration(configForm.id)}
                disabled={loading}
              >
                <TestTube size={20} />
                Send Test Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Number Modal */}
      {showAdminModal && (
        <div className="modal-overlay" onClick={() => setShowAdminModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{adminForm.id ? 'Edit' : 'Add'} Admin Number</h2>
              <button className="modal-close" onClick={() => setShowAdminModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Name</label>
              <input 
                type="text"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                placeholder="Admin name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="tel"
                value={adminForm.phone_number}
                onChange={(e) => setAdminForm({ ...adminForm, phone_number: e.target.value })}
                placeholder="+918281561081"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <select 
                value={adminForm.role}
                onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
              >
                <option value="hr_admin">HR Admin</option>
                <option value="manager">Manager</option>
                <option value="payroll_admin">Payroll Admin</option>
                <option value="global_cc">Global CC</option>
              </select>
            </div>

            <div className="form-group-checkbox">
              <input 
                type="checkbox"
                checked={adminForm.is_active}
                onChange={(e) => setAdminForm({ ...adminForm, is_active: e.target.checked })}
              />
              <label>Active (receives notifications)</label>
            </div>

            <div className="form-group-checkbox">
              <input 
                type="checkbox"
                checked={adminForm.is_api_sender}
                onChange={(e) => setAdminForm({ ...adminForm, is_api_sender: e.target.checked })}
              />
              <label>API Sender (exclude from notifications)</label>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveAdminNumber}
                disabled={loading}
              >
                <Save size={20} />
                Save Admin Number
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{templateForm.id ? 'Edit' : 'Add'} Message Template</h2>
              <button className="modal-close" onClick={() => setShowTemplateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="form-group">
              <label>Template Type</label>
              <select 
                value={templateForm.template_type}
                onChange={(e) => setTemplateForm({ ...templateForm, template_type: e.target.value })}
              >
                <option value="punch_in">Punch In</option>
                <option value="punch_out">Punch Out</option>
                <option value="leave_request">Leave Request</option>
                <option value="leave_approval">Leave Approval</option>
                <option value="leave_rejection">Leave Rejection</option>
                <option value="late_request">Late Request</option>
                <option value="late_approval">Late Approval</option>
                <option value="late_rejection">Late Rejection</option>
                <option value="early_request">Early Request</option>
                <option value="early_approval">Early Approval</option>
                <option value="early_rejection">Early Rejection</option>
                <option value="generic_notification">Generic Notification</option>
              </select>
            </div>

            <div className="form-group">
              <label>Recipient Type</label>
              <select 
                value={templateForm.recipient_type}
                onChange={(e) => setTemplateForm({ ...templateForm, recipient_type: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin/HR</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label>Template Text</label>
              <textarea 
                value={templateForm.template_text}
                onChange={(e) => setTemplateForm({ ...templateForm, template_text: e.target.value })}
                placeholder="Use variables like {employee_name}, {date}, {time}, etc."
                rows={8}
              />
              <small>Available variables: {'{employee_name}'}, {'{date}'}, {'{time}'}, {'{location}'}, {'{reason}'}, {'{leave_type}'}, {'{days}'}, {'{status}'}, {'{approver_name}'}</small>
            </div>

            <div className="form-group-checkbox">
              <input 
                type="checkbox"
                checked={templateForm.is_active}
                onChange={(e) => setTemplateForm({ ...templateForm, is_active: e.target.checked })}
              />
              <label>Active (use this template)</label>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveTemplate}
                disabled={loading}
              >
                <Save size={20} />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhatsAppAdminPanel;