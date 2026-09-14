import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { SmartInsight } from '../../types';

interface SmartInsightsCardProps {
  insights: SmartInsight[];
  onOpenAssistant: () => void;
}

export const SmartInsightsCard: React.FC<SmartInsightsCardProps> = ({
  insights,
  onOpenAssistant,
}) => {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 p-5 shadow-xs transition-all dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Smart Insights & Mentor Tips
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Personalized algorithmic study recommendations
            </p>
          </div>
        </div>

        <button
          id="btn-open-ai-insights-chat"
          onClick={onOpenAssistant}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          <span>Ask Assistant</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => {
          let badgeColor = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300';
          let icon = <Lightbulb className="h-4 w-4 text-indigo-500" />;

          if (insight.type === 'warning') {
            badgeColor = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
            icon = <AlertTriangle className="h-4 w-4 text-rose-500" />;
          } else if (insight.type === 'praise') {
            badgeColor = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
            icon = <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
          } else if (insight.type === 'alert') {
            badgeColor = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
            icon = <TrendingUp className="h-4 w-4 text-amber-500" />;
          }

          return (
            <div
              key={insight.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs backdrop-blur-xs transition-all hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-800/60"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    {icon}
                    <span>{insight.title}</span>
                  </div>
                  {insight.metric && (
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                      {insight.metric}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                  {insight.description}
                </p>
              </div>

              {insight.actionText && (
                <button
                  onClick={onOpenAssistant}
                  className="mt-3 text-left text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {insight.actionText} →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
