import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SharedRequirementSection({ id, number, title, intro, items }) {
  return (
    <Card id={id} className="bg-slate-800/60 border-slate-700 scroll-mt-20">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-sm">{number}</span> {title}
        </CardTitle>
        {intro && <p className="text-sm text-slate-400">{intro}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <code className="text-xs text-cyan-400 font-mono">{item.id}</code>
              <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                {item.priority}
              </Badge>
              <Badge variant="outline" className="text-xs text-amber-300 border-amber-500/40">
                Status: Not yet validated
              </Badge>
            </div>
            <p className="text-sm text-slate-200">{item.text}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}