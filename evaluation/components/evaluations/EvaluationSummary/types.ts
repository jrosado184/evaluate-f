export type EvaluationSummaryProps = {
  evaluationId: string;
  onClose: () => void;
  onEdit?: () => void;
  onOpenStep2?: (args: { week: number }) => void;
  onOpenQualify?: (args: {
    evaluationId: string;
    employee_name?: string;
    department?: string;
    position?: string;
  }) => void;
  inSheet?: boolean;
};

export type InfoRowItem = {
  label: string;
  value: any;
};

export type WeekCardProps = {
  week: any;
  weekNumber: number;
  onEdit?: () => void;
  apiBase: string;
};

export type PersonalInfoSectionProps = {
  rows: InfoRowItem[];
  evaluation: any;
  evaluationId: string;
  onEdit?: () => void;
  onNavigateAfterClose: (to: any) => void;
};

export type EmptyEvaluationsStateProps = {
  onStart: () => void;
  submitting?: boolean;
};
