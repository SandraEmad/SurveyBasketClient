
export interface IQuestion {
  id?: number;
  content: string;
  answers: AnswerItem[];
  isActive?: boolean;
  isExpanded?: boolean;
  isSaved?: boolean;
}

export interface AnswerItem {
  id?: number;
  text: string;
}