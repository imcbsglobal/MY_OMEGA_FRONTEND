import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';

const MarketingList = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      // Only fetch targets assigned to the current user
      const response = await api.get('/target-management/marketing-targets/?self=1');
      console.log('[MarketingList] GET /marketing-targets/?self=1 response:', response.data);
      // Support both paginated responses and plain arrays
      let resp = response.data;
      let items = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.results) ? resp.results : []);

      // Fallback: if no items returned for ?self=1, try employee=<employee_pk> then employee_id from localStorage
      if ((!items || items.length === 0)) {
        const empPk = localStorage.getItem('employee_pk');
        const empId = localStorage.getItem('employee_id');
        if (empPk) {
          console.log('[MarketingList] No items for self=1, trying employee(pk)=' + empPk);
          const resp2 = await api.get(`/target-management/marketing-targets/?employee=${empPk}`);
          console.log('[MarketingList] GET /marketing-targets/?employee=' + empPk + ' response:', resp2.data);
          resp = resp2.data;
          items = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.results) ? resp.results : []);
        }
        if ((!items || items.length === 0) && empId) {
          console.log('[MarketingList] Still no items, trying employee(employee_id)=' + empId);
          const resp3 = await api.get(`/target-management/marketing-targets/?employee=${empId}`);
          console.log('[MarketingList] GET /marketing-targets/?employee=' + empId + ' response:', resp3.data);
          resp = resp3.data;
          items = Array.isArray(resp) ? resp : (resp && Array.isArray(resp.results) ? resp.results : []);
        }
      }

      setTargets(items);
    } catch (error) {
      setTargets([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Assigned Marketing Targets</h2>
      {loading ? <div>Loading...</div> : (
        <ul>
          {targets.map(target => (
            <li key={target.id}>
              <span>{target.employee_name || target.id}</span>
              <button onClick={() => navigate(`/target/call/marketing/view/${target.id}`)}>View</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MarketingList;
