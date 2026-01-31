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
  Info,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000/api/whatsapp/admin';

// Helper function to extract list from DRF response
const extractList = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data && typeof data === 'object') return [data];
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
  const [editingId, setEditingId] = useState(null);

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
        acc[admin.role] = acc[admin.role] || [];
        acc[admin.role].push(admin);
      }
      return acc;
    }, {});

    const activeConf = configurations.find(c => c.is_active);
    const activeAdmins = adminNumbers.filter(a => a.is_active && !a.is_api_sender).length;
    const activeTemps = templates.filter(t => t.is_active).length;

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
        headers: { 'Content-Type': 'application/json' },
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

  const handleDeleteConfiguration = async (id) => {
    if (!confirm('Delete this configuration?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/${id}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Configuration deleted!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConfiguration = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/configurations/${id}/test_connection/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm)
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(data.message || 'Test message sent successfully!');
        setShowTestModal(false);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError('Network error during test');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });

      if (response.ok) {
        setSuccess('Admin number saved!');
        setShowAdminModal(false);
        fetchAllData();
        resetAdminForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save admin number');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminNumber = async (id) => {
    if (!confirm('Delete this admin number?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin-numbers/${id}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Admin number deleted!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete');
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        setSuccess('Template saved!');
        setShowTemplateModal(false);
        fetchAllData();
        resetTemplateForm();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save template');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/templates/${id}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Template deleted!');
        fetchAllData();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewTemplate = (template) => {
    const sampleContext = {
      employee_name: 'John Doe',
      action: 'PUNCH IN',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      location: 'Office',
      reason: 'Personal work',
      leave_type: 'Casual Leave',
      days: '2',
      from_date: '2024-01-15',
      to_date: '2024-01-16',
      status: 'Approved',
      approver_name: 'Jane Smith',
      late_by: '15 minutes',
      early_by: '30 minutes',
      message: 'This is a sample notification'
    };

    let preview = template.template_text;
    Object.keys(sampleContext).forEach(key => {
      const placeholder = `{${key}}`;
      preview = preview.replace(new RegExp(placeholder, 'g'), sampleContext[key]);
    });

    setPreviewContext({ template, preview });
    setShowPreviewModal(true);
  };

  // Reset forms
  const resetConfigForm = () => {
    setConfigForm({
      provider: 'dxing',
      api_url: 'https://app.dxing.in/api/send/whatsapp',
      api_secret: '',
      account_id: '',
      default_priority: 1,
      is_active: true
    });
    setEditingId(null);
  };

  const resetAdminForm = () => {
    setAdminForm({
      name: '',
      phone_number: '',
      role: 'hr_admin',
      is_active: true,
      is_api_sender: false
    });
    setEditingId(null);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      template_type: 'punch_in',
      recipient_type: 'both',
      template_text: '',
      is_active: true
    });
    setEditingId(null);
  };

  // Edit handlers
  const editConfiguration = (config) => {
    setConfigForm(config);
    setEditingId(config.id);
    setShowConfigModal(true);
  };

  const editAdminNumber = (admin) => {
    setAdminForm(admin);
    setEditingId(admin.id);
    setShowAdminModal(true);
  };

  const editTemplate = (template) => {
    setTemplateForm(template);
    setEditingId(template.id);
    setShowTemplateModal(true);
  };

  const getRoleColor = (role) => {
    const colors = {
      hr_admin: '#10b981',
      manager: '#3b82f6',
      payroll_admin: '#f59e0b',
      global_cc: '#8b5cf6'
    };
    return colors[role] || '#6b7280';
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? '#10b981' : status === 'Partial Setup' ? '#f59e0b' : '#ef4444';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logoContainer}>
              <MessageSquare size={32} color="#25D366" />
              <Sparkles size={16} color="#25D366" style={styles.sparkle} />
            </div>
            <div>
              <h1 style={styles.title}>WhatsApp Admin</h1>
              <p style={styles.subtitle}>Communication Control Center</p>
            </div>
          </div>
          <div style={styles.statusBadge}>
            <Activity size={16} />
            <span style={{
              ...styles.statusText,
              color: getStatusColor(stats.systemStatus)
            }}>
              {stats.systemStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{...styles.alert, ...styles.alertError}}>
          <AlertCircle size={20} />
          <span>{error}</span>
          <button style={styles.alertClose} onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div style={{...styles.alert, ...styles.alertSuccess}}>
          <CheckCircle size={20} />
          <span>{success}</span>
          <button style={styles.alertClose} onClick={() => setSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div style={styles.main}>
        {/* Sidebar Navigation */}
        <div style={styles.sidebar}>
          <div style={styles.navSection}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                ...styles.navButton,
                ...(activeTab === 'overview' ? styles.navButtonActive : {})
              }}
            >
              <BarChart size={20} />
              <span>Overview</span>
              {activeTab === 'overview' && <ChevronRight size={16} />}
            </button>

            <button
              onClick={() => setActiveTab('configurations')}
              style={{
                ...styles.navButton,
                ...(activeTab === 'configurations' ? styles.navButtonActive : {})
              }}
            >
              <Settings size={20} />
              <span>Configuration</span>
              {activeTab === 'configurations' && <ChevronRight size={16} />}
            </button>

            <button
              onClick={() => setActiveTab('admin-numbers')}
              style={{
                ...styles.navButton,
                ...(activeTab === 'admin-numbers' ? styles.navButtonActive : {})
              }}
            >
              <Users size={20} />
              <span>Admin Numbers</span>
              {activeTab === 'admin-numbers' && <ChevronRight size={16} />}
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              style={{
                ...styles.navButton,
                ...(activeTab === 'templates' ? styles.navButtonActive : {})
              }}
            >
              <FileText size={20} />
              <span>Templates</span>
              {activeTab === 'templates' && <ChevronRight size={16} />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div style={styles.content}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div style={styles.tabContent}>
              <h2 style={styles.tabTitle}>System Overview</h2>
              
              <div style={styles.statsGrid}>
                <div style={{...styles.statCard, ...styles.statCardPrimary}}>
                  <div style={styles.statIcon}>
                    <Settings size={24} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{stats.totalConfigs}</div>
                    <div style={styles.statLabel}>Configurations</div>
                  </div>
                  {stats.activeConfig && (
                    <div style={styles.statBadge}>
                      <Zap size={12} />
                      <span>Active</span>
                    </div>
                  )}
                </div>

                <div style={{...styles.statCard, ...styles.statCardSuccess}}>
                  <div style={styles.statIcon}>
                    <Users size={24} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{stats.activeAdminNumbers}</div>
                    <div style={styles.statLabel}>Active Admins</div>
                  </div>
                </div>

                <div style={{...styles.statCard, ...styles.statCardInfo}}>
                  <div style={styles.statIcon}>
                    <MessageSquare size={24} />
                  </div>
                  <div style={styles.statContent}>
                    <div style={styles.statValue}>{stats.activeTemplates}</div>
                    <div style={styles.statLabel}>Active Templates</div>
                  </div>
                </div>
              </div>

              {/* Active Configuration */}
              {stats.activeConfig && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Active Configuration</h3>
                  <div style={styles.configCard}>
                    <div style={styles.configHeader}>
                      <div style={styles.providerBadge}>
                        {stats.activeConfig.provider.toUpperCase()}
                      </div>
                      <div style={styles.configStatus}>
                        <Power size={16} color="#10b981" />
                        <span>Live</span>
                      </div>
                    </div>
                    <div style={styles.configDetails}>
                      <div style={styles.configDetail}>
                        <span style={styles.configLabel}>API URL:</span>
                        <span style={styles.configValue}>{stats.activeConfig.api_url}</span>
                      </div>
                      <div style={styles.configDetail}>
                        <span style={styles.configLabel}>Account ID:</span>
                        <span style={styles.configValue}>{stats.activeConfig.account_id}</span>
                      </div>
                      <div style={styles.configDetail}>
                        <span style={styles.configLabel}>Priority:</span>
                        <span style={styles.configValue}>{stats.activeConfig.default_priority}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Numbers by Role */}
              {Object.keys(stats.numbersByRole).length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Admin Distribution</h3>
                  <div style={styles.roleGrid}>
                    {Object.entries(stats.numbersByRole).map(([role, admins]) => (
                      <div key={role} style={styles.roleCard}>
                        <div style={styles.roleHeader}>
                          <Shield size={20} style={{ color: getRoleColor(role) }} />
                          <span style={styles.roleTitle}>
                            {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </span>
                        </div>
                        <div style={styles.roleCount}>{admins.length}</div>
                        <div style={styles.roleList}>
                          {admins.slice(0, 3).map(admin => (
                            <div key={admin.id} style={styles.roleItem}>
                              <Phone size={12} />
                              <span>{admin.name}</span>
                            </div>
                          ))}
                          {admins.length > 3 && (
                            <div style={styles.roleMore}>+{admins.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configurations Tab */}
          {activeTab === 'configurations' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>API Configurations</h2>
                <button 
                  style={styles.primaryButton}
                  onClick={() => {
                    resetConfigForm();
                    setShowConfigModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Configuration
                </button>
              </div>

              <div style={styles.cardGrid}>
                {configurations.map(config => (
                  <div key={config.id} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <div style={styles.providerBadge}>
                        {config.provider.toUpperCase()}
                      </div>
                      {config.is_active && (
                        <div style={styles.activeBadge}>
                          <Zap size={12} />
                          Active
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.cardBody}>
                      <div style={styles.cardField}>
                        <span style={styles.fieldLabel}>API URL</span>
                        <span style={styles.fieldValue}>{config.api_url}</span>
                      </div>
                      <div style={styles.cardField}>
                        <span style={styles.fieldLabel}>Account ID</span>
                        <span style={styles.fieldValue}>{config.account_id}</span>
                      </div>
                      <div style={styles.cardField}>
                        <span style={styles.fieldLabel}>Priority</span>
                        <span style={styles.fieldValue}>{config.default_priority}</span>
                      </div>
                    </div>

                    <div style={styles.cardActions}>
                      <button 
                        style={styles.iconButton}
                        onClick={() => {
                          setConfigForm(config);
                          setShowTestModal(true);
                        }}
                      >
                        <TestTube size={18} />
                      </button>
                      <button 
                        style={styles.iconButton}
                        onClick={() => editConfiguration(config)}
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        style={{...styles.iconButton, ...styles.iconButtonDanger}}
                        onClick={() => handleDeleteConfiguration(config.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Numbers Tab */}
          {activeTab === 'admin-numbers' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Admin Phone Numbers</h2>
                <button 
                  style={styles.primaryButton}
                  onClick={() => {
                    resetAdminForm();
                    setShowAdminModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Admin Number
                </button>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.tableHeader}>Name</th>
                      <th style={styles.tableHeader}>Phone Number</th>
                      <th style={styles.tableHeader}>Role</th>
                      <th style={styles.tableHeader}>Status</th>
                      <th style={styles.tableHeader}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminNumbers.map(admin => (
                      <tr key={admin.id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={styles.nameCell}>
                            <div style={styles.avatar}>
                              {admin.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{admin.name}</span>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.phoneCell}>
                            <Phone size={14} />
                            {admin.phone_number}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <div 
                            style={{
                              ...styles.roleBadge,
                              backgroundColor: getRoleColor(admin.role) + '20',
                              color: getRoleColor(admin.role)
                            }}
                          >
                            {admin.role_display || admin.role}
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          {admin.is_active ? (
                            <div style={styles.statusActive}>
                              <CheckCircle size={14} />
                              Active
                            </div>
                          ) : (
                            <div style={styles.statusInactive}>
                              <XCircle size={14} />
                              Inactive
                            </div>
                          )}
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.actionButtons}>
                            <button 
                              style={styles.iconButton}
                              onClick={() => editAdminNumber(admin)}
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              style={{...styles.iconButton, ...styles.iconButtonDanger}}
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
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div style={styles.tabContent}>
              <div style={styles.tabHeader}>
                <h2 style={styles.tabTitle}>Message Templates</h2>
                <button 
                  style={styles.primaryButton}
                  onClick={() => {
                    resetTemplateForm();
                    setShowTemplateModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Template
                </button>
              </div>

              <div style={styles.templateGrid}>
                {templates.map(template => (
                  <div key={template.id} style={styles.templateCard}>
                    <div style={styles.templateHeader}>
                      <div>
                        <h3 style={styles.templateTitle}>
                          {template.template_type_display || template.template_type}
                        </h3>
                        <span style={styles.templateSubtitle}>
                          {template.recipient_type_display || template.recipient_type}
                        </span>
                      </div>
                      {template.is_active && (
                        <div style={styles.activeBadge}>
                          <Zap size={12} />
                          Active
                        </div>
                      )}
                    </div>

                    <div style={styles.templateBody}>
                      <pre style={styles.templateText}>{template.template_text}</pre>
                    </div>

                    <div style={styles.templateActions}>
                      <button 
                        style={styles.secondaryButton}
                        onClick={() => handlePreviewTemplate(template)}
                      >
                        <Eye size={16} />
                        Preview
                      </button>
                      <button 
                        style={styles.iconButton}
                        onClick={() => editTemplate(template)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        style={{...styles.iconButton, ...styles.iconButtonDanger}}
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showConfigModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfigModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? 'Edit' : 'Add'} Configuration
              </h2>
              <button style={styles.modalClose} onClick={() => setShowConfigModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Provider</label>
                <select 
                  style={styles.select}
                  value={configForm.provider}
                  onChange={(e) => setConfigForm({...configForm, provider: e.target.value})}
                >
                  <option value="dxing">DXING</option>
                  <option value="twilio">Twilio</option>
                  <option value="meta">Meta Cloud API</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>API URL</label>
                <input 
                  type="url"
                  style={styles.input}
                  value={configForm.api_url}
                  onChange={(e) => setConfigForm({...configForm, api_url: e.target.value})}
                  placeholder="https://app.dxing.in/api/send/whatsapp"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>API Secret</label>
                <input 
                  type="password"
                  style={styles.input}
                  value={configForm.api_secret}
                  onChange={(e) => setConfigForm({...configForm, api_secret: e.target.value})}
                  placeholder="Your API secret key"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Account ID</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={configForm.account_id}
                  onChange={(e) => setConfigForm({...configForm, account_id: e.target.value})}
                  placeholder="Your account ID"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Default Priority (1-10)</label>
                <input 
                  type="number"
                  style={styles.input}
                  value={configForm.default_priority}
                  onChange={(e) => setConfigForm({...configForm, default_priority: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                />
              </div>

              <div style={styles.checkboxGroup}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={configForm.is_active}
                  onChange={(e) => setConfigForm({...configForm, is_active: e.target.checked})}
                />
                <label style={styles.checkboxLabel}>Set as active configuration</label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.secondaryButton}
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.primaryButton}
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

      {showAdminModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAdminModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? 'Edit' : 'Add'} Admin Number
              </h2>
              <button style={styles.modalClose} onClick={() => setShowAdminModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input 
                  type="text"
                  style={styles.input}
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                  placeholder="Admin name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number</label>
                <input 
                  type="tel"
                  style={styles.input}
                  value={adminForm.phone_number}
                  onChange={(e) => setAdminForm({...adminForm, phone_number: e.target.value})}
                  placeholder="+918281561081"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select 
                  style={styles.select}
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({...adminForm, role: e.target.value})}
                >
                  <option value="hr_admin">HR Admin</option>
                  <option value="manager">Manager</option>
                  <option value="payroll_admin">Payroll Admin</option>
                  <option value="global_cc">Global CC</option>
                </select>
              </div>

              <div style={styles.checkboxGroup}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={adminForm.is_active}
                  onChange={(e) => setAdminForm({...adminForm, is_active: e.target.checked})}
                />
                <label style={styles.checkboxLabel}>Active (receives notifications)</label>
              </div>

              <div style={styles.checkboxGroup}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={adminForm.is_api_sender}
                  onChange={(e) => setAdminForm({...adminForm, is_api_sender: e.target.checked})}
                />
                <label style={styles.checkboxLabel}>API Sender (exclude from notifications)</label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.secondaryButton}
                onClick={() => setShowAdminModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.primaryButton}
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

      {showTemplateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTemplateModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingId ? 'Edit' : 'Add'} Message Template
              </h2>
              <button style={styles.modalClose} onClick={() => setShowTemplateModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Template Type</label>
                <select 
                  style={styles.select}
                  value={templateForm.template_type}
                  onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
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

              <div style={styles.formGroup}>
                <label style={styles.label}>Recipient Type</label>
                <select 
                  style={styles.select}
                  value={templateForm.recipient_type}
                  onChange={(e) => setTemplateForm({...templateForm, recipient_type: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin/HR</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Template Text</label>
                <textarea 
                  style={styles.textarea}
                  value={templateForm.template_text}
                  onChange={(e) => setTemplateForm({...templateForm, template_text: e.target.value})}
                  placeholder="Use variables like {employee_name}, {date}, {time}, etc."
                  rows={8}
                />
                <small style={styles.hint}>
                  Available: {'{employee_name}'}, {'{date}'}, {'{time}'}, {'{location}'}, {'{reason}'}, {'{leave_type}'}, {'{days}'}, {'{status}'}, {'{approver_name}'}
                </small>
              </div>

              <div style={styles.checkboxGroup}>
                <input 
                  type="checkbox"
                  style={styles.checkbox}
                  checked={templateForm.is_active}
                  onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.checked})}
                />
                <label style={styles.checkboxLabel}>Active (use this template)</label>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.secondaryButton}
                onClick={() => setShowTemplateModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.primaryButton}
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

      {showTestModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTestModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Test Configuration</h2>
              <button style={styles.modalClose} onClick={() => setShowTestModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Test Phone Number</label>
                <input 
                  type="tel"
                  style={styles.input}
                  value={testForm.test_number}
                  onChange={(e) => setTestForm({...testForm, test_number: e.target.value})}
                  placeholder="+918281561081"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Test Message</label>
                <textarea 
                  style={styles.textarea}
                  value={testForm.test_message}
                  onChange={(e) => setTestForm({...testForm, test_message: e.target.value})}
                  rows={4}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.secondaryButton}
                onClick={() => setShowTestModal(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.primaryButton}
                onClick={() => handleTestConfiguration(configForm.id)}
                disabled={loading}
              >
                <Send size={20} />
                Send Test Message
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPreviewModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Template Preview</h2>
              <button style={styles.modalClose} onClick={() => setShowPreviewModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.previewContainer}>
                <div style={styles.previewLabel}>With Sample Data:</div>
                <div style={styles.previewBox}>
                  <pre style={styles.previewText}>{previewContext.preview}</pre>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button 
                style={styles.primaryButton}
                onClick={() => setShowPreviewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    fontFamily: '"Outfit", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#1e293b',
  },
  
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '1.5rem 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  headerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  
  logoContainer: {
    position: 'relative',
    animation: 'pulse 2s ease-in-out infinite',
  },
  
  sparkle: {
    position: 'absolute',
    top: -4,
    right: -4,
    animation: 'sparkle 1.5s ease-in-out infinite',
  },
  
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '-0.02em',
  },
  
  subtitle: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
  
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  
  statusText: {
    fontWeight: 700,
  },
  
  alert: {
    maxWidth: '1600px',
    margin: '1.5rem auto',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    animation: 'slideDown 0.3s ease-out',
  },
  
  alertError: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  
  alertSuccess: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#6ee7b7',
  },
  
  alertClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    opacity: 0.7,
  },
  
  main: {
    maxWidth: '1600px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '2rem',
    padding: '2rem',
    minHeight: 'calc(100vh - 120px)',
  },
  
  sidebar: {
    position: 'sticky',
    top: '120px',
    height: 'fit-content',
  },
  
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#64748b',
    fontSize: '0.9375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
    width: '100%',
    justifyContent: 'flex-start',
  },
  
  navButtonActive: {
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1) 0%, rgba(18, 140, 126, 0.1) 100%)',
    border: '1px solid #25D366',
    color: '#128C7E',
    fontWeight: 600,
    transform: 'translateX(8px)',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.15)',
  },
  
  content: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '2rem',
    minHeight: '600px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  tabContent: {
    animation: 'fadeIn 0.4s ease-out',
  },
  
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  
  tabTitle: {
    margin: 0,
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(37, 211, 102, 0.25)',
  },
  
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#475569',
    fontSize: '0.9375rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
  },
  
  iconButton: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconButtonDanger: {
    color: '#ef4444',
    borderColor: '#fee2e2',
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  statCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  statCardPrimary: {
    borderColor: '#a7f3d0',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
  },
  
  statCardSuccess: {
    borderColor: '#86efac',
    background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
  },
  
  statCardInfo: {
    borderColor: '#bfdbfe',
    background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
  },
  
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.15) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#128C7E',
  },
  
  statContent: {
    flex: 1,
  },
  
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: '0.25rem',
  },
  
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
  
  statBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.75rem',
    background: 'rgba(37, 211, 102, 0.15)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#128C7E',
  },
  
  section: {
    marginBottom: '2rem',
  },
  
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '1rem',
  },
  
  configCard: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  
  configHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  
  providerBadge: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.15) 0%, rgba(18, 140, 126, 0.15) 100%)',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 700,
    color: '#128C7E',
  },
  
  configStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#10b981',
  },
  
  configDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  
  configDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#ffffff',
    borderRadius: '8px',
  },
  
  configLabel: {
    color: '#64748b',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  
  configValue: {
    color: '#0f172a',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  
  roleCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  roleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  
  roleTitle: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: '#0f172a',
  },
  
  roleCount: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#128C7E',
    marginBottom: '0.75rem',
  },
  
  roleList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#64748b',
  },
  
  roleMore: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 600,
    marginTop: '0.25rem',
  },
  
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  
  activeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.375rem 0.75rem',
    background: 'rgba(37, 211, 102, 0.15)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#128C7E',
  },
  
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  
  cardField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  
  fieldLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  
  fieldValue: {
    fontSize: '0.9375rem',
    color: '#0f172a',
    fontWeight: 500,
  },
  
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  
  tableContainer: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  
  tableHeader: {
    padding: '1rem 1.5rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  
  tableRow: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'all 0.2s',
  },
  
  tableCell: {
    padding: '1rem 1.5rem',
    fontSize: '0.9375rem',
    color: '#1e293b',
  },
  
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(18, 140, 126, 0.2) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#128C7E',
  },
  
  phoneCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#64748b',
  },
  
  roleBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontWeight: 600,
    display: 'inline-block',
  },
  
  statusActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#10b981',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  
  statusInactive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  
  templateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  
  templateCard: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  
  templateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  
  templateTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 0.25rem 0',
  },
  
  templateSubtitle: {
    fontSize: '0.8125rem',
    color: '#64748b',
    fontWeight: 500,
  },
  
  templateBody: {
    flex: 1,
    background: '#f8fafc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
  },
  
  templateText: {
    margin: 0,
    fontSize: '0.875rem',
    color: '#475569',
    lineHeight: 1.6,
    fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace',
    whiteSpace: 'pre-wrap',
  },
  
  templateActions: {
    display: 'flex',
    gap: '0.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    animation: 'fadeIn 0.2s ease-out',
  },
  
  modal: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  modalHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#0f172a',
  },
  
  modalClose: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  
  modalBody: {
    padding: '2rem',
  },
  
  modalFooter: {
    padding: '1.5rem 2rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    background: '#f8fafc',
  },
  
  formGroup: {
    marginBottom: '1.5rem',
  },
  
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#334155',
    marginBottom: '0.5rem',
  },
  
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    outline: 'none',
  },
  
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
  },
  
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#1e293b',
    fontSize: '0.9375rem',
    fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
    resize: 'vertical',
    lineHeight: 1.6,
    outline: 'none',
  },
  
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  
  checkboxLabel: {
    fontSize: '0.9375rem',
    color: '#334155',
    fontWeight: 500,
    cursor: 'pointer',
  },
  
  hint: {
    display: 'block',
    marginTop: '0.5rem',
    fontSize: '0.8125rem',
    color: '#64748b',
    lineHeight: 1.5,
  },
  
  previewContainer: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
  },
  
  previewLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '0.75rem',
  },
  
  previewBox: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem',
  },
  
  previewText: {
    margin: 0,
    fontSize: '0.9375rem',
    color: '#1e293b',
    lineHeight: 1.6,
    fontFamily: 'ui-monospace, "Cascadia Code", Menlo, monospace',
    whiteSpace: 'pre-wrap',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @keyframes sparkle {
    0%, 100% {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.2) rotate(180deg);
    }
  }
`;
document.head.appendChild(styleSheet);

export default WhatsAppAdminPanel;