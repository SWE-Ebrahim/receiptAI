import React from 'react';
import type { ValidationError } from '../../../services/scanApi';

interface ValidationErrorsProps {
  errors: ValidationError[];
  warnings: ValidationError[];
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors, warnings }) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {errors.map((error, index) => (
        <div
          key={`error-${index}`}
          className="flex items-start gap-3 p-4 rounded-xl bg-error-container/20 border border-error/30"
        >
          <span className="material-symbols-outlined text-error shrink-0">error</span>
          <div>
            <p className="text-error text-sm font-medium">{error.message}</p>
            <p className="text-error/70 text-xs mt-1 capitalize">{error.field}</p>
          </div>
        </div>
      ))}

      {warnings.map((warning, index) => (
        <div
          key={`warning-${index}`}
          className={`flex items-start gap-3 p-4 rounded-xl border ${
            warning.type === 'warning'
              ? 'bg-warning-container/20 border-warning/30'
              : 'bg-info-container/20 border-info/30'
          }`}
        >
          <span
            className={`material-symbols-outlined shrink-0 ${
              warning.type === 'warning' ? 'text-warning' : 'text-info'
            }`}
          >
            {warning.type === 'warning' ? 'warning' : 'info'}
          </span>
          <div>
            <p
              className={`text-sm font-medium ${
                warning.type === 'warning' ? 'text-warning' : 'text-info'
              }`}
            >
              {warning.message}
            </p>
            <p
              className={`text-xs mt-1 capitalize ${
                warning.type === 'warning' ? 'text-warning/70' : 'text-info/70'
              }`}
            >
              {warning.field}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValidationErrors;
