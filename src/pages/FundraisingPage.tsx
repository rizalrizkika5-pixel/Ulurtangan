import React from 'react';
import { Campaign, Donation } from '../types';
import { formatIDR, formatDateID } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { DeadlineBadge } from '../components/common/DeadlineBadge';
import { Sparkles, Coins, TrendingUp, AlertTriangle, ArrowUpRight, HeartHandshake } from 'lucide-react';

interface Props {
  campaigns: Campaign[];
  donations: Donation[];
  onSelectCampaign: (campaign: Campaign) => void;
}

export const FundraisingPage: React.FC<Props> = ({
  campaigns,
  donations,
  onSelectCampaign,
}) => {
  const totalTarget = campaigns.reduce((acc, c) => acc + (c.targetAmount || 0), 0);
  const totalCollected = campaigns.reduce((acc, c) => acc + (c.collectedAmount || 0), 0);
  const verifiedDonations = donations.filter((d) => d.status === 'TERVERIFIKASI');
  const uniqueDonorsCount = new Set(verifiedDonations.map((d) => d.donorName)).size;

  // Sorted by highest achievement percentage
  const sortedByPercent = [...campaigns].sort((a, b) => {
    const pB = b.targetAmount > 0 ? b.collectedAmount / b.targetAmount : 0;
    const pA = a.targetAmount > 0 ? a.collectedAmount / a.targetAmount : 0;
    return pB - pA;
  });

  // Campaigns needing publication boost (< 50% target and approaching deadline)
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const needBoostCampaigns = campaigns.filter((c) => {
    const percent = c.targetAmount > 0 ? (c.collectedAmount / c.targetAmount) * 100 : 0;
    return percent < 50 && c.status === 'FUNDRAISING';
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Manajemen Strategi & Capaian Fundraising</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Monitoring penghimpunan dana sosial amanah, efektivitas kampanye, dan sisa target
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          title="Total Dana Dihimpun"
          value={formatIDR(totalCollected)}
          subtitle="Donasi terverifikasi"
          icon={Coins}
          iconColor="text-emerald-700"
          bgColor="bg-emerald-50"
        />
        <StatCard
          title="Target Keseluruhan"
          value={formatIDR(totalTarget)}
          subtitle="Akumulasi campaign"
          icon={TrendingUp}
        />
        <StatCard
          title="Capaian Rata-Rata"
          value={totalTarget > 0 ? `${Math.round((totalCollected / totalTarget) * 100)}%` : '0%'}
          subtitle="Dari target total"
          icon={ArrowUpRight}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Donatur Terlibat"
          value={uniqueDonorsCount}
          subtitle="Muzakki & Muhsinin"
          icon={HeartHandshake}
        />
      </div>

      {/* Campaign Ranking Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Performing Campaigns */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Pencapaian Tertinggi</span>
            </h3>
            <span className="text-[11px] text-slate-400">Paling mendekati / melampaui target</span>
          </div>

          <div className="divide-y divide-slate-100">
            {sortedByPercent.slice(0, 5).map((c) => {
              const p = c.targetAmount > 0 ? Math.round((c.collectedAmount / c.targetAmount) * 100) : 0;
              return (
                <div
                  key={c.id}
                  onClick={() => onSelectCampaign(c)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                >
                  <div className="space-y-0.5 truncate">
                    <p className="font-bold text-slate-900 text-xs truncate">{c.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Terkumpul: <span className="font-mono font-bold text-emerald-800">{formatIDR(c.collectedAmount)}</span>{' '}
                      / {formatIDR(c.targetAmount)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 font-mono">
                      {p}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Campaigns Requiring Publication Support */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-rose-900 uppercase tracking-tight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Perlu Dukungan Publikasi (&lt; 50%)</span>
            </h3>
            <span className="text-[11px] text-rose-600 font-bold">{needBoostCampaigns.length} Campaign</span>
          </div>

          <div className="divide-y divide-slate-100">
            {needBoostCampaigns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Seluruh campaign fundraising telah melampaui target 50%!
              </div>
            ) : (
              needBoostCampaigns.slice(0, 5).map((c) => {
                const p = c.targetAmount > 0 ? Math.round((c.collectedAmount / c.targetAmount) * 100) : 0;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCampaign(c)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div className="space-y-0.5 truncate">
                      <p className="font-bold text-slate-900 text-xs truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-500">
                        PIC Fundraising: <span className="font-medium text-slate-800">{c.picFundraisingName}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <DeadlineBadge deadline={c.deadline} />
                      <span className="block font-mono text-[11px] font-bold text-amber-700 mt-1">
                        Capaian: {p}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
