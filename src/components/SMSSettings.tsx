'use client';

import React, { useState, useEffect } from 'react';
import { useCalendarStore } from '@/lib/calendar-store';
import { useSMS, SMSSettings as SMSSettingsType, FamilyMemberWithPhone } from '@/lib/sms-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface SMSSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SMSSettings({ isOpen, onClose }: SMSSettingsProps) {
  const { familyMembers } = useCalendarStore();
  const { settings, updateSettings, sendTestMessage, getTemplates } = useSMS();
  
  const [localSettings, setLocalSettings] = useState<SMSSettingsType>(settings);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingActive, setIsTestingActive] = useState(false);
  const [membersWithPhone, setMembersWithPhone] = useState<FamilyMemberWithPhone[]>([]);

  // Initialize members with phone data
  useEffect(() => {
    const storedPhoneData = localStorage.getItem('family-calendar-phone-data');
    let phoneData: Record<string, Partial<FamilyMemberWithPhone>> = {};
    
    if (storedPhoneData) {
      try {
        phoneData = JSON.parse(storedPhoneData);
      } catch (error) {
        console.error('Error parsing phone data:', error);
      }
    }

    const enhanced = familyMembers.map(member => ({
      ...member,
      phoneNumber: phoneData[member.id]?.phoneNumber || '',
      smsEnabled: phoneData[member.id]?.smsEnabled ?? false,
      preferredReminders: phoneData[member.id]?.preferredReminders || [
        { id: 'default-sms', minutes: 15, isEnabled: true, type: 'notification' }
      ],
      emergencyContact: phoneData[member.id]?.emergencyContact ?? false,
      carrier: phoneData[member.id]?.carrier || 'verizon'
    }));

    setMembersWithPhone(enhanced);
  }, [familyMembers]);

  // Save phone data
  const savePhoneData = (updatedMembers: FamilyMemberWithPhone[]) => {
    const phoneData: Record<string, Partial<FamilyMemberWithPhone>> = {};
    
    updatedMembers.forEach(member => {
      phoneData[member.id] = {
        phoneNumber: member.phoneNumber,
        smsEnabled: member.smsEnabled,
        preferredReminders: member.preferredReminders,
        emergencyContact: member.emergencyContact,
        carrier: member.carrier
      };
    });

    localStorage.setItem('family-calendar-phone-data', JSON.stringify(phoneData));
    setMembersWithPhone(updatedMembers);
  };

  // Update member phone data
  const updateMemberPhone = (memberId: string, updates: Partial<FamilyMemberWithPhone>) => {
    const updated = membersWithPhone.map(member =>
      member.id === memberId ? { ...member, ...updates } : member
    );
    savePhoneData(updated);
  };

  // Handle settings save
  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  // Test SMS configuration
  const handleTestSMS = async () => {
    if (!testPhoneNumber) {
      setTestResult('Please enter a phone number to test');
      return;
    }

    setIsTestingActive(true);
    setTestResult(null);

    try {
      const success = await sendTestMessage(testPhoneNumber);
      setTestResult(success 
        ? '✅ Test message sent successfully!' 
        : '❌ Failed to send test message. Check your configuration.'
      );
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingActive(false);
    }
  };

  // Carrier options
  const carrierOptions = [
    // Canadian Carriers (Most Popular First) 
    { value: 'telus', label: '🇨🇦 Telus' },
    { value: 'rogers', label: '🇨🇦 Rogers' },
    { value: 'bell', label: '🇨🇦 Bell' },
    { value: 'fido', label: '🇨🇦 Fido' },
    { value: 'koodo', label: '🇨🇦 Koodo' },
    { value: 'chatr', label: '🇨🇦 Chatr' },
    { value: 'freedom', label: '🇨🇦 Freedom Mobile' },
    { value: 'virgin-ca', label: '🇨🇦 Virgin Plus' },
    { value: 'lucky', label: '🇨🇦 Lucky Mobile' },
    
    // US Carriers
    { value: 'verizon', label: '🇺🇸 Verizon' },
    { value: 'att', label: '🇺🇸 AT&T' },
    { value: 'tmobile', label: '🇺🇸 T-Mobile' },
    { value: 'sprint', label: '🇺🇸 Sprint' },
    { value: 'boost', label: '🇺🇸 Boost Mobile' },
    { value: 'cricket', label: '🇺🇸 Cricket' },
    { value: 'metropcs', label: '🇺🇸 Metro PCS' },
    { value: 'uscellular', label: '🇺🇸 US Cellular' },
    { value: 'virgin', label: '🇺🇸 Virgin Mobile' },
    { value: 'xfinity', label: '🇺🇸 Xfinity Mobile' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-semibold">
            SMS & Text Message Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="family">Family Numbers</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMS Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable SMS Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Send text message reminders to family members
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.isEnabled}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, isEnabled: checked }))
                    }
                  />
                </div>

                {localSettings.isEnabled && (
                  <>
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label>SMS Provider</Label>
                      <Select
                        value={localSettings.provider}
                        onValueChange={(value: string) => 
                          setLocalSettings(prev => ({ ...prev, provider: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email-sms">
                            📧 Email-to-SMS (Free) - Recommended
                          </SelectItem>
                          <SelectItem value="twilio">
                            💰 Twilio (Premium - $0.0075/message)
                          </SelectItem>
                          <SelectItem value="webhook">
                            🔗 Custom Webhook
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Email-to-SMS Configuration */}
                    {localSettings.provider === 'email-sms' && (
                      <Card className="bg-blue-50 dark:bg-blue-900/20">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">
                              📧 Email-to-SMS Gateway (FREE)
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-200">
                              This method sends texts by emailing your carrier's SMS gateway. 
                              It's completely free but requires knowing each person's carrier.
                            </p>
                            <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                              <p className="text-xs font-mono">
                                <strong>How it works:</strong><br/>
                                • Verizon: 5551234567@vtext.com<br/>
                                • AT&amp;T: 5551234567@txt.att.net<br/>
                                • T-Mobile: 5551234567@tmomail.net
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Twilio Configuration */}
                    {localSettings.provider === 'twilio' && (
                      <Card className="bg-green-50 dark:bg-green-900/20">
                        <CardContent className="pt-4 space-y-3">
                          <h4 className="font-medium text-green-900 dark:text-green-100">
                            💰 Twilio Configuration (Premium)
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-200">
                            Professional SMS service - $0.0075 per message. Requires Twilio account.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Account SID</Label>
                              <Input
                                value={localSettings.accountSid || ''}
                                onChange={(e) => 
                                  setLocalSettings(prev => ({ ...prev, accountSid: e.target.value }))
                                }
                                placeholder="AC..."
                              />
                            </div>
                            <div>
                              <Label>Auth Token</Label>
                              <Input
                                type="password"
                                value={localSettings.apiKey || ''}
                                onChange={(e) => 
                                  setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))
                                }
                                placeholder="Your auth token"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>From Phone Number</Label>
                            <Input
                              value={localSettings.fromNumber || ''}
                              onChange={(e) => 
                                setLocalSettings(prev => ({ ...prev, fromNumber: e.target.value }))
                              }
                              placeholder="+1234567890"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Webhook Configuration */}
                    {localSettings.provider === 'webhook' && (
                      <Card className="bg-purple-50 dark:bg-purple-900/20">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-3">
                            🔗 Custom Webhook Integration
                          </h4>
                          <div>
                            <Label>Webhook URL</Label>
                            <Input
                              value={localSettings.webhookUrl || ''}
                              onChange={(e) => 
                                setLocalSettings(prev => ({ ...prev, webhookUrl: e.target.value }))
                              }
                              placeholder="https://your-api.com/send-sms"
                            />
                            <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                              Your endpoint will receive: &#123;&quot;phoneNumber&quot;, &quot;message&quot;, &quot;timestamp&quot;&#125;
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Separator />

                    {/* Test Configuration */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Test Configuration</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={testPhoneNumber}
                          onChange={(e) => setTestPhoneNumber(e.target.value)}
                          placeholder="Enter phone number to test"
                          className="flex-1"
                        />
                        <Button
                          onClick={handleTestSMS}
                          disabled={isTestingActive || !localSettings.isEnabled}
                          variant="outline"
                        >
                          {isTestingActive ? 'Testing...' : 'Test SMS'}
                        </Button>
                      </div>
                      {testResult && (
                        <div className={`p-3 rounded border text-sm ${
                          testResult.startsWith('✅') 
                            ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20' 
                            : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20'
                        }`}>
                          {testResult}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Family Numbers */}
          <TabsContent value="family" className="space-y-4">
            <div className="grid gap-4">
              {membersWithPhone.map(member => (
                <Card key={member.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: member.color }}
                      />
                      <span>{member.name}</span>
                      {member.emergencyContact && (
                        <Badge variant="destructive" className="text-xs">
                          Emergency Contact
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Enable SMS for {member.name}</Label>
                      <Switch
                        checked={member.smsEnabled}
                        onCheckedChange={(checked) => 
                          updateMemberPhone(member.id, { smsEnabled: checked })
                        }
                      />
                    </div>

                    {member.smsEnabled && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Phone Number</Label>
                            <Input
                              value={member.phoneNumber || ''}
                              onChange={(e) => 
                                updateMemberPhone(member.id, { phoneNumber: e.target.value })
                              }
                              placeholder="(555) 123-4567"
                            />
                          </div>
                          
                          {localSettings.provider === 'email-sms' && (
                            <div>
                              <Label>Carrier</Label>
                              <Select
                                value={member.carrier || 'verizon'}
                                onValueChange={(value) => 
                                  updateMemberPhone(member.id, { carrier: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {carrierOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Emergency Contact</Label>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Receives urgent and high-priority notifications
                            </p>
                          </div>
                          <Switch
                            checked={member.emergencyContact}
                            onCheckedChange={(checked) => 
                              updateMemberPhone(member.id, { emergencyContact: checked })
                            }
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* SMS Statistics */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="pt-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {membersWithPhone.filter(m => m.smsEnabled).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      SMS Enabled
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {membersWithPhone.filter(m => m.phoneNumber).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Have Numbers
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {membersWithPhone.filter(m => m.emergencyContact).length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Emergency Contacts
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getTemplates().map(template => (
                  <div key={template.id} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.variables.length} variables
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {template.template}
                    </p>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">
                        Variables: {template.variables.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}