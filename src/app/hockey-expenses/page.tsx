'use client';

import React, { useState, useEffect } from 'react';
import { useHockeyStore } from '@/lib/hockey-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { HockeyNavigation } from '@/components/HockeyNavigation';
import { HockeyExpense } from '@/types/hockey';

export default function HockeyExpensesPage() {
  const {
    players,
    currentPlayer,
    expenses,
    expenseSummaries,
    selectedSeason,
    actions
  } = useHockeyStore();

  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<HockeyExpense | null>(null);
   const [expenseForm, setExpenseForm] = useState<{
    category: HockeyExpense['category'];
    subcategory: string;
    description: string;
    amount: number;
    date: string;
    paidBy: HockeyExpense['paidBy'];
    paymentMethod: HockeyExpense['paymentMethod'];
    vendor: string;
    receipt: string;
    isRecurring: boolean;
    recurringFrequency: HockeyExpense['recurringFrequency'];
    season: string;
    isTaxDeductible: boolean;
    isReimbursed: boolean;
    reimbursedAmount: number;
    notes: string;
    tags: string[];
  }>({
    category: 'Equipment',
    subcategory: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paidBy: 'Parent',
    paymentMethod: 'Credit Card',
    vendor: '',
    receipt: '',
    isRecurring: false,
    recurringFrequency: 'Monthly',
    season: selectedSeason,
    isTaxDeductible: false,
    isReimbursed: false,
    reimbursedAmount: 0,
    notes: '',
    tags: []
  });

  const currentExpenseSummary = expenseSummaries.find(s => s.season === selectedSeason);
  const seasonExpenses = expenses
    .filter(expense => expense.season === selectedSeason && expense.playerId === currentPlayer?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  useEffect(() => {
    if (currentPlayer && seasonExpenses.length > 0) {
      actions.calculateExpenseSummary(selectedSeason);
    }
  }, [currentPlayer, selectedSeason, expenses.length, actions, seasonExpenses.length]);

  const handleAddExpense = () => {
    if (!currentPlayer) return;

    const newExpense = {
      playerId: currentPlayer.id,
      ...expenseForm,
      tags: expenseForm.tags.filter(tag => tag.trim() !== '')
    };

    if (editingExpense) {
      actions.updateExpense(editingExpense.id, newExpense);
    } else {
      actions.addExpense(newExpense);
    }

    // Reset form
    setExpenseForm({
      category: 'Equipment',
      subcategory: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paidBy: 'Parent',
      paymentMethod: 'Credit Card',
      vendor: '',
      receipt: '',
      isRecurring: false,
      recurringFrequency: 'Monthly',
      season: selectedSeason,
      isTaxDeductible: false,
      isReimbursed: false,
      reimbursedAmount: 0,
      notes: '',
      tags: []
    });
    setEditingExpense(null);
    setShowExpenseDialog(false);
  };

  const handleEditExpense = (expense: HockeyExpense) => {
    setEditingExpense(expense);
    setExpenseForm({
      category: expense.category,
      subcategory: expense.subcategory || '',
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      paidBy: expense.paidBy,
      paymentMethod: expense.paymentMethod,
      vendor: expense.vendor || '',
      receipt: expense.receipt || '',
      isRecurring: expense.isRecurring,
      recurringFrequency: expense.recurringFrequency || 'Monthly',
      season: expense.season,
      isTaxDeductible: expense.isTaxDeductible,
      isReimbursed: expense.isReimbursed,
      reimbursedAmount: expense.reimbursedAmount || 0,
      notes: expense.notes || '',
      tags: expense.tags || []
    });
    setShowExpenseDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Registration': '📋',
      'Equipment': '🥅',
      'Travel': '🚗',
      'Tournaments': '🏆',
      'Training': '🏃',
      'Ice Time': '🧊',
      'Team Fees': '👥',
      'Food & Lodging': '🏨',
      'Gas & Mileage': '⛽',
      'Other': '📝'
    };
    return icons[category] || '💰';
  };

  const expenseCategories = [
    'Registration',
    'Equipment', 
    'Travel',
    'Tournaments',
    'Training',
    'Ice Time',
    'Team Fees',
    'Food & Lodging',
    'Gas & Mileage',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                💰 Hockey Expenses
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track all hockey-related costs and expenses
              </p>
            </div>

            <div className="flex items-center gap-3">
              <HockeyNavigation currentPage="expenses" />
              
              <Select
                value={currentPlayer?.id || ''}
                onValueChange={(value) => {
                  const player = players.find(p => p.id === value);
                  actions.setCurrentPlayer(player || null);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select Player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      #{player.jerseyNumber} {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSeason}
                onValueChange={actions.setSelectedSeason}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-2025">2024-25</SelectItem>
                  <SelectItem value="2023-2024">2023-24</SelectItem>
                  <SelectItem value="2022-2023">2022-23</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6 pb-20 md:pb-4">
        {!currentPlayer ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="text-6xl">💰</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Hockey Expense Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Select a player above to start tracking hockey expenses, costs, and manage your budget.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="expenses">All Expenses</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              {currentExpenseSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(currentExpenseSummary.totalExpenses)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(currentExpenseSummary.totalReimbursed)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Reimbursed</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(currentExpenseSummary.netExpenses)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Net Cost</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(currentExpenseSummary.expensesPerMonth)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Per Month</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Category Breakdown */}
              {currentExpenseSummary && Object.keys(currentExpenseSummary.categoryTotals).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(currentExpenseSummary.categoryTotals)
                        .sort(([,a], [,b]) => b.total - a.total)
                        .map(([category, data]) => (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCategoryIcon(category)}</span>
                                <span className="font-medium">{category}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {data.count} items
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{formatCurrency(data.total)}</div>
                                <div className="text-sm text-gray-500">
                                  {data.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <Progress value={data.percentage} className="h-2" />
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button onClick={() => setShowExpenseDialog(true)} className="flex-1 md:flex-none">
                  Add Expense
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none">
                  Export to CSV
                </Button>
                <Button variant="outline" className="flex-1 md:flex-none">
                  Tax Report
                </Button>
              </div>
            </TabsContent>

            {/* All Expenses Tab */}
            <TabsContent value="expenses" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">All Expenses</h2>
                <Button onClick={() => setShowExpenseDialog(true)}>
                  Add Expense
                </Button>
              </div>

              <div className="space-y-3">
                {seasonExpenses.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <div className="text-4xl mb-4">💰</div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No expenses recorded yet. Add your first expense to get started!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  seasonExpenses.map((expense) => (
                    <Card key={expense.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <CardContent className="p-4" onClick={() => handleEditExpense(expense)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                            <div>
                              <div className="font-semibold">{expense.description}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {expense.category}
                                {expense.subcategory && ` • ${expense.subcategory}`}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(expense.date).toLocaleDateString()} • Paid by {expense.paidBy}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {formatCurrency(expense.amount)}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {expense.isRecurring && (
                                <Badge variant="secondary" className="text-xs">
                                  Recurring
                                </Badge>
                              )}
                              {expense.isTaxDeductible && (
                                <Badge variant="outline" className="text-xs">
                                  Tax Deductible
                                </Badge>
                              )}
                              {expense.isReimbursed && (
                                <Badge variant="default" className="text-xs bg-green-600">
                                  Reimbursed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {expense.notes && (
                          <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                            {expense.notes}
                          </div>
                        )}
                        
                        {expense.tags.length > 0 && (
                          <div className="mt-3 flex gap-1 flex-wrap">
                            {expense.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <h2 className="text-xl font-semibold">Expenses by Category</h2>
              
              {currentExpenseSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(currentExpenseSummary.categoryTotals)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .map(([category, data]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="text-2xl">{getCategoryIcon(category)}</span>
                            {category}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Spent</span>
                              <span className="font-semibold">{formatCurrency(data.total)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Number of Items</span>
                              <span className="font-semibold">{data.count}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Average per Item</span>
                              <span className="font-semibold">{formatCurrency(data.total / data.count)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">% of Total</span>
                              <span className="font-semibold">{data.percentage.toFixed(1)}%</span>
                            </div>
                            <Progress value={data.percentage} className="h-2 mt-2" />
                          </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Budget Analysis Tab */}
            <TabsContent value="budget" className="space-y-6">
              <h2 className="text-xl font-semibold">Budget Analysis & Projections</h2>
              
              {currentExpenseSummary && (
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Season Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Current Season</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Total Expenses:</span>
                              <span className="font-semibold">{formatCurrency(currentExpenseSummary.totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Reimbursements:</span>
                              <span className="font-semibold text-green-600">
                                -{formatCurrency(currentExpenseSummary.totalReimbursed)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="font-semibold">Net Cost:</span>
                              <span className="font-semibold">{formatCurrency(currentExpenseSummary.netExpenses)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Monthly Averages</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Per Month:</span>
                              <span className="font-semibold">{formatCurrency(currentExpenseSummary.expensesPerMonth)}</span>
                            </div>
                            {currentExpenseSummary.expensesPerGame > 0 && (
                              <div className="flex justify-between">
                                <span>Per Game:</span>
                                <span className="font-semibold">{formatCurrency(currentExpenseSummary.expensesPerGame)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Tax Information</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Tax Deductible:</span>
                              <span className="font-semibold text-blue-600">
                                {formatCurrency(currentExpenseSummary.totalTaxDeductible)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax Savings (est.):</span>
                              <span className="font-semibold text-green-600">
                                {formatCurrency(currentExpenseSummary.totalTaxDeductible * 0.25)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Year-End Projections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-4">Projected Season Total</h4>
                          <div className="text-3xl font-bold text-blue-600 mb-2">
                            {formatCurrency(currentExpenseSummary.projectedYearTotal)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Based on current monthly spending average
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-4">Remaining Budget Impact</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Projected Total:</span>
                              <span>{formatCurrency(currentExpenseSummary.projectedYearTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current Spent:</span>
                              <span>{formatCurrency(currentExpenseSummary.totalExpenses)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 font-semibold">
                              <span>Estimated Remaining:</span>
                              <span>
                                {formatCurrency(Math.max(0, currentExpenseSummary.projectedYearTotal - currentExpenseSummary.totalExpenses))}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Common Hockey Expense Estimates */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Typical AAA Hockey Costs (Reference)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <h5 className="font-semibold mb-2">Registration & Fees</h5>
                          <div className="space-y-1 text-gray-600">
                            <div>Team Registration: $3,000 - $8,000</div>
                            <div>League Fees: $500 - $1,500</div>
                            <div>Insurance: $200 - $500</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">Equipment</h5>
                          <div className="space-y-1 text-gray-600">
                            <div>Full Equipment Set: $1,000 - $3,000</div>
                            <div>Stick Replacements: $300 - $800</div>
                            <div>Protective Gear: $500 - $1,200</div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">Travel & Tournaments</h5>
                          <div className="space-y-1 text-gray-600">
                            <div>Tournament Fees: $2,000 - $5,000</div>
                            <div>Travel Costs: $3,000 - $8,000</div>
                            <div>Hotels & Food: $2,000 - $6,000</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                        <strong>Total Annual Cost Range:</strong> $12,000 - $35,000 CAD for AAA hockey
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Add/Edit Expense Dialog */}
      <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={expenseForm.category}
                  onValueChange={(value) => setExpenseForm(prev => ({ ...prev, category: value as HockeyExpense['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {getCategoryIcon(category)} {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subcategory (Optional)</Label>
                <Input
                  value={expenseForm.subcategory}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="e.g., Helmet, Tournament fees"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={expenseForm.description}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., New hockey helmet, Tournament registration"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (CAD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Paid By</Label>
                <Select
                  value={expenseForm.paidBy}
                  onValueChange={(value: string) => setExpenseForm(prev => ({ ...prev, paidBy: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Player">Player</SelectItem>
                    <SelectItem value="Parent">Parent</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Team">Team</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select
                  value={expenseForm.paymentMethod}
                  onValueChange={(value: string) => setExpenseForm(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="E-Transfer">E-Transfer</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Vendor/Store (Optional)</Label>
              <Input
                value={expenseForm.vendor}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="e.g., Sport Chek, Canadian Tire, Tournament organizer"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={expenseForm.isRecurring}
                  onCheckedChange={(checked) => setExpenseForm(prev => ({ ...prev, isRecurring: checked }))}
                />
                <Label>Recurring Expense</Label>
              </div>

              {expenseForm.isRecurring && (
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={expenseForm.recurringFrequency}
                    onValueChange={(value: string) => setExpenseForm(prev => ({ ...prev, recurringFrequency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  checked={expenseForm.isTaxDeductible}
                  onCheckedChange={(checked) => setExpenseForm(prev => ({ ...prev, isTaxDeductible: checked }))}
                />
                <Label>Tax Deductible</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={expenseForm.isReimbursed}
                  onCheckedChange={(checked) => setExpenseForm(prev => ({ ...prev, isReimbursed: checked }))}
                />
                <Label>Reimbursed</Label>
              </div>

              {expenseForm.isReimbursed && (
                <div>
                  <Label>Reimbursed Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={expenseForm.amount}
                    value={expenseForm.reimbursedAmount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, reimbursedAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                value={expenseForm.notes}
                onChange={(e) => setExpenseForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this expense..."
              />
            </div>

            <div>
              <Label>Tags (Optional)</Label>
              <Input
                value={expenseForm.tags.join(', ')}
                onChange={(e) => setExpenseForm(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                }))}
                placeholder="e.g., tournament, away game, equipment replacement"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExpenseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hockey Navigation for Mobile */}
      <HockeyNavigation currentPage="expenses" />
    </div>
  );
}