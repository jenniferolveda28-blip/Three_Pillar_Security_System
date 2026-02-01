import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Zap, Crown, Rocket } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SubscriptionManager({ subscriptions, onUpdate }) {
  const plans = [
    {
      type: 'basic',
      name: 'Basic',
      price: '$9.99/mo',
      icon: Zap,
      color: 'blue',
      features: [
        '1 DNA Token',
        '5 Linked Accounts',
        '1,000 API Calls/month',
        'Basic Support'
      ],
      limits: { api_calls_limit: 1000, linked_accounts_limit: 5 }
    },
    {
      type: 'pro',
      name: 'Pro',
      price: '$29.99/mo',
      icon: Crown,
      color: 'purple',
      features: [
        '3 DNA Tokens',
        'Unlimited Linked Accounts',
        '10,000 API Calls/month',
        'Priority Support',
        'Advanced Security'
      ],
      limits: { api_calls_limit: 10000, linked_accounts_limit: 999 }
    },
    {
      type: 'enterprise',
      name: 'Enterprise',
      price: '$99.99/mo',
      icon: Rocket,
      color: 'green',
      features: [
        'Unlimited DNA Tokens',
        'Unlimited Linked Accounts',
        'Unlimited API Calls',
        '24/7 Support',
        'Custom Integration',
        'Dedicated Account Manager'
      ],
      limits: { api_calls_limit: 999999, linked_accounts_limit: 9999 }
    }
  ];

  const handleSubscribe = async (plan) => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.Subscription.create({
        token_serial: 'DNA-' + Math.random().toString(36).substr(2, 12).toUpperCase(),
        user_email: user.email,
        plan_type: plan.type,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_renew: true,
        api_calls_limit: plan.limits.api_calls_limit,
        api_calls_used: 0,
        linked_accounts_limit: plan.limits.linked_accounts_limit
      });

      toast.success(`Subscribed to ${plan.name} plan!`);
      onUpdate();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const activeSubscription = subscriptions.find(s => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {activeSubscription && (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Plan</p>
                <p className="text-lg font-bold capitalize">{activeSubscription.plan_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-lg font-bold">
                  {activeSubscription.api_calls_used || 0} / {activeSubscription.api_calls_limit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Renews On</p>
                <p className="text-sm font-medium">
                  {format(new Date(activeSubscription.end_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {activeSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = activeSubscription?.plan_type === plan.type;
            
            return (
              <Card 
                key={plan.type}
                className={`relative ${isCurrentPlan ? 'border-2 border-green-500' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">Current Plan</Badge>
                  </div>
                )}
                <CardHeader>
                  <div className={`p-3 bg-${plan.color}-100 rounded-lg w-fit mb-3`}>
                    <Icon className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">{plan.price}</div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full ${isCurrentPlan ? '' : `bg-${plan.color}-600 hover:bg-${plan.color}-700`}`}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}