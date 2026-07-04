import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function GeneticTraitVerifier() {
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState(null);

  const traits = [
    { name: 'Eye Color', gene: 'OCA2/HERC2', match: 98.5 },
    { name: 'Hair Texture', gene: 'TCHH/LCE3', match: 97.2 },
    { name: 'Blood Type', gene: 'ABO/RHD', match: 100 },
    { name: 'Lactose Tolerance', gene: 'MCM6', match: 96.8 },
    { name: 'Earwax Type', gene: 'ABCC11', match: 99.1 }
  ];

  const handleVerify = async () => {
    setVerifying(true);
    
    // Simulate genetic analysis
    setTimeout(() => {
      setResults({
        overallMatch: 98.3,
        traits: traits,
        confidence: 'HIGH',
        timestamp: new Date().toISOString()
      });
      setVerifying(false);
      toast.success('Genetic traits verified successfully');
    }, 3000);
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-purple-600" />
            Advanced Genetic Trait Verification
          </div>
          {results && (
            <Badge className="bg-purple-600">
              {results.overallMatch}% Match (simulated — pending hardware validation)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!results ? (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Dna className="w-full h-full text-purple-600" />
            </motion.div>
            <p className="text-gray-600 mb-4">
              Verify genetic traits beyond basic DNA matching
            </p>
            <Button 
              onClick={handleVerify}
              disabled={verifying}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing DNA...
                </>
              ) : (
                <>
                  <Dna className="w-4 h-4 mr-2" />
                  Start Verification
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Overall Genetic Match</span>
                <Badge className="bg-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {results.confidence}
                </Badge>
              </div>
              <Progress value={results.overallMatch} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {results.overallMatch}% confidence across {traits.length} genetic markers (simulated — pending hardware validation)
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Verified Traits</p>
              {results.traits.map((trait, idx) => (
                <motion.div
                  key={trait.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-lg p-3 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium text-sm">{trait.name}</p>
                      <p className="text-xs text-gray-500">{trait.gene}</p>
                    </div>
                    <span className="text-sm font-bold text-purple-600">
                       {trait.match}% <span className="text-xs text-gray-400">(simulated)</span>
                     </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${trait.match}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <Button 
              onClick={() => setResults(null)}
              variant="outline"
              className="w-full"
            >
              Run New Verification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}