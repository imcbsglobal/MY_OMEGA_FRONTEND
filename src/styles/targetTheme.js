const theme = {
  page: { padding: 20, background: '#f8fafc' },
  card: { borderRadius: 10, overflow: 'hidden', border: '1px solid #eef2f4', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' },
  header: { background: '#ffffff', padding: 18, display: 'flex', flexDirection: 'column', gap: 6, borderBottom: '1px solid #fdeaea' },
  headerTitle: { margin: 0, color: '#7f1d1d', fontSize: 20, fontWeight: 700 },
  headerSubtitle: { margin: 0, color: '#6b7280', fontSize: 13, opacity: 0.95 },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, padding: 18, background: '#fff' },
  input: { padding: '10px 12px', border: '1px solid #f3d6d6', borderRadius: 8, background: '#fff', width: '100%', outline: 'none' },
  textarea: { padding: '10px 12px', border: '1px solid #f3d6d6', borderRadius: 8, minHeight: 90, resize: 'vertical', width: '100%' },
  label: { display: 'block', marginBottom: 6, color: '#333', fontSize: 14, fontWeight: 600 },
  submitPrimary: { background: '#ef4444', color: '#fff', padding: '10px 16px', border: '1px solid #ef4444', borderRadius: 8, cursor: 'pointer' },
  submitSecondary: { background: '#ffffff', color: '#1f2937', padding: '10px 16px', border: '1px solid #f3d6d6', borderRadius: 8, cursor: 'pointer' },
  // alias for components still using `submit`
  submit: { background: '#e11d48', color: '#fff', padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer' },
  tableWrap: { marginTop: 16, borderTop: '1px solid #fdeaea', padding: 16, background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', background: '#fff5f5', borderBottom: '1px solid #fdeaea', color: '#7f1d1d', fontSize: 13, fontWeight: 700 },
  td: { padding: '10px', borderBottom: '1px solid #f6f2f2', fontSize: 14 },
  pre: { fontFamily: 'monospace', fontSize: 13, whiteSpace: 'pre-wrap', margin: 0 },
  filterRow: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 },
};

export default theme;
