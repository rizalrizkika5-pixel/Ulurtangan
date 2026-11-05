import React from 'react';
import { Campaign } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { DeadlineBadge } from '../common/DeadlineBadge';
import { formatIDR, formatDateID } from '../../utils/formatters';
import { HeartHandshake, Users, MapPin, Calendar } from 'lucide-react';

interface Props {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<Props> = ({ campaign, onSelect }) => {
  const percent =
    campaign.targetAmount > 0
      ? Math.min(100, Math.round((campaign.collectedAmount / campaign.targetAmount) * 100))
      : 0;

  const getProgramBadge = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div
      onClick={() => onSelect(campaign)}
      className="p-5 bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#173D32] text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
            {getProgramBadge(campaign.programType)}
          </span>
          <StatusBadge status={campaign.status} type="campaign" />
        </div>

        <h3 className="font-bold text-slate-900 text-sm group-hover:text-[#173D32] transition line-clamp-2 leading-snug">
          {campaign.title}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{campaign.location || 'Indonesia'}</span>
        </div>

        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {campaign.description}
        </p>

        {/* Financial Progress */}
        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex justify-between items-baseline text-xs mb-1.5">
            <span className="text-slate-500 font-medium">Terkumpul:</span>
            <span className="font-bold text-emerald-800 font-mono">
              {formatIDR(campaign.collectedAmount)}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-1.5">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Target: {formatIDR(campaign.targetAmount)}</span>
            <span className="font-bold text-slate-700">{percent}%</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium">
            {campaign.targetBeneficiaries || 0} Penerima Manfaat
          </span>
        </div>
        <DeadlineBadge deadline={campaign.deadline} />
      </div>
    </div>
  );
};
