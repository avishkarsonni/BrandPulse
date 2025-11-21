import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import './WebCrawlers.css';

const WebCrawlers = () => {
  const [crawlers, setCrawlers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingCrawler, setEditingCrawler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch crawler data from database
  const fetchCrawlerData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCrawlerStatistics();
      
      if (data && data.byPlatform) {
        // Transform database data to crawler format
        const transformedCrawlers = data.byPlatform.map((platform, index) => {
          const platformNames = {
            'amazon': 'Amazon Product Reviews',
            'twitter': 'Twitter Social Mentions',
            'reddit': 'Reddit Product Discussions',
            'youtube': 'YouTube Product Reviews',
            'instagram': 'Instagram Brand Posts',
            'google': 'Google Shopping Reviews',
            'website': 'Website Product Pages',
            'facebook': 'Facebook Brand Mentions',
          };
          
          const descriptions = {
            'amazon': 'Crawls Amazon product reviews and ratings for sentiment analysis',
            'twitter': 'Monitors Twitter for brand mentions and product discussions',
            'reddit': 'Scrapes Reddit for product discussions and user opinions',
            'youtube': 'Analyzes YouTube video comments and descriptions for product sentiment',
            'instagram': 'Monitors Instagram posts and stories for brand-related content',
            'google': 'Collects product reviews and ratings from Google Shopping',
            'website': 'Crawls official product websites for updates and information',
            'facebook': 'Monitors Facebook for brand mentions and product discussions',
          };
          
          const rateLimits = {
            'amazon': '100 requests/hour',
            'twitter': '300 requests/15min',
            'reddit': '60 requests/minute',
            'youtube': '10,000 units/day',
            'instagram': '200 requests/hour',
            'google': '1,000 requests/day',
            'website': '500 requests/hour',
            'facebook': '200 requests/hour',
          };
          
          // Determine status based on last crawl time
          const lastCrawled = platform.lastCrawled ? new Date(platform.lastCrawled) : null;
          const hoursSinceCrawl = lastCrawled ? (new Date() - lastCrawled) / (1000 * 60 * 60) : Infinity;
          let status = 'active';
          if (!lastCrawled || hoursSinceCrawl > 48) {
            status = 'inactive';
          } else if (hoursSinceCrawl > 24) {
            status = 'paused';
          }
          
          return {
            id: index + 1,
            name: platformNames[platform.platform.toLowerCase()] || `${platform.platform} Crawler`,
            platform: platform.platform.toLowerCase(),
            status: status,
            lastRun: platform.lastCrawled || null,
            itemsCollected: platform.totalPages || 0,
            productsCovered: platform.productsCovered || 0,
            crawlRate: platform.crawlRate || 0,
            apiToken: '',
            endpoint: `https://api.${platform.platform.toLowerCase()}.com`,
            rateLimit: rateLimits[platform.platform.toLowerCase()] || '100 requests/hour',
            categories: [platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)],
            description: descriptions[platform.platform.toLowerCase()] || `Crawls ${platform.platform} for product data`,
          };
        });
        
        setCrawlers(transformedCrawlers);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching crawler data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrawlerData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCrawlerData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleString();
  };

  const handleRunNow = async (crawler) => {
    // Simulate running crawler - update last run time
    const updatedCrawlers = crawlers.map(c => 
      c.id === crawler.id 
        ? { ...c, lastRun: new Date().toISOString(), status: 'active' }
        : c
    );
    setCrawlers(updatedCrawlers);
    setLastUpdate(new Date());
    
    // In a real implementation, this would trigger an actual crawler run
    alert(`Running ${crawler.name}... This will update the last run time.`);
  };

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
                <span className="value">{formatTimeAgo(crawler.lastRun)}</span>
              </div>
              {crawler.productsCovered && (
                <div className="stat">
                  <span className="label">Products Covered:</span>
                  <span className="value">{crawler.productsCovered.toLocaleString()}</span>
                </div>
              )}
              {crawler.crawlRate !== undefined && (
                <div className="stat">
                  <span className="label">Crawl Rate:</span>
                  <span className="value">{crawler.crawlRate}%</span>
                </div>
              )}
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
                className="btn-run"
                onClick={() => handleRunNow(crawler)}
                title="Run crawler now"
              >
                ▶ Run Now
              </button>
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
