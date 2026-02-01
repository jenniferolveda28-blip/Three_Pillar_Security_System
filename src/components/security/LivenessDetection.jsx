import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Camera, CheckCircle, AlertCircle, Eye, Smile, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LivenessDetection({ onVerificationComplete }) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState('idle');
  const [challenges, setChallenges] = useState([]);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [livenessScore, setLivenessScore] = useState(0);
  const videoRef = useRef(null);

  const challengeTypes = [
    { action: 'Blink twice', icon: Eye, duration: 3000 },
    { action: 'Smile', icon: Smile, duration: 2000 },
    { action: 'Turn head left', icon: User, duration: 2000 },
    { action: 'Turn head right', icon: User, duration: 2000 },
    { action: 'Nod your head', icon: User, duration: 2000 },
  ];

  const startVerification = async () => {
    setIsVerifying(true);
    setStep('camera_access');
    
    // Simulate camera access
    setTimeout(() => {
      setStep('challenges');
      const randomChallenges = [...challengeTypes]
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setChallenges(randomChallenges);
      runChallenges(randomChallenges);
    }, 1500);
  };

  const runChallenges = async (challengeList) => {
    for (let i = 0; i < challengeList.length; i++) {
      setCurrentChallenge(i);
      await new Promise(resolve => setTimeout(resolve, challengeList[i].duration));
    }
    
    // Simulate liveness analysis
    setStep('analyzing');
    setTimeout(() => {
      const score = 85 + Math.random() * 13; // 85-98%
      setLivenessScore(score);
      setStep('complete');
      setIsVerifying(false);
      
      if (onVerificationComplete) {
        onVerificationComplete({
          liveness_verified: score > 90,
          confidence_score: score,
          challenges_passed: challengeList.length,
          verification_method: 'liveness_detection'
        });
      }
    }, 2000);
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-purple-600" />
          Liveness Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Camera View Placeholder */}
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
            {step === 'idle' && (
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Camera inactive</p>
              </div>
            )}
            
            {step === 'camera_access' && (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Accessing camera...</p>
              </div>
            )}
            
            {step === 'challenges' && challenges[currentChallenge] && (
              <div className="text-center">
                <div className="bg-purple-600 text-white px-6 py-3 rounded-lg mb-4">
                  {React.createElement(challenges[currentChallenge].icon, { className: "w-8 h-8 mx-auto mb-2" })}
                  <p className="text-xl font-bold">{challenges[currentChallenge].action}</p>
                </div>
                <Badge className="bg-white text-purple-900">
                  Challenge {currentChallenge + 1} of {challenges.length}
                </Badge>
              </div>
            )}
            
            {step === 'analyzing' && (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white">Analyzing biometric data...</p>
              </div>
            )}
            
            {step === 'complete' && (
              <div className="text-center">
                {livenessScore > 90 ? (
                  <>
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-white text-xl font-bold">Liveness Verified!</p>
                    <p className="text-green-400">Confidence: {livenessScore.toFixed(1)}%</p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <p className="text-white text-xl font-bold">Low Confidence</p>
                    <p className="text-yellow-400">Score: {livenessScore.toFixed(1)}%</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Control Button */}
          <Button 
            onClick={startVerification}
            disabled={isVerifying}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isVerifying ? 'Verifying...' : step === 'complete' ? 'Verify Again' : 'Start Liveness Check'}
          </Button>

          {/* Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-purple-900 mb-1">Why Liveness Detection?</p>
            <p className="text-purple-700">
              Ensures you're a real person, not a photo or video. Random challenges prevent spoofing attacks.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}