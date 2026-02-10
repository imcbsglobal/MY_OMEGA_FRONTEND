import React, { useEffect, useState } from 'react';
import './targetManagement.css';
import { getCallDailyTargets, updateCallTarget } from '../../api/targetManagement';
import theme from '../../styles/targetTheme';
import { toast } from 'react-toastify';

export default function CallDaily() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({});

  const styles = theme;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await getCallDailyTargets();
      // Expecting array or paginated results
      const list = Array.isArray(res) ? res : res?.results || [];
      setItems(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load daily call targets');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (id, item) => {
    setEditing((e) => ({ ...e, [id]: { achieved_calls: item.achieved_calls || 0, notes: item.notes || '' } }));
  };

  const cancelEdit = (id) => {
    setEditing((e) => {
      const copy = { ...e };
      delete copy[id];
      return copy;
    });
  };

  const handleChange = (id, field, value) => {
    setEditing((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  };

  const save = async (id) => {
    const payload = editing[id];
    if (!payload) return;
    try {
      await updateCallTarget(id, payload);
      toast.success('Saved');
      cancelEdit(id);
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error('Save failed');
    }
  };

  return (
    <div className="tm-page" style={styles.page}>
      <div className="tm-card" style={styles.card}>
        <div className="tm-header" style={styles.header}>
          <h3 className="tm-title" style={styles.headerTitle}>Daily Call Targets</h3>
        </div>

        <div className="tm-table-wrap" style={styles.tableWrap}>
          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div className="alert alert-info" style={{ margin: 12 }}>No daily targets found.</div>
          ) : (
            <div className="table-responsive">
              <table className="table tm-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th className="text-center">Target Calls</th>
                    <th className="text-center">Achieved Calls</th>
                    <th className="text-center">Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td>{it.employee_name || it.employee || '—'}</td>
                      <td>{it.date || it.created_at || '—'}</td>
                      <td className="text-center">{it.target_calls ?? it.total_target_calls ?? '—'}</td>
                      <td className="text-center">
                        {editing[it.id] ? (
                          <input type="number" value={editing[it.id].achieved_calls} onChange={(e) => handleChange(it.id, 'achieved_calls', e.target.value)} style={{ width: 90, padding: 6, borderRadius: 6, border: '1px solid #f3d6d6' }} />
                        ) : (
                          it.achieved_calls ?? it.total_achieved_calls ?? 0
                        )}
                      </td>
                      <td className="text-center">
                        {editing[it.id] ? (
                          <input value={editing[it.id].notes} onChange={(e) => handleChange(it.id, 'notes', e.target.value)} style={{ width: 220, padding: 6, borderRadius: 6, border: '1px solid #f3d6d6' }} />
                        ) : (
                          it.notes || '—'
                        )}
                      </td>
                      <td>
                        {editing[it.id] ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-sm btn-primary" onClick={() => save(it.id)}>Save</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => cancelEdit(it.id)}>Cancel</button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(it.id, it)}>Edit</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
