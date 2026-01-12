import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../Pages.css';

export default function ClientForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [siteIds, setSiteIds] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchClient();
    }
  }, [id, isEdit]);

  async function fetchClient() {
    try {
      const response = await fetch(`/api/admin/clients/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const client = data.client;
        setEmail(client.email);
        setCompanyName(client.companyName || '');
        setSiteIds(client.siteIds.join(', '));
        setIsActive(client.isActive);
        setApiKey(client.apiKey);
      } else {
        setError('Failed to load client');
      }
    } catch (err) {
      setError('Error loading client');
      console.error(err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const siteIdsArray = siteIds.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const url = isEdit ? `/api/admin/clients/${id}` : '/api/admin/clients';
      const method = isEdit ? 'PUT' : 'POST';
      
      const body: any = {
        email,
        companyName,
        siteIds: siteIdsArray,
        isActive
      };

      if (password) {
        body.password = password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        navigate('/admin/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save client');
      }
    } catch (err) {
      setError('Error saving client');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegenerateApiKey() {
    if (!confirm('Are you sure you want to regenerate the API key? The old key will no longer work.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/clients/${id}/regenerate-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKey(data.client.apiKey);
        alert('API key regenerated successfully');
      } else {
        alert('Failed to regenerate API key');
      }
    } catch (err) {
      alert('Error regenerating API key');
      console.error(err);
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>{isEdit ? 'Edit Client' : 'Create New Client'}</h1>

      <form onSubmit={handleSubmit} style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {error && (
          <div style={{
            padding: '12px',
            marginBottom: '16px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33'
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Email *
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isEdit}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box',
              opacity: isEdit ? 0.6 : 1
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Password {isEdit ? '(leave blank to keep current)' : '*'}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEdit}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          {isEdit && (
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              Password must be at least 8 characters with uppercase, lowercase, and number
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="companyName" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="siteIds" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Site IDs (comma-separated)
          </label>
          <input
            id="siteIds"
            type="text"
            value={siteIds}
            onChange={(e) => setSiteIds(e.target.value)}
            placeholder="example.com, anothersite.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            Leave empty to allow access to all sites
          </div>
        </div>

        {isEdit && (
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="apiKey" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              API Key
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                readOnly
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f5f5f5'
                }}
              />
              <button
                type="button"
                onClick={handleRegenerateApiKey}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ffc107',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Regenerate
              </button>
            </div>
          </div>
        )}

        {isEdit && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Active</span>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
