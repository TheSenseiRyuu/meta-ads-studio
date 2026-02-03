export type Objective =
  | 'Sales'
  | 'Leads'
  | 'Traffic'
  | 'App Installs'
  | 'Awareness';

export type Placement = 'Feed' | 'Reels' | 'Stories' | 'Explore' | 'Messenger';
export type AspectRatio = 'Auto' | '1:1' | '4:5' | '9:16' | '1.91:1';

export type Tone =
  | 'Bold'
  | 'Playful'
  | 'Minimal'
  | 'Luxury'
  | 'Direct'
  | 'Warm'
  | 'Technical';

export interface BrandBrief {
  brandName: string;
  productName: string;
  category: string;
  audience: string;
  painPoints: string;
  benefits: string;
  offer: string;
  differentiators: string;
  proof: string;
  constraints: string;
  objective: Objective;
  placements: Placement[];
  aspectRatio: AspectRatio;
  tone: Tone;
  language: string;
  variants: number;
  budget: string;
}

export interface StrategyBoard {
  positioning: string;
  corePromise: string;
  audienceInsights: string[];
  angles: string[];
  hooks: string[];
  creativeDirections: string[];
  do: string[];
  dont: string[];
}

export interface AdVariant {
  id: string;
  name: string;
  placement: Placement;
  objective: Objective;
  format: string;
  primaryText: string;
  headline: string;
  description: string;
  cta: string;
  hook: string;
  visualConcept: string;
  imagePrompt: string;
  proof: string;
  offer: string;
  tone: string;
  keywords: string[];
  favorite?: boolean;
  visualSvg?: string;
}

export interface QualityAssurance {
  policyRisks: string[];
  suggestions: string[];
}

export interface GenerationResponse {
  strategy: StrategyBoard;
  variants: AdVariant[];
  qa: QualityAssurance;
}

export interface AdRun {
  id: string;
  createdAt: number;
  brandName: string;
  objective: Objective;
  variants: AdVariant[];
  strategy: StrategyBoard;
  qa: QualityAssurance;
}
