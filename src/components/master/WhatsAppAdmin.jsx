import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Send,
  Trash2,
  Power,
  TestTube,
  Settings,
  Users,
  FileText,
  RotateCcw,
  X
} from "lucide-react";

const API_BASE = "/api/whatsapp/admin";

export default function WhatsAppAdmin() {
  const [activeTab, setActiveTab] = useState("configuration");
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState(null); // {type:'success'|'error', message:string}

  // Configurations
  const [configurations, setConfigurations] = useState([]);
  const [configForm, setConfigForm] = useState({
    provider: "dxing",
    api_url: "https://app.dxing.in/api/send/whatsapp",
    api_secret: "",
    account_id: "",
    default_priority: 1
  });

  // Admin numbers
  const [adminNumbers, setAdminNumbers] = useState([]);
  const [adminForm, setAdminForm] = useState({
    name: "",
    phone_number: "",
    role: "hr_admin",
    is_active: true,
    is_api_sender: false
  });

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templateForm, setTemplateForm] = useState({
    template_type: "punch_in",
    recipient_type: "both",
    template_text: "",
    is_active: true
  });

  // Test modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  // ---------- Fetch ----------
  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`${API_BASE}/configurations/`);
      const data = await response.json();
      setConfigurations(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("error", "Failed to load configurations");
    }
  };

  const fetchAdminNumbers = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin-numbers/`);
      const data = await response.json();
      setAdminNumbers(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("error", "Failed to load admin numbers");
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE}/templates/`);
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      showAlert("error", "Failed to load templates");
    }
  };

  const handleRefresh = () => {
    setAlert(null);
    if (activeTab === "configuration") fetchConfigurations();
    if (activeTab === "admins") fetchAdminNumbers();
    if (activeTab === "templates") fetchTemplates();
  };

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- Config handlers ----------
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/configurations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configForm)
      });

      if (response.ok) {
        showAlert("success", "Configuration saved successfully");
        setConfigForm({
          provider: "dxing",
          api_url: "https://app.dxing.in/api/send/whatsapp",
          api_secret: "",
          account_id: "",
          default_priority: 1
        });
        fetchConfigurations();
      } else {
        showAlert("error", "Failed to save configuration");
      }
    } catch (error) {
      showAlert("error", "Error saving configuration");
    }
    setLoading(false);
  };

  const handleActivateConfig = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/configurations/${id}/activate/`, {
        method: "POST"
      });

      if (response.ok) {
        showAlert("success", "Configuration activated");
        fetchConfigurations();
      } else {
        showAlert("error", "Failed to activate configuration");
      }
    } catch (error) {
      showAlert("error", "Error activating configuration");
    }
    setLoading(false);
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm("Are you sure you want to delete this configuration?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/configurations/${id}/`, {
        method: "DELETE"
      });

      if (response.ok) {
        showAlert("success", "Configuration deleted");
        fetchConfigurations();
      } else {
        showAlert("error", "Failed to delete configuration");
      }
    } catch (error) {
      showAlert("error", "Error deleting configuration");
    }
    setLoading(false);
  };

  const handleTestConfig = (config) => {
    setTestConfig(config);
    setTestMessage("🔔 Test message from WhatsApp Admin Panel");
    setShowTestModal(true);
  };

  const handleSendTest = async () => {
    if (!testNumber || !testConfig) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/configurations/${testConfig.id}/test_connection/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            test_number: testNumber,
            test_message: testMessage
          })
        }
      );

      const data = await response.json();

      if (data?.success) {
        showAlert("success", "Test message sent successfully! Check your phone.");
        setShowTestModal(false);
        setTestNumber("");
      } else {
        showAlert("error", data?.error || "Failed to send test message");
      }
    } catch (error) {
      showAlert("error", "Error sending test message");
    }
    setLoading(false);
  };

  // ---------- Admin handlers ----------
  const handleSaveAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin-numbers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm)
      });

      if (response.ok) {
        showAlert("success", "Admin number added successfully");
        setAdminForm({
          name: "",
          phone_number: "",
          role: "hr_admin",
          is_active: true,
          is_api_sender: false
        });
        fetchAdminNumbers();
      } else {
        showAlert("error", "Failed to add admin number");
      }
    } catch (error) {
      showAlert("error", "Error adding admin number");
    }
    setLoading(false);
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin number?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin-numbers/${id}/`, {
        method: "DELETE"
      });

      if (response.ok) {
        showAlert("success", "Admin number deleted");
        fetchAdminNumbers();
      } else {
        showAlert("error", "Failed to delete admin number");
      }
    } catch (error) {
      showAlert("error", "Error deleting admin number");
    }
    setLoading(false);
  };

  // ---------- Template handlers ----------
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/templates/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm)
      });

      if (response.ok) {
        showAlert("success", "Template saved successfully");
        setTemplateForm({
          template_type: "punch_in",
          recipient_type: "both",
          template_text: "",
          is_active: true
        });
        fetchTemplates();
      } else {
        showAlert("error", "Failed to save template");
      }
    } catch (error) {
      showAlert("error", "Error saving template");
    }
    setLoading(false);
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/templates/${id}/`, {
        method: "DELETE"
      });

      if (response.ok) {
        showAlert("success", "Template deleted");
        fetchTemplates();
      } else {
        showAlert("error", "Failed to delete template");
      }
    } catch (error) {
      showAlert("error", "Error deleting template");
    }
    setLoading(false);
  };

  const handleResetTemplates = async () => {
    if (!window.confirm("This will reset all templates to default values. Continue?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/templates/reset_defaults/`, {
        method: "POST"
      });

      if (response.ok) {
        showAlert("success", "Templates reset to defaults");
        fetchTemplates();
      } else {
        showAlert("error", "Failed to reset templates");
      }
    } catch (error) {
      showAlert("error", "Error resetting templates");
    }
    setLoading(false);
  };

  const tabs = [
    { id: "configuration", label: "API Configuration", icon: <Settings size={16} /> },
    { id: "admins", label: "Admin Numbers", icon: <Users size={16} /> },
    { id: "templates", label: "Message Templates", icon: <FileText size={16} /> }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <span style={styles.titleIcon}>💬</span>
          <h2 style={styles.title}>WhatsApp Admin Panel</h2>
          <button
            onClick={handleRefresh}
            style={{
              ...styles.refreshButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            disabled={loading}
            title="Refresh"
          >
            <RotateCcw
              size={14}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none"
              }}
            />
            Refresh
          </button>
        </div>
        <p style={styles.subtitle}>Manage configurations, admin numbers, and message templates</p>
      </div>

      {alert?.type === "success" && (
        <div style={styles.successMessage}>
          <CheckCircle size={18} />
          <span style={{ flex: 1 }}>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={styles.dismissSuccessButton} title="Close">
            ×
          </button>
        </div>
      )}

      {alert?.type === "error" && (
        <div style={styles.errorMessage}>
          <AlertCircle size={18} />
          <span style={{ flex: 1 }}>{alert.message}</span>
          <button onClick={() => setAlert(null)} style={styles.dismissButton}>
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                ...styles.tabBtn,
                ...(isActive ? styles.tabBtnActive : {})
              }}
              type="button"
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Configuration */}
      {activeTab === "configuration" && (
        <div style={styles.grid2Responsive}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Add Configuration</h3>

            <form onSubmit={handleSaveConfig}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Provider</label>
                  <select
                    value={configForm.provider}
                    onChange={(e) => setConfigForm({ ...configForm, provider: e.target.value })}
                    style={styles.select}
                    disabled={loading}
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
                    value={configForm.api_url}
                    onChange={(e) => setConfigForm({ ...configForm, api_url: e.target.value })}
                    placeholder="https://app.dxing.in/api/send/whatsapp"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>API Secret Key</label>
                  <input
                    type="text"
                    value={configForm.api_secret}
                    onChange={(e) => setConfigForm({ ...configForm, api_secret: e.target.value })}
                    placeholder="Your Secret"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                  <span style={styles.helper}>From your provider dashboard</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Account ID</label>
                  <input
                    type="text"
                    value={configForm.account_id}
                    onChange={(e) => setConfigForm({ ...configForm, account_id: e.target.value })}
                    placeholder="Your Account ID"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                  <span style={styles.helper}>From your provider dashboard</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Default Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configForm.default_priority}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        default_priority: parseInt(e.target.value || "1", 10)
                      })
                    }
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryBtn,
                    opacity:
                      loading ||
                      !configForm.api_url ||
                      !configForm.api_secret ||
                      !configForm.account_id
                        ? 0.5
                        : 1,
                    cursor:
                      loading ||
                      !configForm.api_url ||
                      !configForm.api_secret ||
                      !configForm.account_id
                        ? "not-allowed"
                        : "pointer"
                  }}
                  disabled={
                    loading || !configForm.api_url || !configForm.api_secret || !configForm.account_id
                  }
                >
                  {loading ? <span style={styles.spinnerSmall} /> : null}
                  Save Configuration
                </button>
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Saved Configurations ({configurations.length})</h3>

            {loading && configurations.length === 0 ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Loading configurations...</p>
              </div>
            ) : configurations.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No configurations yet.</p>
                <button onClick={fetchConfigurations} style={styles.retryButton} disabled={loading}>
                  <RotateCcw size={14} />
                  Retry Loading
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {configurations.map((config) => {
                  const active = !!config.is_active;
                  return (
                    <div
                      key={config.id}
                      style={{
                        ...styles.item,
                        ...(active ? styles.itemActive : {})
                      }}
                    >
                      <div style={styles.itemHeader}>
                        <div>
                          <h4 style={styles.itemTitle}>{String(config.provider || "").toUpperCase()}</h4>
                          {active ? <span style={styles.badgeActive}>✓ Active</span> : null}
                        </div>

                        <div style={styles.iconButtonRow}>
                          <button
                            onClick={() => handleTestConfig(config)}
                            style={{ ...styles.iconBtn, ...styles.iconBtnBlue }}
                            type="button"
                            title="Test Configuration"
                            disabled={loading}
                          >
                            <TestTube size={16} />
                          </button>

                          {!active && (
                            <button
                              onClick={() => handleActivateConfig(config.id)}
                              style={{ ...styles.iconBtn, ...styles.iconBtnGreen }}
                              type="button"
                              title="Activate"
                              disabled={loading}
                            >
                              <Power size={16} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteConfig(config.id)}
                            style={{ ...styles.iconBtn, ...styles.iconBtnRed }}
                            type="button"
                            title="Delete"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div style={styles.itemMeta}>
                        <div style={{ wordBreak: "break-all" }}>
                          <strong>URL:</strong> {config.api_url}
                        </div>
                        <div>
                          <strong>Secret:</strong>{" "}
                          {config.api_secret ? `***${String(config.api_secret).slice(-4)}` : "—"}
                        </div>
                        <div>
                          <strong>Priority:</strong> {config.default_priority} &nbsp;•&nbsp;
                          <strong>Updated:</strong>{" "}
                          {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Numbers */}
      {activeTab === "admins" && (
        <div style={styles.grid2Responsive}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Add Admin Number</h3>

            <form onSubmit={handleSaveAdmin}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    value={adminForm.name}
                    onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                    placeholder="Admin Name"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={adminForm.phone_number}
                    onChange={(e) => setAdminForm({ ...adminForm, phone_number: e.target.value })}
                    placeholder="+918281561081"
                    style={styles.input}
                    required
                    disabled={loading}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Role</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    style={styles.select}
                    disabled={loading}
                  >
                    <option value="hr_admin">HR Admin</option>
                    <option value="manager">Manager</option>
                    <option value="payroll_admin">Payroll Admin</option>
                    <option value="global_cc">Global CC</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <div style={styles.checkboxRow}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={adminForm.is_active}
                        onChange={(e) => setAdminForm({ ...adminForm, is_active: e.target.checked })}
                        disabled={loading}
                      />
                      Active
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={adminForm.is_api_sender}
                        onChange={(e) =>
                          setAdminForm({ ...adminForm, is_api_sender: e.target.checked })
                        }
                        disabled={loading}
                      />
                      API Sender
                    </label>
                  </div>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading || !adminForm.name.trim() || !adminForm.phone_number.trim() ? 0.5 : 1,
                    cursor: loading || !adminForm.name.trim() || !adminForm.phone_number.trim() ? "not-allowed" : "pointer"
                  }}
                  disabled={loading || !adminForm.name.trim() || !adminForm.phone_number.trim()}
                >
                  {loading ? <span style={styles.spinnerSmall} /> : null}
                  Add Admin
                </button>
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Admin Numbers ({adminNumbers.length})</h3>

            {loading && adminNumbers.length === 0 ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Loading admin numbers...</p>
              </div>
            ) : adminNumbers.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No admin numbers yet.</p>
                <button onClick={fetchAdminNumbers} style={styles.retryButton} disabled={loading}>
                  <RotateCcw size={14} />
                  Retry Loading
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {adminNumbers.map((admin) => (
                  <div key={admin.id} style={styles.item}>
                    <div style={styles.itemHeader}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={styles.avatar}>{String(admin.name || "?").charAt(0).toUpperCase()}</div>
                        <div>
                          <h4 style={styles.itemTitle}>{admin.name}</h4>
                          <div style={styles.metaLine}>{admin.phone_number}</div>
                          <div style={styles.pillRow}>
                            <span style={{ ...styles.pill, ...styles.pillBlue }}>{admin.role_display}</span>
                            {admin.is_active ? (
                              <span style={{ ...styles.pill, ...styles.pillGreen }}>Active</span>
                            ) : null}
                            {admin.is_api_sender ? (
                              <span style={{ ...styles.pill, ...styles.pillYellow }}>API Sender</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        style={{ ...styles.iconBtn, ...styles.iconBtnRed }}
                        type="button"
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates */}
      {activeTab === "templates" && (
        <div style={styles.grid2Responsive}>
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.cardTitle}>Add Template</h3>
              <button onClick={handleResetTemplates} style={styles.outlineBtn} type="button" disabled={loading}>
                Reset All
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Template Type</label>
                  <select
                    value={templateForm.template_type}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_type: e.target.value })}
                    style={styles.select}
                    disabled={loading}
                  >
                    <option value="punch_in">Punch In</option>
                    <option value="punch_out">Punch Out</option>
                    <option value="leave_request">Leave Request</option>
                    <option value="leave_approval">Leave Approval</option>
                    <option value="leave_rejection">Leave Rejection</option>
                    <option value="late_request">Late Request</option>
                    <option value="early_request">Early Request</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Recipient Type</label>
                  <select
                    value={templateForm.recipient_type}
                    onChange={(e) => setTemplateForm({ ...templateForm, recipient_type: e.target.value })}
                    style={styles.select}
                    disabled={loading}
                  >
                    <option value="employee">Employee</option>
                    <option value="admin">Admin/HR</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Template Text</label>
                  <textarea
                    value={templateForm.template_text}
                    onChange={(e) => setTemplateForm({ ...templateForm, template_text: e.target.value })}
                    rows={7}
                    placeholder="Use variables like {employee_name}, {date}, {time}..."
                    style={styles.textarea}
                    required
                    disabled={loading}
                  />
                  <div style={styles.helper}>
                    Available: {"{employee_name}"}, {"{date}"}, {"{time}"}, {"{location}"},{" "}
                    {"{leave_type}"}, {"{days}"}, {"{reason}"}
                  </div>
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryBtn,
                    opacity: loading || !templateForm.template_text.trim() ? 0.5 : 1,
                    cursor: loading || !templateForm.template_text.trim() ? "not-allowed" : "pointer"
                  }}
                  disabled={loading || !templateForm.template_text.trim()}
                >
                  {loading ? <span style={styles.spinnerSmall} /> : null}
                  Save Template
                </button>
              </div>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Message Templates ({templates.length})</h3>

            {loading && templates.length === 0 ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                <p>Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No templates yet.</p>
                <button onClick={fetchTemplates} style={styles.retryButton} disabled={loading}>
                  <RotateCcw size={14} />
                  Retry Loading
                </button>
              </div>
            ) : (
              <div style={styles.list}>
                {templates.map((template) => (
                  <div key={template.id} style={styles.item}>
                    <div style={styles.itemHeader}>
                      <div>
                        <h4 style={styles.itemTitle}>{template.template_type_display}</h4>
                        <div style={styles.pillRow}>
                          <span style={{ ...styles.pill, ...styles.pillBlue }}>
                            {template.recipient_type_display}
                          </span>
                          {template.is_active ? (
                            <span style={{ ...styles.pill, ...styles.pillGreen }}>Active</span>
                          ) : null}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        style={{ ...styles.iconBtn, ...styles.iconBtnRed }}
                        type="button"
                        title="Delete"
                        disabled={loading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div style={styles.monoBox}>{template.template_text}</div>

                    {!!template.available_variables?.length && (
                      <div style={{ marginTop: 10 }}>
                        <div style={styles.metaLabel}>Variables:</div>
                        <div style={styles.pillRow}>
                          {template.available_variables.map((v, i) => (
                            <span key={i} style={styles.variablePill}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Test Modal */}
      {showTestModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Test Configuration</h3>
              <button
                onClick={() => setShowTestModal(false)}
                style={styles.modalCloseBtn}
                type="button"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div style={styles.modalInfo}>
              <div style={styles.modalInfoTitle}>
                Testing: {testConfig?.provider ? String(testConfig.provider).toUpperCase() : ""}
              </div>
              <div style={styles.modalInfoSub}>{testConfig?.api_url}</div>
            </div>

            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Test Phone Number</label>
                <input
                  type="tel"
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+918281561081"
                  style={styles.input}
                  disabled={loading}
                />
                <span style={styles.helper}>Enter number with country code</span>
              </div>

              <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                <label style={styles.label}>Test Message</label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={4}
                  style={styles.textarea}
                  disabled={loading}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowTestModal(false)}
                style={styles.outlineBtn}
                type="button"
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleSendTest}
                style={{
                  ...styles.primaryBtn,
                  opacity: loading || !testNumber.trim() ? 0.5 : 1,
                  cursor: loading || !testNumber.trim() ? "not-allowed" : "pointer",
                  width: "auto",
                  minWidth: 140
                }}
                type="button"
                disabled={loading || !testNumber.trim()}
              >
                {loading ? <span style={styles.spinnerSmall} /> : <Send size={16} />}
                {loading ? "Sending..." : "Send Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * This style system matches the pattern used in your Allowance.jsx:
 * - Inline style object
 * - Card layouts
 * - Form grids
 * - Success/Error banners
 * - Spinner keyframes
 * :contentReference[oaicite:0]{index=0}
 */
const styles = {
  container: { maxWidth: 1400, margin: "0 auto", padding: "20px" },

  header: { marginBottom: 24 },
  titleSection: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  titleIcon: {
    width: 34,
    height: 34,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    background: "#dcfce7",
    border: "1px solid #bbf7d0"
  },
  title: { margin: 0, fontSize: "28px", fontWeight: "700", color: "#1e293b" },
  subtitle: { margin: 0, fontSize: "14px", color: "#64748b" },

  refreshButton: {
    marginLeft: "auto",
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },

  tabs: {
    display: "flex",
    gap: 10,
    padding: 6,
    background: "#fff",
    border: "1px solid #f1f5f9",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: 20,
    flexWrap: "wrap"
  },
  tabBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.2s"
  },
  tabBtnActive: {
    background: "#7c3aed",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(124, 58, 237, 0.25)"
  },

  grid2Responsive: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))",
    gap: 20
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 0,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9"
  },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#334155",
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 16
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "13px", fontWeight: "500", color: "#475569" },

  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    background: "#fff"
  },
  select: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    background: "#fff",
    cursor: "pointer"
  },
  textarea: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    background: "#fff",
    resize: "vertical"
  },
  helper: { fontSize: 12, color: "#94a3b8" },

  checkboxRow: { display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 6 },
  checkboxLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#475569", fontWeight: 500 },

  buttonGroup: { display: "flex", gap: 12, flexWrap: "wrap" },

  primaryBtn: {
    padding: "12px 18px",
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: "14px",
    fontWeight: "600",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    transition: "all 0.2s",
    cursor: "pointer",
    width: 220
  },
  outlineBtn: {
    padding: "10px 14px",
    background: "transparent",
    color: "#7c3aed",
    border: "1px solid #7c3aed",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s"
  },

  list: { display: "flex", flexDirection: "column", gap: 12 },
  item: {
    padding: 16,
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    transition: "all 0.2s"
  },
  itemActive: {
    border: "1px solid #10b981",
    background: "#ecfdf5"
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10
  },
  itemTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" },
  metaLine: { fontSize: 13, color: "#64748b", marginTop: 2 },

  itemMeta: {
    fontSize: 13,
    color: "#475569",
    display: "flex",
    flexDirection: "column",
    gap: 6
  },

  badgeActive: {
    display: "inline-block",
    marginTop: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: "#10b981",
    color: "#fff"
  },

  iconButtonRow: { display: "flex", gap: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  iconBtnBlue: { background: "#3b82f6", color: "#fff" },
  iconBtnGreen: { background: "#059669", color: "#fff" },
  iconBtnRed: { background: "#ef4444", color: "#fff" },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 10,
    background: "#7c3aed",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800
  },

  pillRow: { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    background: "#f1f5f9",
    color: "#475569"
  },
  pillBlue: { background: "#dbeafe", color: "#1e40af" },
  pillGreen: { background: "#d1fae5", color: "#065f46" },
  pillYellow: { background: "#fef3c7", color: "#92400e" },

  monoBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    fontSize: 13,
    color: "#334155",
    whiteSpace: "pre-wrap"
  },

  metaLabel: { fontSize: 12, color: "#64748b", fontWeight: 700, marginTop: 10 },
  variablePill: {
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    fontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },

  successMessage: {
    padding: "12px 16px",
    background: "#d1fae5",
    border: "1px solid #6ee7b7",
    borderRadius: 8,
    color: "#065f46",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 500
  },
  errorMessage: {
    padding: "12px 16px",
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 8,
    color: "#991b1b",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 500
  },
  dismissButton: {
    padding: "4px 8px",
    background: "transparent",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: 4,
    fontSize: 12,
    cursor: "pointer"
  },
  dismissSuccessButton: {
    marginLeft: "auto",
    padding: 0,
    background: "transparent",
    color: "#065f46",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    fontWeight: "bold",
    lineHeight: 1
  },

  loadingState: { textAlign: "center", padding: "40px 20px", color: "#64748b" },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #f1f5f9",
    borderTop: "4px solid #7c3aed",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px"
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    border: "3px solid rgba(255,255,255,0.35)",
    borderTop: "3px solid rgba(255,255,255,1)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  },

  emptyState: { textAlign: "center", padding: "30px 10px", color: "#64748b" },
  emptyText: { fontSize: 15, fontWeight: 700, color: "#64748b", margin: "8px 0 12px" },
  retryButton: {
    padding: "8px 16px",
    background: "#f1f5f9",
    color: "#475569",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: 6
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16
  },
  modal: {
    width: "100%",
    maxWidth: 560,
    background: "#fff",
    borderRadius: 12,
    padding: 18,
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    border: "1px solid #f1f5f9"
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" },
  modalCloseBtn: {
    border: "1px solid #e2e8f0",
    background: "#fff",
    borderRadius: 10,
    padding: 8,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalInfo: { padding: 12, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, marginBottom: 12 },
  modalInfoTitle: { fontSize: 13, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 },
  modalInfoSub: { fontSize: 12, color: "#1d4ed8", wordBreak: "break-all" },
  modalFooter: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }
};

const styleSheet = document.styleSheets?.[0];
if (styleSheet) {
  try {
    styleSheet.insertRule(
      `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
      styleSheet.cssRules.length
    );
  } catch (e) {
    // ignore if already exists
  }
}
