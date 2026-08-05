import { Zap } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-16 bg-orange-600 rounded-2xl flex items-center justify-center animate-pulse">
          <Zap className="size-9 text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="size-2 rounded-full bg-orange-600 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
