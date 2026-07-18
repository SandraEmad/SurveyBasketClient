
export interface IQuestion {
  id?: number;
  content: string;
  answers: AnswerItem[];
}

export interface AnswerItem {
  id?: number;
  content: string;
}

