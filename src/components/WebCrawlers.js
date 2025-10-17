import React, { useState, useEffect } from 'react';
import './WebCrawlers.css';

const WebCrawlers = () => {
  const [crawlers, setCrawlers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingCrawler, setEditingCrawler] = useState(null);

  // Initialize crawler configurations
  useEffect(() => {
    const defaultCrawlers = [
      {
        id: 1,
        name: 'Amazon Product Reviews',
        platform: 'amazon',
        status: 'active',
        lastRun: '2025-10-16 14:30:00',
        itemsCollected: 15847,
        apiToken: '',
        endpoint: 'https://api.amazon.com/reviews',
        rateLimit: '100 requests/hour',
        categories: ['Electronics', 'Books', 'Home & Garden'],
        description: 'Crawls Amazon product reviews and ratings for sentiment analysis'
      },
      {
        id: 2,
        name: 'Twitter Social Mentions',
        platform: 'twitter',
        status: 'active',
        lastRun: '2025-10-16 14:25:00',
        itemsCollected: 8932,
        apiToken: '',
        endpoint: 'https://api.twitter.com/2/tweets/search',
        rateLimit: '300 requests/15min',
        categories: ['Social Media', 'Brand Mentions'],
        description: 'Monitors Twitter for brand mentions and product discussions'
      },
      {
        id: 3,
        name: 'Reddit Product Discussions',
        platform: 'reddit',
        status: 'active',
        lastRun: '2025-10-16 14:20:00',
        itemsCollected: 5621,
        apiToken: '',
        endpoint: 'https://oauth.reddit.com/api/v1',
        rateLimit: '60 requests/minute',
        categories: ['Forums', 'Product Reviews'],
        description: 'Scrapes Reddit for product discussions and user opinions'
      },
      {
        id: 4,
        name: 'YouTube Product Reviews',
        platform: 'youtube',
        status: 'paused',
        lastRun: '2025-10-16 12:00:00',
        itemsCollected: 3247,
        apiToken: '',
        endpoint: 'https://www.googleapis.com/youtube/v3',
        rateLimit: '10,000 units/day',
        categories: ['Video Reviews', 'Unboxing'],
        description: 'Analyzes YouTube video comments and descriptions for product sentiment'
      },
      {
        id: 5,
        name: 'Instagram Brand Posts',
        platform: 'instagram',
        status: 'active',
        lastRun: '2025-10-16 14:15:00',
        itemsCollected: 7834,
        apiToken: '',
        endpoint: 'https://graph.instagram.com',
        rateLimit: '200 requests/hour',
        categories: ['Social Media', 'Visual Content'],
        description: 'Monitors Instagram posts and stories for brand-related content'
      },
      {
        id: 6,
        name: 'Google Shopping Reviews',
        platform: 'google',
        status: 'inactive',
        lastRun: '2025-10-15 18:30:00',
        itemsCollected: 2156,
        apiToken: '',
        endpoint: 'https://developers.google.com/shopping-content',
        rateLimit: '1,000 requests/day',
        categories: ['Shopping', 'Product Reviews'],
        description: 'Collects product reviews and ratings from Google Shopping'
      },
      {
        id: 7,
        name: 'TikTok Product Videos',
        platform: 'tiktok',
        status: 'inactive',
        lastRun: '2025-10-14 20:45:00',
        itemsCollected: 1892,
        apiToken: '',
        endpoint: 'https://open-api.tiktok.com',
        rateLimit: '100 requests/day',
        categories: ['Video Content', 'Viral Trends'],
        description: 'Analyzes TikTok videos and comments for product mentions'
      },
      {
        id: 8,
        name: 'LinkedIn Professional Reviews',
        platform: 'linkedin',
        status: 'inactive',
        lastRun: '2025-10-13 16:20:00',
        itemsCollected: 945,
        apiToken: '',
        endpoint: 'https://api.linkedin.com/v2',
        rateLimit: '500 requests/day',
        categories: ['Professional Networks', 'B2B Reviews'],
        description: 'Monitors LinkedIn for professional product recommendations'
      }
    ];
    setCrawlers(defaultCrawlers);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'paused': return '#F59E0B';
      case 'inactive': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      amazon: '🛒',
      twitter: '🐦',
      reddit: '🤖',
      youtube: '📺',
      instagram: '📸',
      google: '🔍',
      tiktok: '🎵',
      linkedin: '💼'
    };
    return icons[platform] || '🌐';
  };

  const handleEditCrawler = (crawler) => {
    setEditingCrawler({ ...crawler });
  };

  const handleSaveCrawler = () => {
    setCrawlers(crawlers.map(c => 
      c.id === editingCrawler.id ? editingCrawler : c
    ));
    setEditingCrawler(null);
  };

  const handleToggleStatus = (id) => {
    setCrawlers(crawlers.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const renderOverview = () => (
    <div className="crawler-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Crawlers</h3>
          <div className="stat-number">{crawlers.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active Crawlers</h3>
          <div className="stat-number">{crawlers.filter(c => c.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <h3>Total Items Collected</h3>
          <div className="stat-number">{crawlers.reduce((sum, c) => sum + c.itemsCollected, 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <h3>Data Sources</h3>
          <div className="stat-number">{new Set(crawlers.map(c => c.platform)).size}</div>
        </div>
      </div>

      <div className="crawler-grid">
        {crawlers.map(crawler => (
          <div key={crawler.id} className="crawler-card">
            <div className="crawler-header">
              <div className="crawler-info">
                <span className="platform-icon">{getPlatformIcon(crawler.platform)}</span>
                <div>
                  <h4>{crawler.name}</h4>
                  <p className="platform-name">{crawler.platform.charAt(0).toUpperCase() + crawler.platform.slice(1)}</p>
                </div>
              </div>
              <div 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(crawler.status) }}
                title={crawler.status}
              />
            </div>
            
            <div className="crawler-stats">
              <div className="stat">
                <span className="label">Items Collected:</span>
                <span className="value">{crawler.itemsCollected.toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="label">Last Run:</span>
                <span className="value">{new Date(crawler.lastRun).toLocaleString()}</span>
              </div>
              <div className="stat">
                <span className="label">Rate Limit:</span>
                <span className="value">{crawler.rateLimit}</span>
              </div>
            </div>

            <div className="crawler-description">
              <p>{crawler.description}</p>
            </div>

            <div className="crawler-categories">
              {crawler.categories.map(category => (
                <span key={category} className="category-tag">{category}</span>
              ))}
            </div>

            <div className="crawler-actions">
              <button 
                className={`action-btn ${crawler.status === 'active' ? 'pause' : 'start'}`}
                onClick={() => handleToggleStatus(crawler.id)}
              >
                {crawler.status === 'active' ? 'Pause' : 'Start'}
              </button>
              <button 
                className="action-btn edit"
                onClick={() => handleEditCrawler(crawler)}
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfiguration = () => (
    <div className="crawler-configuration">
      <h3>Crawler Configuration</h3>
      <div className="config-grid">
        {crawlers.map(crawler => (
          <div key={crawler.id} className="config-card">
            <div className="config-header">
              <span className="platform-icon">{getPlatformIcon(crawler.platform)}</span>
              <h4>{crawler.name}</h4>
              <div 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(crawler.status) }}
              />
            </div>
            
            <div className="config-form">
              <div className="form-group">
                <label>API Token</label>
                <input 
                  type="password" 
                  placeholder={`Enter ${crawler.platform} API token`}
                  value={crawler.apiToken}
                  onChange={(e) => {
                    const updated = crawlers.map(c => 
                      c.id === crawler.id ? { ...c, apiToken: e.target.value } : c
                    );
                    setCrawlers(updated);
                  }}
                />
              </div>
              
              <div className="form-group">
                <label>API Endpoint</label>
                <input 
                  type="url" 
                  value={crawler.endpoint}
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label>Rate Limit</label>
                <input 
                  type="text" 
                  value={crawler.rateLimit}
                  readOnly
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={crawler.status}
                  onChange={(e) => {
                    const updated = crawlers.map(c => 
                      c.id === crawler.id ? { ...c, status: e.target.value } : c
                    );
                    setCrawlers(updated);
                  }}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="crawler-analytics">
      <h3>Crawler Analytics</h3>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Collection Performance</h4>
          <div className="performance-list">
            {crawlers
              .sort((a, b) => b.itemsCollected - a.itemsCollected)
              .map(crawler => (
                <div key={crawler.id} className="performance-item">
                  <span className="platform-icon">{getPlatformIcon(crawler.platform)}</span>
                  <span className="crawler-name">{crawler.name}</span>
                  <span className="items-count">{crawler.itemsCollected.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="analytics-card">
          <h4>Platform Distribution</h4>
          <div className="platform-stats">
            {Object.entries(
              crawlers.reduce((acc, crawler) => {
                acc[crawler.platform] = (acc[crawler.platform] || 0) + crawler.itemsCollected;
                return acc;
              }, {})
            ).map(([platform, count]) => (
              <div key={platform} className="platform-stat">
                <span className="platform-icon">{getPlatformIcon(platform)}</span>
                <span className="platform-name">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                <span className="platform-count">{count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="web-crawlers">
      <div className="page-header">
        <h1>Web Crawler Management</h1>
        <p>Monitor and configure data collection from various platforms</p>
      </div>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'configuration' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuration')}
        >
          Configuration
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'configuration' && renderConfiguration()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {editingCrawler && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Configure {editingCrawler.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setEditingCrawler(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Crawler Name</label>
                <input 
                  type="text"
                  value={editingCrawler.name}
                  onChange={(e) => setEditingCrawler({
                    ...editingCrawler,
                    name: e.target.value
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>API Token</label>
                <input 
                  type="password"
                  value={editingCrawler.apiToken}
                  onChange={(e) => setEditingCrawler({
                    ...editingCrawler,
                    apiToken: e.target.value
                  })}
                  placeholder={`Enter ${editingCrawler.platform} API token`}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={editingCrawler.description}
                  onChange={(e) => setEditingCrawler({
                    ...editingCrawler,
                    description: e.target.value
                  })}
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editingCrawler.status}
                  onChange={(e) => setEditingCrawler({
                    ...editingCrawler,
                    status: e.target.value
                  })}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setEditingCrawler(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSaveCrawler}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebCrawlers;
