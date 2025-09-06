import React, { useState, useEffect } from 'react';
import { useAffiliateLinks } from '../hooks/useAffiliateLinks';
import { cuelinksAPI } from '../lib/cuelinks';
import { 
  Link, 
  Search, 
  Copy, 
  ExternalLink, 
  Plus,
  ShoppingBag,
  Smartphone,
  Shirt,
  Sparkles,
  Package,
  Store
} from 'lucide-react';

const PARTNER_BRANDS = [
  {
    name: 'Amazon',
    icon: ShoppingBag,
    color: 'bg-orange-500',
    url: 'https://amazon.in',
    description: 'Everything you need'
  },
  {
    name: 'Flipkart',
    icon: Package,
    color: 'bg-blue-500',
    url: 'https://flipkart.com',
    description: 'India\'s shopping destination'
  },
  {
    name: 'Myntra',
    icon: Shirt,
    color: 'bg-pink-500',
    url: 'https://myntra.com',
    description: 'Fashion & lifestyle'
  },
  {
    name: 'Jio',
    icon: Smartphone,
    color: 'bg-blue-600',
    url: 'https://jio.com',
    description: 'Digital services'
  },
  {
    name: 'Nykaa',
    icon: Sparkles,
    color: 'bg-purple-500',
    url: 'https://nykaa.com',
    description: 'Beauty & wellness'
  },
  {
    name: 'Meesho',
    icon: Store,
    color: 'bg-green-500',
    url: 'https://meesho.com',
    description: 'Social commerce'
  }
];

function LinkGenerator() {
  const { links, generateLink, loading } = useAffiliateLinks();
  const [customUrl, setCustomUrl] = useState('');
  const [productName, setProductName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleBrandClick = async (brand: typeof PARTNER_BRANDS[0]) => {
    setIsGenerating(true);
    try {
      const result = await generateLink(brand.url, `${brand.name} Store`);
      if (result.error) {
        alert('Error generating link: ' + result.error);
      } else {
        // Redirect to the affiliate URL
        window.open(result.data?.affiliate_url, '_blank');
      }
    } catch (error) {
      alert('Error generating link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomLinkGenerate = async () => {
    if (!customUrl.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateLink(customUrl, productName || undefined);
      if (result.error) {
        alert('Error generating link: ' + result.error);
      } else {
        setGeneratedLink(result.data?.affiliate_url || null);
      }
    } catch (error) {
      alert('Error generating link');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const results = await cuelinksAPI.searchProducts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSelect = async (product: any) => {
    setIsGenerating(true);
    try {
      const result = await generateLink(product.url, product.name);
      if (result.error) {
        alert('Error generating link: ' + result.error);
      } else {
        setGeneratedLink(result.data?.affiliate_url || null);
      }
    } catch (error) {
      alert('Error generating link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Link Generator</h1>
        <p className="text-gray-600">Generate affiliate links for your favorite brands and products</p>
      </div>

      {/* Partner Brands */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Partner Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PARTNER_BRANDS.map((brand) => {
            const IconComponent = brand.icon;
            return (
              <button
                key={brand.name}
                onClick={() => handleBrandClick(brand)}
                disabled={isGenerating}
                className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`w-12 h-12 ${brand.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{brand.name}</h3>
                <p className="text-xs text-gray-500">{brand.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Search */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Search Products</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Search Results</h3>
              <div className="grid gap-3">
                {searchResults.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-600">{product.brand} • ₹{product.price}</p>
                    </div>
                    <button
                      onClick={() => handleProductSelect(product)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Generate Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom URL Generator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Custom URL Generator</h2>
          <button
            onClick={() => setShowCustomDialog(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate Custom Link
          </button>
        </div>
      </div>

      {/* Recent Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Affiliate Links</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading your links...</p>
            </div>
          ) : links.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {links.map((link) => (
                <div key={link.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {link.product_name || 'Affiliate Link'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {link.brand} • {link.commission_rate}% commission
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{link.clicks} clicks</span>
                        <span>{link.conversions} conversions</span>
                        <span className="text-green-600 font-medium">₹{link.earnings} earned</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(link.affiliate_url)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(link.affiliate_url, '_blank')}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Open link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No affiliate links yet</p>
              <p className="text-sm text-gray-400">Generate your first affiliate link to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Link Dialog */}
      {showCustomDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Custom Affiliate Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product URL *
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/product"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Product name for tracking"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {generatedLink && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Affiliate Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={generatedLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={() => copyToClipboard(generatedLink)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCustomDialog(false);
                  setCustomUrl('');
                  setProductName('');
                  setGeneratedLink(null);
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomLinkGenerate}
                disabled={isGenerating || !customUrl.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Generate Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkGenerator;