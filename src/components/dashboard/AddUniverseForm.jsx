import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Globe, X, Plus } from "lucide-react";

export default function AddUniverseForm({ onUniverseAdded, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_url: '',
    auth_type: 'api_key',
    capabilities: []
  });
  const [capabilityInput, setCapabilityInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCapability = () => {
    if (capabilityInput.trim() && !formData.capabilities.includes(capabilityInput.trim())) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, capabilityInput.trim()]
      });
      setCapabilityInput('');
    }
  };

  const handleRemoveCapability = (cap) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter(c => c !== cap)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.Universe.create({
        ...formData,
        status: 'active',
        last_check: new Date().toISOString(),
        error_count: 0,
        success_rate: 100
      });

      toast.success('Universe added successfully!');
      onUniverseAdded();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickTemplates = [
    {
      name: 'OpenWeather API',
      description: 'Weather data and forecasts',
      base_url: 'https://api.openweathermap.org/data/2.5',
      capabilities: ['weather', 'forecast', 'climate']
    },
    {
      name: 'News API',
      description: 'Global news articles',
      base_url: 'https://newsapi.org/v2',
      capabilities: ['news', 'headlines', 'articles']
    },
    {
      name: 'REST Countries',
      description: 'Country information',
      base_url: 'https://restcountries.com/v3.1',
      capabilities: ['geography', 'countries', 'data']
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Add New Universe
        </CardTitle>
        <CardDescription>Connect a new API service to your gateway</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Quick Templates */}
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Quick Templates</Label>
            <div className="flex gap-2 flex-wrap">
              {quickTemplates.map((template) => (
                <Button
                  key={template.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    ...template
                  })}
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Universe Name</Label>
              <Input
                id="name"
                placeholder="e.g., OpenWeather API"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What does this API provide?"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_url">Base URL</Label>
              <Input
                id="base_url"
                placeholder="https://api.example.com/v1"
                value={formData.base_url}
                onChange={(e) => setFormData({...formData, base_url: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_type">Authentication Type</Label>
              <Select 
                value={formData.auth_type} 
                onValueChange={(value) => setFormData({...formData, auth_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="oauth">OAuth</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Capabilities</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., weather, news, data"
                  value={capabilityInput}
                  onChange={(e) => setCapabilityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCapability())}
                />
                <Button type="button" onClick={handleAddCapability} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {formData.capabilities.map((cap) => (
                  <Badge key={cap} className="bg-indigo-100 text-indigo-700">
                    {cap}
                    <button
                      type="button"
                      onClick={() => handleRemoveCapability(cap)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                {loading ? 'Adding...' : 'Add Universe'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}