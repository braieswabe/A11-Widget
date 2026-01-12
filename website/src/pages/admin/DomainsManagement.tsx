import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../Pages.css';

interface Domain {
  id: string;
  domain: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
}

export default function DomainsManagement() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  async function fetchDomains() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/domains', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch domains');
      }

      const data = await response.json();
      setDomains(data.domains || []);
    } catch (err) {
      setError('Failed to load domains');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          domain: newDomain,
          description: newDescription || null
        })
      });

      if (response.ok) {
        setNewDomain('');
        setNewDescription('');
        setShowAddForm(false);
        fetchDomains();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add domain');
      }
    } catch (err) {
      setError('Error adding domain');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(domainId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      });

      if (response.ok) {
        fetchDomains();
      } else {
        alert('Failed to update domain status');
      }
    } catch (err) {
      alert('Error updating domain status');
      console.error(err);
    }
  }

  async function handleDelete(domainId: string, domainName: string) {
    if (!confirm(`Are you sure you want to delete "${domainName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDomains();
      } else {
        alert('Failed to delete domain');
      }
    } catch (err) {
      alert('Error deleting domain');
      console.error(err);
    }
  }

  const filteredDomains = domains.filter(domain =>
    domain.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (domain.description && domain.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1>Allowed Domains</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Manage domains that are allowed to access the website
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <input
          type="text"
          placeholder="Search domains..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            width: '300px'
          }}
        />
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500
          }}
        >
          {showAddForm ? 'Cancel' : 'Add Domain'}
        </button>
      </div>

      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ marginTop: 0 }}>Add New Domain</h2>
          <form onSubmit={handleAddDomain}>
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="domain" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Domain *
              </label>
              <input
                id="domain"
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="example.com"
                required
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
                Enter domain without protocol (e.g., example.com)
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                Description (optional)
              </label>
              <input
                id="description"
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Production site"
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Adding...' : 'Add Domain'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewDomain('');
                  setNewDescription('');
                  setError('');
                }}
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
      )}

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

      {isLoading ? (
        <div>Loading domains...</div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Domain</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDomains.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                    {domains.length === 0 ? 'No domains configured. Add your first domain above.' : 'No domains match your search.'}
                  </td>
                </tr>
              ) : (
                filteredDomains.map((domain) => (
                  <tr key={domain.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{domain.domain}</td>
                    <td style={{ padding: '12px', color: '#666' }}>{domain.description || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: domain.isActive ? '#d4edda' : '#f8d7da',
                        color: domain.isActive ? '#155724' : '#721c24',
                        fontSize: '14px'
                      }}>
                        {domain.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      {new Date(domain.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleActive(domain.id, domain.isActive)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: domain.isActive ? '#ffc107' : '#28a745',
                            color: domain.isActive ? '#000' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          {domain.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(domain.id, domain.domain)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
