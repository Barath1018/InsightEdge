import React, { useState } from 'react';
import { HelpCircle, Search, Book, MessageCircle, Mail, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'How do I interpret the profit margin chart?',
      answer: 'The profit margin chart shows your business profitability over time. A higher percentage indicates better efficiency in converting sales to profit. Look for trends and seasonal patterns to optimize your business strategy.',
      category: 'Charts & Analytics'
    },
    {
      id: '2',
      question: 'What triggers the low profit alerts?',
      answer: 'Low profit alerts are triggered when your current month\'s profit drops more than 30% below your average monthly profit. You can customize these thresholds in the Settings page.',
      category: 'Alerts & Notifications'
    },
    {
      id: '3',
      question: 'How often is the dashboard data updated?',
      answer: 'Dashboard data is updated in real-time when you add new transactions. Historical data and trends are recalculated automatically to provide the most current insights.',
      category: 'Data & Updates'
    },
    {
      id: '4',
      question: 'Can I export my reports to PDF?',
      answer: 'Yes! Go to the Reports section and click the download button next to any ready report. You can export monthly sales reports, expense analyses, and profit trend reports.',
      category: 'Reports & Export'
    },
    {
      id: '5',
      question: 'How do I add new expense categories?',
      answer: 'Navigate to Settings > Business Settings and scroll to the Expense Categories section. You can add, edit, or remove categories to match your business needs.',
      category: 'Settings & Configuration'
    },
    {
      id: '6',
      question: 'What should I do if my data looks incorrect?',
      answer: 'First, check your data entry for any errors. If the issue persists, try refreshing the page. For persistent problems, contact our support team with specific details about the discrepancy.',
      category: 'Troubleshooting'
    }
  ];

  const categories = Array.from(new Set(faqItems.map(item => item.category)));

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">How can we help you?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions, learn about features, or get in touch with our support team.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for help articles, FAQs, or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Book className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">User Guide</h3>
          <p className="text-sm text-gray-600 mb-4">
            Complete guide to using all dashboard features
          </p>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center mx-auto">
            Read Guide <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
          <p className="text-sm text-gray-600 mb-4">
            Chat with our support team in real-time
          </p>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center mx-auto">
            Start Chat <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="card text-center hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
          <p className="text-sm text-gray-600 mb-4">
            Send us a detailed message about your issue
          </p>
          <button className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center mx-auto">
            Send Email <ExternalLink className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSearchTerm('')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              searchTerm === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSearchTerm(category)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                searchTerm === category ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="card">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{faq.question}</h4>
                  <span className="text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    {faq.category}
                  </span>
                </div>
                {expandedFAQ === faq.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedFAQ === faq.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all categories above.
            </p>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
          <p className="mb-6 opacity-90">
            Our support team is here to help you get the most out of your business dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Contact Support
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors">
              Schedule a Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;