"use client";

import { useState } from "react";
import { Calculator, DollarSign, Percent, Calendar } from "lucide-react";
import { cn, formatCurrency, calcMonthlyPayment } from "@/lib/utils";

interface PaymentCalculatorProps {
  vehiclePrice: number;
  className?: string;
}

const TERM_OPTIONS = [24, 36, 48, 60, 72, 84];

export function PaymentCalculator({ vehiclePrice, className }: PaymentCalculatorProps) {
  const [downPayment, setDownPayment] = useState(Math.round(vehiclePrice * 0.1));
  const [apr, setApr] = useState(7.99);
  const [term, setTerm] = useState(60);

  const monthly = calcMonthlyPayment(vehiclePrice, downPayment, apr, term);
  const totalInterest = monthly * term - (vehiclePrice - downPayment);
  const totalCost = monthly * term + downPayment;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
        <Calculator className="size-4 text-orange-500" />
        Payment Estimator
      </h3>

      <div className="space-y-4">
        {/* Vehicle Price (read-only) */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Vehicle Price
          </label>
          <div className="relative mt-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              readOnly
              value={vehiclePrice.toLocaleString()}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/40 text-foreground"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex justify-between">
            Down Payment
            <span className="text-foreground font-bold">{formatCurrency(downPayment)}</span>
          </label>
          <input
            type="range"
            min={0}
            max={vehiclePrice}
            step={100}
            value={downPayment}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-full mt-2 accent-orange-600"
            aria-label="Down payment amount"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>$0</span>
            <span>{formatCurrency(vehiclePrice)}</span>
          </div>
        </div>

        {/* APR */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex justify-between">
            APR
            <span className="text-foreground font-bold">{apr}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={25}
            step={0.25}
            value={apr}
            onChange={(e) => setApr(Number(e.target.value))}
            className="w-full mt-2 accent-orange-600"
            aria-label="Annual percentage rate"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span>
            <span>25%</span>
          </div>
        </div>

        {/* Term */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
            Loan Term
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {TERM_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTerm(t)}
                className={cn(
                  "py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  t === term
                    ? "bg-orange-600 text-white border-orange-600"
                    : "border-border hover:border-orange-400 hover:text-orange-600"
                )}
              >
                {t} mo
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="mt-5 pt-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Est. Monthly Payment</span>
          <span className="text-2xl font-black text-orange-600">
            {formatCurrency(monthly)}<span className="text-sm font-semibold text-muted-foreground">/mo</span>
          </span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Amount Financed</span>
          <span>{formatCurrency(vehiclePrice - downPayment)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Est. Total Interest</span>
          <span>{formatCurrency(Math.max(0, totalInterest))}</span>
        </div>
        <div className="flex justify-between text-xs font-semibold">
          <span>Est. Total Cost</span>
          <span>{formatCurrency(totalCost)}</span>
        </div>
      </div>

      <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
        * Estimates are for illustration only. Actual rates depend on credit approval. Contact us for financing options.
      </p>

      <a
        href="/services/financing"
        className="mt-3 block w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 transition-colors"
      >
        Apply for Financing
      </a>
    </div>
  );
}
