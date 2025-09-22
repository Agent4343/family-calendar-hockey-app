'use client';

import React, { useState } from 'react';
import { useSMS, SMSSettings, FamilyMemberWithPhone } from '@/lib/sms-service';
import { useCalendarStore } from '@/lib/calendar-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface SMSSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SMSSettingsDialog({ isOpen, onClose }: SMSSettingsDialogProps) {
  const { settings, updateSettings, sendTestMessage, getTemplates } = useSMS();
  const { familyMembers, actions } = useCalendarStore();

  const [localSettings, setLocalSettings] = useState<SMSSettings>(settings);
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert family members to include SMS data
  const [smsMembers, setSmsMembers] = useState<FamilyMemberWithPhone[]>(() =>
    familyMembers.map(member => ({
      ...member,
      phoneNumber: '',
      smsEnabled: true,
      preferredReminders: [
        { id: 'sms-15', minutes: 15, isEnabled: true, type: 'notification' }
      ],
      emergencyContact: false,
      carrier: 'verizon'
    }))
  );

  const carriers = [
    { value: 'verizon', label: 'Verizon' },
    { value: 'att', label: 'AT&T' },
    { value: 'tmobile', label: 'T-Mobile' },
    { value: 'sprint', label: 'Sprint' },
    { value: 'boost', label: 'Boost Mobile' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'metropcs', label: 'MetroPCS' },
    { value: 'uscellular', label: 'US Cellular' },
    { value: 'virgin', label: 'Virgin Mobile' },
    { value: 'xfinity', label: 'Xfinity Mobile' }
  ];

  const handleSaveSettings = () => {
    updateSettings(localSettings);
    // Save SMS member data to localStorage
    localStorage.setItem('family-calendar-sms-members', JSON.stringify(smsMembers));
    onClose();
  };

  const handleTestSMS = async () => {
    if (!testPhone) {
      setTestResult('Please enter a phone number to test');
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendTestMessage(testPhone);
      setTestResult(success 
        ? '✅ Test message sent successfully!' 
        : '❌ Failed to send test message. Check your settings.'
      );
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMember = (memberId: string, updates: Partial<FamilyMemberWithPhone>) => {
    setSmsMembers(prev => 
      prev.map(member => 
        member.id === memberId ? { ...member, ...updates } : member
      )
    );
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 10) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    }
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] md:w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            📱 SMS & Text Message Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="family">Family Numbers</TabsTrigger>
            <TabsTrigger value="templates">Messages</TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Enable SMS Notifications</Label>
                <Switch
                  checked={localSettings.isEnabled}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, isEnabled: checked }))
                  }
                />
              </div>

              {localSettings.isEnabled && (
                <>
                  <Alert>
                    <AlertDescription>
                      SMS notifications allow family members to receive text message reminders for events. 
                      Choose your preferred method below.
                    </AlertDescription>
                  </Alert>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">SMS Provider</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select
                        value={localSettings.provider}
                        onValueChange={(value: any) => 
                          setLocalSettings(prev => ({ ...prev, provider: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email-sms">
                            📧 Email-to-SMS (Free - requires carrier info)
                          </SelectItem>
                          <SelectItem value="twilio">
                            💰 Twilio (Paid - most reliable)
                          </SelectItem>
                          <SelectItem value="webhook">
                            🔗 Custom Webhook (Advanced)
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Email-to-SMS Settings */}
                      {localSettings.provider === 'email-sms' && (
                        <Alert>
                          <AlertDescription>
                            <strong>Free Option:</strong> This uses email-to-SMS gateways. 
                            You'll need to know each family member's mobile carrier. 
                            Messages may take longer to deliver.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Twilio Settings */}
                      {localSettings.provider === 'twilio' && (
                        <div className="space-y-4">
                          <Alert>
                            <AlertDescription>
                              <strong>Premium Option:</strong> Requires a Twilio account. 
                              Most reliable delivery but costs ~$0.0075 per SMS.
                            </AlertDescription>
                          </Alert>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Account SID</Label>
                              <Input
                                value={localSettings.accountSid || ''}
                                onChange={(e) => 
                                  setLocalSettings(prev => ({ ...prev, accountSid: e.target.value }))
                                }
                                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                              />
                            </div>
                            <div className="space-y-2">
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
                            <div className="space-y-2">
                              <Label>From Phone Number</Label>
                              <Input
                                value={localSettings.fromNumber || ''}
                                onChange={(e) => 
                                  setLocalSettings(prev => ({ ...prev, fromNumber: e.target.value }))
                                }
                                placeholder="+1234567890"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Webhook Settings */}
                      {localSettings.provider === 'webhook' && (
                        <div className="space-y-4">
                          <Alert>
                            <AlertDescription>
                              <strong>Advanced Option:</strong> Send SMS data to your custom webhook endpoint. 
                              You handle the actual SMS delivery.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-2">
                            <Label>Webhook URL</Label>
                            <Input
                              value={localSettings.webhookUrl || ''}
                              onChange={(e) => 
                                setLocalSettings(prev => ({ ...prev, webhookUrl: e.target.value }))
                              }
                              placeholder="https://your-api.com/send-sms"
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Test SMS */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Test Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex space-x-2">
                        <Input
                          value={testPhone}
                          onChange={(e) => setTestPhone(formatPhoneNumber(e.target.value))}
                          placeholder="(555) 123-4567"
                          maxLength={14}
                        />
                        <Button 
                          onClick={handleTestSMS}
                          disabled={isLoading || !testPhone}
                        >
                          {isLoading ? 'Sending...' : 'Test SMS'}
                        </Button>
                      </div>
                      
                      {testResult && (
                        <Alert>
                          <AlertDescription>{testResult}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </TabsContent>

          {/* Family Numbers Tab */}
          <TabsContent value="family" className="space-y-6">
            <Alert>
              <AlertDescription>
                Add phone numbers for family members to receive text message reminders. 
                Mark emergency contacts for urgent notifications.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {smsMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        <h3 className="font-semibold">{member.name}</h3>
                        {member.emergencyContact && (
                          <Badge variant="destructive">Emergency Contact</Badge>
                        )}
                      </div>
                      <Switch
                        checked={member.smsEnabled}
                        onCheckedChange={(checked) => 
                          updateMember(member.id, { smsEnabled: checked })
                        }
                      />
                    </div>

                    {member.smsEnabled && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Phone Number</Label>
                          <Input
                            value={member.phoneNumber || ''}
                            onChange={(e) => 
                              updateMember(member.id, { 
                                phoneNumber: formatPhoneNumber(e.target.value) 
                              })
                            }
                            placeholder="(555) 123-4567"
                            maxLength={14}
                          />
                        </div>

                        {localSettings.provider === 'email-sms' && (
                          <div className="space-y-2">
                            <Label>Mobile Carrier</Label>
                            <Select
                              value={member.carrier || 'verizon'}
                              onValueChange={(value) => 
                                updateMember(member.id, { carrier: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {carriers.map(carrier => (
                                  <SelectItem key={carrier.value} value={carrier.value}>
                                    {carrier.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Settings</Label>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={member.emergencyContact}
                              onCheckedChange={(checked) => 
                                updateMember(member.id, { emergencyContact: checked })
                              }
                            />
                            <span className="text-sm">Emergency Contact</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Alert>
              <AlertDescription>
                These are the message templates used for different types of notifications. 
                Variables like {'{eventTitle}'} and {'{memberName}'} are automatically replaced.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {getTemplates().map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                        {template.template}
                      </div>
                      <div className="text-xs text-gray-500">
                        Variables: {template.variables.join(', ')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
            Save SMS Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}