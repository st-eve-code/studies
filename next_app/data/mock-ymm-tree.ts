/**
 * Year-Make-Model tree for the YMM fitment selector.
 * Structured as: years[] -> makes[] -> models[]
 */

export interface YMMModelEntry {
  name: string;
  trims?: string[];
}

export interface YMMMakeEntry {
  name: string;
  models: YMMModelEntry[];
}

export interface YMMYearEntry {
  year: number;
  makes: YMMMakeEntry[];
}

export const ymmTree: YMMYearEntry[] = [
  ...Array.from({ length: 27 }, (_, i) => {
    const year = 2026 - i; // 2026 down to 2000
    return {
      year,
      makes: [
        {
          name: "Can-Am",
          models: [
            { name: "Maverick X3", trims: ["Turbo", "Turbo R", "Turbo RR", "X RS Turbo RR", "X MR Turbo"] },
            { name: "Maverick X3 Max", trims: ["Turbo", "X RS Turbo RR"] },
            { name: "Outlander 450", trims: ["Base", "DPS"] },
            { name: "Outlander 570", trims: ["Base", "DPS", "MAX DPS"] },
            { name: "Outlander 700", trims: ["Base", "DPS", "MAX DPS"] },
            { name: "Outlander 850", trims: ["Base", "DPS", "MAX DPS", "MAX XT"] },
            { name: "Outlander 1000R", trims: ["Base", "DPS", "MAX DPS", "MAX XT-P"] },
            { name: "Outlander MAX 1000R DPS", trims: ["DPS"] },
            { name: "Defender HD5", trims: ["Base", "DPS", "MAX"] },
            { name: "Defender HD8", trims: ["Base", "DPS", "MAX"] },
            { name: "Defender HD10", trims: ["Base", "DPS", "MAX", "MAX Limited"] },
            { name: "Renegade 570", trims: ["Base", "X xc"] },
            { name: "Renegade 1000R", trims: ["Base", "X xc", "X xc 1000R"] },
            { name: "Commander 700", trims: ["Base", "DPS"] },
            { name: "Commander 1000R", trims: ["Base", "DPS", "Limited", "XT"] },
          ],
        },
        {
          name: "Polaris",
          models: [
            { name: "RZR XP 1000", trims: ["Base", "High Lifter", "Trails & Rocks"] },
            { name: "RZR XP 4 1000", trims: ["Base", "Premium"] },
            { name: "RZR Pro R", trims: ["Base", "Premium", "Ultimate", "Sport"] },
            { name: "RZR Pro XP", trims: ["Base", "Premium", "Sport", "Ultimate"] },
            { name: "RZR Trail 900", trims: ["Base", "Premium", "S 900"] },
            { name: "General 1000", trims: ["Base", "Deluxe", "Premium", "EPS"] },
            { name: "General XP 1000", trims: ["Base", "Sport", "Deluxe", "Premium"] },
            { name: "Ranger 500", trims: ["Base", "Mid-Size"] },
            { name: "Ranger 570", trims: ["Base", "Mid-Size", "Crew"] },
            { name: "Ranger XP 1000", trims: ["Base", "NorthStar Edition", "Trail", "Crew"] },
            { name: "Sportsman 450 H.O.", trims: ["Base", "EPS", "Utility"] },
            { name: "Sportsman 570", trims: ["Base", "EPS", "Trail", "Hunt"] },
            { name: "Sportsman 850", trims: ["Base", "Trail", "High Lifter"] },
            { name: "Sportsman XP 1000", trims: ["Base", "Hunt Edition", "Trail"] },
          ],
        },
        {
          name: "Yamaha",
          models: [
            { name: "YZ125", trims: ["Base"] },
            { name: "YZ250", trims: ["Base"] },
            { name: "YZ250F", trims: ["Base", "Monster Edition"] },
            { name: "YZ450F", trims: ["Base", "Monster Edition", "Factory Edition"] },
            { name: "WR250F", trims: ["Base"] },
            { name: "WR450F", trims: ["Base"] },
            { name: "TT-R110E", trims: ["Base"] },
            { name: "TT-R125LE", trims: ["Base"] },
            { name: "Grizzly 350", trims: ["2WD", "4WD"] },
            { name: "Grizzly 700", trims: ["Base", "EPS", "EPS SE"] },
            { name: "Kodiak 450", trims: ["Base", "EPS"] },
            { name: "Kodiak 700", trims: ["Base", "EPS", "EPS SE"] },
            { name: "Raptor 700R", trims: ["Base", "SE"] },
            { name: "Viking 700", trims: ["Base", "EPS", "VI EPS"] },
            { name: "Wolverine X4", trims: ["850", "EPS SE"] },
          ],
        },
        {
          name: "Honda",
          models: [
            { name: "CRF125F", trims: ["Base", "Big Wheel"] },
            { name: "CRF150R", trims: ["Base", "Expert"] },
            { name: "CRF250R", trims: ["Base"] },
            { name: "CRF250RX", trims: ["Base"] },
            { name: "CRF450R", trims: ["Base", "Works Edition"] },
            { name: "CRF450RX", trims: ["Base"] },
            { name: "TRX250X", trims: ["Base"] },
            { name: "TRX300X", trims: ["Base"] },
            { name: "TRX420", trims: ["Rancher", "Rancher EPS", "Rancher 4x4"] },
            { name: "FourTrax Rancher 4x4 EPS", trims: ["Base", "PS", "AT PS"] },
            { name: "FourTrax Foreman 4x4", trims: ["Base", "EPS", "Rubicon"] },
            { name: "Pioneer 500", trims: ["Base", "Deluxe"] },
            { name: "Pioneer 700", trims: ["Base", "Deluxe", "4", "Trail"] },
            { name: "Talon 1000R", trims: ["Base", "FOX Live Valve"] },
            { name: "Talon 1000X", trims: ["Base", "FOX Live Valve"] },
          ],
        },
        {
          name: "Kawasaki",
          models: [
            { name: "KX100", trims: ["Base"] },
            { name: "KX112", trims: ["Base"] },
            { name: "KX250", trims: ["Base", "XC"] },
            { name: "KX450", trims: ["Base", "SR"] },
            { name: "KLX110R", trims: ["Base", "L"] },
            { name: "KLX300R", trims: ["Base"] },
            { name: "Brute Force 300", trims: ["Base"] },
            { name: "Brute Force 750 4x4i", trims: ["Base", "EPS"] },
            { name: "KRX 1000", trims: ["Base", "Special Edition"] },
            { name: "Teryx 800", trims: ["Base", "LE"] },
            { name: "Teryx4 800", trims: ["Base", "LE", "S LE"] },
            { name: "Ultra 310X", trims: ["Base"] },
            { name: "Ultra 310LX", trims: ["Base"] },
            { name: "Jet Ski STX 160", trims: ["Base", "LX", "X"] },
          ],
        },
        {
          name: "KTM",
          models: [
            { name: "50 SX", trims: ["Base"] },
            { name: "65 SX", trims: ["Base"] },
            { name: "85 SX", trims: ["17/14", "19/16"] },
            { name: "125 SX", trims: ["Base"] },
            { name: "150 SX", trims: ["Base"] },
            { name: "250 SX", trims: ["Base"] },
            { name: "250 SX-F", trims: ["Base"] },
            { name: "350 SX-F", trims: ["Base"] },
            { name: "450 SX-F", trims: ["Base", "Factory Edition"] },
            { name: "250 XC-F", trims: ["Base"] },
            { name: "350 XC-F", trims: ["Base"] },
            { name: "450 XC-F", trims: ["Base"] },
          ],
        },
        {
          name: "Sea-Doo",
          models: [
            { name: "Spark", trims: ["90 hp", "60 hp", "TRIXX"] },
            { name: "GTI 90", trims: ["Base", "SE"] },
            { name: "GTI 130", trims: ["Base", "SE"] },
            { name: "GTX 170", trims: ["Base", "Limited"] },
            { name: "GTX 300", trims: ["Base", "Limited"] },
            { name: "RXT-X 300", trims: ["Base"] },
            { name: "RXP-X 300", trims: ["Base"] },
            { name: "RXP-X 325", trims: ["Base"] },
            { name: "Fish Pro Scout", trims: ["Base", "Trophy"] },
            { name: "Switch 18", trims: ["Base", "Sport", "Cruise"] },
          ],
        },
        {
          name: "Ski-Doo",
          models: [
            { name: "MXZ X 850 E-TEC", trims: ["Base"] },
            { name: "Renegade X 900 ACE Turbo", trims: ["Base"] },
            { name: "Summit X 850 E-TEC", trims: ["Base", "Turbo R"] },
            { name: "Freeride 165", trims: ["850 E-TEC", "850 E-TEC Turbo"] },
            { name: "Expedition Sport 600", trims: ["Base", "EFI"] },
            { name: "Expedition SE 900 ACE", trims: ["Base", "Turbo"] },
            { name: "Backcountry X 850 E-TEC", trims: ["Base"] },
          ],
        },
        {
          name: "Arctic Cat",
          models: [
            { name: "Alterra 300", trims: ["Base", "LTD"] },
            { name: "Alterra 600", trims: ["Base", "XT"] },
            { name: "Alterra TRV 700", trims: ["Base", "XT"] },
            { name: "Wildcat Trail", trims: ["1000", "LTD"] },
            { name: "Wildcat XX", trims: ["Base", "LTD"] },
            { name: "ZR 200", trims: ["Base"] },
            { name: "ZR 600 RR", trims: ["Base"] },
            { name: "ZR 9000 Thundercat", trims: ["Base"] },
          ],
        },
        {
          name: "CFMOTO",
          models: [
            { name: "CForce 500", trims: ["Base", "EPS", "S EPS"] },
            { name: "CForce 600", trims: ["Base", "EPS", "Touring EPS"] },
            { name: "CForce 800", trims: ["Base", "EPS XC"] },
            { name: "CForce 1000", trims: ["Base", "EPS Overland"] },
            { name: "ZForce 800", trims: ["Base", "EX", "Trail"] },
            { name: "ZForce 950", trims: ["H.O.", "Sport", "Trail"] },
            { name: "UForce 1000", trims: ["Base", "XL EPS"] },
          ],
        },
      ],
    };
  }),
];

/**
 * Returns all unique makes for a given year.
 */
export function getMakesForYear(year: number): string[] {
  const entry = ymmTree.find((y) => y.year === year);
  if (!entry) return [];
  return entry.makes.map((m) => m.name);
}

/**
 * Returns all models for a given year and make.
 */
export function getModelsForYearMake(year: number, make: string): YMMModelEntry[] {
  const entry = ymmTree.find((y) => y.year === year);
  if (!entry) return [];
  const makeEntry = entry.makes.find((m) => m.name.toLowerCase() === make.toLowerCase());
  return makeEntry?.models ?? [];
}

/**
 * Returns all trims for a given year, make, and model.
 */
export function getTrimsForYMM(year: number, make: string, model: string): string[] {
  const models = getModelsForYearMake(year, make);
  const modelEntry = models.find((m) => m.name.toLowerCase() === model.toLowerCase());
  return modelEntry?.trims ?? [];
}

export const availableYears = ymmTree.map((y) => y.year);
