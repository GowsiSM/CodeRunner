import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function LabPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6 inline-flex p-4 rounded-full bg-primary/10">
          <div className="w-16 h-16 text-primary/50 flex items-center justify-center">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Lab
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          This section is currently under development. New experimental features and advanced tools are coming soon!
        </p>

        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-card text-foreground hover:bg-card/90 transition-colors duration-200 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
