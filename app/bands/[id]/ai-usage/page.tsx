'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { aiAPI } from '@/lib/api';

export default function AIUsagePage() {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string;
  const { isAuthenticated } = useAuthStore();
  
  const [aiUsage, setAiUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (!bandId) return;

      try {
        const response = await aiAPI.getBandUsage(bandId);
        setAiUsage(response.data?.usage);
      } catch (error) {
        console.error('Failed to load AI usage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsage();
  }, [isAuthenticated, router, bandId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100">
        <div className="text-earth-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-earth-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold text-earth-900">AI Usage</h1>
          <p className="text-earth-700 mt-1">Track environmental impact and costs of AI features</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8">
        {!aiUsage || !aiUsage.totals || aiUsage.totals.uses === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <h3 className="text-lg font-medium text-earth-900 mb-2">No AI usage yet</h3>
            <p className="text-earth-700">AI usage metrics will appear here when you use AI features like proposal generation or profile writing</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-gradient-to-r from-cyber-50 to-rust-50 border border-cyber-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-cyber-900">🤖 This Month's Usage</h3>
                <span className="text-sm text-cyber-600">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-earth-600 mb-1">Total Uses</p>
                  <p className="text-3xl font-bold text-cyber-900">{aiUsage.totals.uses}</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-earth-600 mb-1">Energy</p>
                  <p className="text-2xl font-bold text-neon-700">{aiUsage.totals.energyKwh.toFixed(4)}</p>
                  <p className="text-xs text-earth-600">kWh</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-earth-600 mb-1">Water</p>
                  <p className="text-2xl font-bold text-neon-600">{aiUsage.totals.waterLiters.toFixed(4)}</p>
                  <p className="text-xs text-earth-600">liters</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-earth-600 mb-1">Carbon</p>
                  <p className="text-2xl font-bold text-rust">{aiUsage.totals.carbonKg.toFixed(4)}</p>
                  <p className="text-xs text-earth-600">kg CO₂</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <p className="text-xs text-earth-600 mb-1">Cost</p>
                  <p className="text-2xl font-bold text-cyber-900">${aiUsage.totals.cost.toFixed(2)}</p>
                </div>
              </div>

              <p className="text-sm text-cyber-700 mt-4">
                💡 This month's AI energy usage = running an LED light bulb for {(aiUsage.totals.energyKwh * 100).toFixed(0)} hours
              </p>
            </div>

           {/* Usage by Agent Type */}
            {Object.keys(aiUsage.byAgentType).length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-earth-900 mb-4">Usage by Agent Type</h3>
                <div className="space-y-3">
                {Object.entries(aiUsage.byAgentType).map(([type, stats]: [string, any]) => (
                    <div key={type} className="flex items-center justify-between py-3 border-b border-earth-200 last:border-b-0">
                    <div className="flex-1">
                        <p className="font-medium text-earth-900 capitalize">{type.replace('_', ' ')}</p>
                        <p className="text-sm text-earth-600">{stats.count || 0} uses</p>
                    </div>
                    <div className="text-right">
                        <p className="font-semibold text-earth-900">${(stats.cost || 0).toFixed(3)}</p>
                        {stats.energyKwh !== undefined && (
                        <p className="text-xs text-earth-600">{stats.energyKwh.toFixed(4)} kWh</p>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            </div>
            )}
            {/* Environmental Impact Context */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-earth-900 mb-4">Understanding AI Impact</h3>
              <div className="space-y-3 text-sm text-earth-700">
                <p>
                  <span className="font-medium">Energy:</span> AI models require electricity to run. We track this in kilowatt-hours (kWh).
                </p>
                <p>
                  <span className="font-medium">Water:</span> Data centers use water for cooling. Each AI request has a small water footprint.
                </p>
                <p>
                  <span className="font-medium">Carbon:</span> The carbon footprint depends on the energy source. We estimate CO₂ emissions in kilograms.
                </p>
                <p>
                  <span className="font-medium">Cost:</span> Financial cost of running AI models, helping you budget AI usage.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}