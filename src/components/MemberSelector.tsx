'use client';

import React, { useState } from 'react';
import { useCalendarStore } from '@/lib/calendar-store';
import { DEFAULT_FAMILY_MEMBER_COLORS } from '@/types/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface MemberSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemberSelector({ isOpen, onClose }: MemberSelectorProps) {
  const { familyMembers, actions } = useCalendarStore();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_FAMILY_MEMBER_COLORS[0]);

  // Handle adding new member
  const handleAddMember = () => {
    if (newMemberName.trim()) {
      const usedColors = familyMembers.map(m => m.color);
      const availableColor = DEFAULT_FAMILY_MEMBER_COLORS.find(color => 
        !usedColors.includes(color)
      ) || DEFAULT_FAMILY_MEMBER_COLORS[0];

      actions.addFamilyMember({
        name: newMemberName.trim(),
        color: selectedColor || availableColor,
        isActive: true
      });

      setNewMemberName('');
      setSelectedColor(DEFAULT_FAMILY_MEMBER_COLORS[0]);
      setIsAddingMember(false);
    }
  };

  // Handle member name edit
  const handleUpdateMemberName = (memberId: string, newName: string) => {
    if (newName.trim()) {
      actions.updateFamilyMember(memberId, { name: newName.trim() });
      setEditingMember(null);
    }
  };

  // Handle member active toggle
  const handleToggleMemberActive = (memberId: string, isActive: boolean) => {
    actions.updateFamilyMember(memberId, { isActive });
  };

  // Handle member color change
  const handleColorChange = (memberId: string, color: string) => {
    actions.updateFamilyMember(memberId, { color });
  };

  // Handle member deletion
  const handleDeleteMember = (memberId: string) => {
    const member = familyMembers.find(m => m.id === memberId);
    if (member && window.confirm(`Are you sure you want to remove ${member.name}?`)) {
      actions.deleteFamilyMember(memberId);
    }
  };

  // Get available colors for a member (excluding others' colors)
  const getAvailableColors = (currentMemberId?: string): string[] => {
    const usedColors = familyMembers
      .filter(m => m.id !== currentMemberId)
      .map(m => m.color);
    
    return DEFAULT_FAMILY_MEMBER_COLORS.filter(color => !usedColors.includes(color));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Manage Family Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Existing Members */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Family Members</h3>
            
            <div className="space-y-3">
              {familyMembers.map(member => (
                <Card key={member.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Member Color */}
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600"
                          style={{ backgroundColor: member.color }}
                        />
                        
                        {/* Color Picker */}
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {getAvailableColors(member.id).concat([member.color]).map(color => (
                            <button
                              key={color}
                              className={`w-4 h-4 rounded-full border-2 hover:scale-110 transition-transform ${
                                color === member.color ? 'border-gray-800 dark:border-gray-200' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => handleColorChange(member.id, color)}
                              title={`Change to ${color}`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Member Name */}
                      <div className="flex-1">
                        {editingMember === member.id ? (
                          <div className="flex space-x-2">
                            <Input
                              value={member.name}
                              onChange={(e) => 
                                actions.updateFamilyMember(member.id, { name: e.target.value })
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleUpdateMemberName(member.id, member.name);
                                } else if (e.key === 'Escape') {
                                  setEditingMember(null);
                                }
                              }}
                              className="text-lg font-medium"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUpdateMemberName(member.id, member.name)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingMember(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3">
                            <h4 
                              className="text-lg font-medium text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                              onClick={() => setEditingMember(member.id)}
                            >
                              {member.name}
                            </h4>
                            {!member.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Click name to edit • {member.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>

                      {/* Member Actions */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={member.isActive}
                            onCheckedChange={(checked) => handleToggleMemberActive(member.id, checked)}
                          />
                          <Label className="text-sm">Active</Label>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add New Member */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Add New Member</h3>
              {!isAddingMember && (
                <Button onClick={() => setIsAddingMember(true)}>
                  Add Member
                </Button>
              )}
            </div>

            {isAddingMember && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">New Family Member</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="memberName" className="text-sm font-medium">
                      Name *
                    </Label>
                    <Input
                      id="memberName"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Enter family member name"
                      className="mt-1"
                      autoFocus
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex space-x-2 mt-2">
                      {getAvailableColors().map(color => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                            color === selectedColor 
                              ? 'border-gray-800 dark:border-gray-200 ring-2 ring-blue-500' 
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                          title={`Select ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      onClick={handleAddMember}
                      disabled={!newMemberName.trim()}
                      className="flex-1"
                    >
                      Add Member
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingMember(false);
                        setNewMemberName('');
                        setSelectedColor(DEFAULT_FAMILY_MEMBER_COLORS[0]);
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Tips for Managing Family Members
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Each family member gets their own color for easy identification</li>
              <li>• Inactive members won't appear in the calendar view</li>
              <li>• Click on a member's name to edit it</li>
              <li>• Colors help distinguish events at a glance</li>
            </ul>
          </div>

          {/* Statistics */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Family Statistics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total Members</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {familyMembers.length}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Active Members</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {familyMembers.filter(m => m.isActive).length}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} className="px-8">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}