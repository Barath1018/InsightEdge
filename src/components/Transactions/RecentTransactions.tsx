import React from 'react';
import { Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'paid' | 'pending' | 'processing';
}

const RecentTransactions: React.FC = () => {
  const transactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Website Redesign',
      category: 'Marketing',
      amount: 2500,
      type: 'expense',
      status: 'paid',
    },
    {
      id: '2',
      date: '2024-01-14',
      description: 'Office Supplies',
      category: 'Operations',
      amount: 320,
      type: 'expense',
      status: 'paid',
    },
    {
      id: '3',
      date: '2024-01-12',
      description: 'Product Sales',
      category: 'Revenue',
      amount: 8750,
      type: 'income',
      status: 'pending',
    },
    {
      id: '4',
      date: '2024-01-10',
      description: 'Cloud Hosting',
      category: 'Technology',
      amount: 120,
      type: 'expense',
      status: 'paid',
    },
    {
      id: '5',
      date: '2024-01-08',
      description: 'Consulting Services',
      category: 'Professional Fees',
      amount: 1200,
      type: 'expense',
      status: 'processing',
    },
    {
      id: '6',
      date: '2024-01-05',
      description: 'Monthly Subscription Revenue',
      category: 'Revenue',
      amount: 4500,
      type: 'income',
      status: 'paid',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Marketing': 'bg-purple-100 text-purple-800',
      'Operations': 'bg-blue-100 text-blue-800',
      'Revenue': 'bg-green-100 text-green-800',
      'Technology': 'bg-indigo-100 text-indigo-800',
      'Professional Fees': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number, type: 'income' | 'expense') => {
    const formatted = `$${amount.toLocaleString()}`;
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Date</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Description</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Category</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(transaction.date)}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(transaction.category)}`}>
                    {transaction.category}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentTransactions;