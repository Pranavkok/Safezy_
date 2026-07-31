'use client';

import React from 'react';
import { CapaPoints } from '@/types/ehs.types';

type CapaListKey = keyof CapaPoints;

interface Props {
  value: CapaPoints;
  onChange: (value: CapaPoints) => void;
}

const CapaPointsEditor = ({ value, onChange }: Props) => {
  const updatePoint = (key: CapaListKey, index: number, point: string) => {
    onChange({
      ...value,
      [key]: value[key].map((item, itemIndex) =>
        itemIndex === index ? point : item
      )
    });
  };

  const addPoint = (key: CapaListKey) => {
    onChange({ ...value, [key]: [...value[key], ''] });
  };

  const removePoint = (key: CapaListKey, index: number) => {
    onChange({
      ...value,
      [key]: value[key].filter((_, itemIndex) => itemIndex !== index)
    });
  };

  const renderList = (
    key: CapaListKey,
    title: string,
    description: string,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {value[key].length === 0 && (
        <p className="text-sm italic text-gray-400">No points added.</p>
      )}

      {value[key].map((point, index) => (
        <div key={`${key}-${index}`} className="flex items-start gap-2">
          <span className="mt-2 text-xs font-semibold text-gray-400">
            {index + 1}.
          </span>
          <textarea
            rows={2}
            value={point}
            onChange={event => updatePoint(key, index, event.target.value)}
            placeholder={placeholder}
            className="min-h-16 flex-1 resize-y rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => removePoint(key, index)}
            className="mt-1 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            aria-label={`Remove ${title.toLowerCase()} point ${index + 1}`}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addPoint(key)}
        className="rounded-md border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
      >
        + Add point
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderList(
        'corrective',
        'Corrective Actions',
        'Immediate actions to correct the current issue.',
        'Enter a corrective action'
      )}
      <div className="border-t border-gray-100" />
      {renderList(
        'preventive',
        'Preventive Actions',
        'Long-term actions to prevent recurrence.',
        'Enter a preventive action'
      )}
    </div>
  );
};

export default CapaPointsEditor;
