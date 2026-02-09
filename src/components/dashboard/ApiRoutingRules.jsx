import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiRoutingRules({ universes }) {
    const [rules, setRules] = useState([
        { id: '1', condition: 'latency > 500ms', action: 'fallback', target: 'backup-api', enabled: true },
        { id: '2', condition: 'error_rate > 5%', action: 'switch', target: 'secondary-api', enabled: true }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        condition: '',
        action: 'fallback',
        target: ''
    });

    const handleSave = () => {
        if (!formData.condition || !formData.target) {
            toast.error('Please fill in all fields');
            return;
        }

        if (editingId) {
            setRules(rules.map(r => r.id === editingId ? { ...r, ...formData } : r));
            toast.success('Rule updated');
        } else {
            setRules([...rules, { id: Date.now().toString(), ...formData, enabled: true }]);
            toast.success('Rule added');
        }

        setFormData({ condition: '', action: 'fallback', target: '' });
        setIsAdding(false);
        setEditingId(null);
    };

    const handleEdit = (rule) => {
        setFormData({ condition: rule.condition, action: rule.action, target: rule.target });
        setEditingId(rule.id);
        setIsAdding(true);
    };

    const handleDelete = (id) => {
        setRules(rules.filter(r => r.id !== id));
        toast.success('Rule deleted');
    };

    const toggleRule = (id) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    return (
        <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Custom Routing Rules & Fallback Strategies</CardTitle>
                    <Button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rule
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAdding && (
                    <Card className="bg-slate-800/50 border-slate-600">
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">Condition</label>
                                <Input
                                    placeholder="e.g., latency > 500ms"
                                    value={formData.condition}
                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                    className="bg-slate-900 border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">Action</label>
                                <Select value={formData.action} onValueChange={(value) => setFormData({ ...formData, action: value })}>
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fallback">Fallback</SelectItem>
                                        <SelectItem value="switch">Switch</SelectItem>
                                        <SelectItem value="retry">Retry</SelectItem>
                                        <SelectItem value="alert">Alert Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-2 block">Target Universe</label>
                                <Select value={formData.target} onValueChange={(value) => setFormData({ ...formData, target: value })}>
                                    <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                        <SelectValue placeholder="Select universe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {universes.map(u => (
                                            <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </Button>
                                <Button 
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingId(null);
                                        setFormData({ condition: '', action: 'fallback', target: '' });
                                    }}
                                    variant="outline"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {rules.map(rule => (
                        <Card key={rule.id} className="bg-slate-800/50 border-slate-700">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={rule.enabled ? "default" : "outline"} className={rule.enabled ? "bg-green-600" : ""}>
                                                {rule.enabled ? "Active" : "Disabled"}
                                            </Badge>
                                            <Badge variant="outline">{rule.action}</Badge>
                                        </div>
                                        <p className="text-white font-medium mb-1">
                                            If <span className="text-cyan-400">{rule.condition}</span>
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            Then {rule.action} to <span className="text-emerald-400">{rule.target}</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => toggleRule(rule.id)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            {rule.enabled ? '⏸' : '▶'}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleEdit(rule)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => handleDelete(rule.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}