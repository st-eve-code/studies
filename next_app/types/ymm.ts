export interface YMMSelection {
  year: number | null;
  make: string | null;
  model: string | null;
  trim?: string | null;
}

export interface YMMModel {
  name: string;
  trims?: string[];
}

export interface YMMTree {
  [year: number]: {
    [make: string]: YMMModel[];
  };
}

export interface YMMBranch {
  year: number;
  makes: {
    [make: string]: YMMModel[];
  };
}
