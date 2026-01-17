export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface WeatherSuggestion {
  text: string;
  icon: string;
  priority: SuggestionPriority;
}
