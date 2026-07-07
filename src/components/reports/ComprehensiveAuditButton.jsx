import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

export default function ComprehensiveAuditButton({ daysBack = 7, label = 'Compile Full Audit PDF', variant = 'default', size = 'default' }) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateComprehensiveAudit', { days_back: daysBack });
      const data = res.data || res;
      if (data.success && data.file_url) {
        window.open(data.file_url, '_blank');
        toast({
          title: 'Audit PDF Generated',
          description: `${data.pages} pages compiled · ${data.summary?.security_events || 0} security events · ${data.summary?.recommendations_count || 0} recommendations`,
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      toast({
        title: 'Generation Failed',
        description: err.message || 'Could not generate audit PDF',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleGenerate} disabled={loading} variant={variant} size={size}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
      {loading ? 'Compiling…' : label}
    </Button>
  );
}