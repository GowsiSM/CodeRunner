import { useNavigate } from 'react-router-dom';
import { Code2, Beaker } from 'lucide-react';
import codeRunnerLogo from "../assets/CodeRunner.png"
import fabricLogo from "../assets/fabric.png"

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img
              src={codeRunnerLogo}
              alt="CodeRunner Logo"
              className="h-16 w-auto"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              CodeRunner
            </h1>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-muted-foreground font-bold">by</span>
            <img
              src={fabricLogo}
              alt="FABRIC Logo"
              className="h-15 w-auto"
            />
          </div>
          
          <p className="text-lg text-muted-foreground">
            Choose your mode to get started
          </p>
        </div>

        {/* Two-Column Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor Card */}
          <div
            onClick={() => navigate('/editor')}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary hover:-translate-y-1"
          >
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <Code2 className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Editor
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Write, edit, and execute code in multiple programming languages with a powerful code editor.
              </p>
              
              <div className="inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                Get Started
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Lab Card */}
          <div
            onClick={() => navigate('/lab')}
            className="group relative overflow-hidden rounded-lg border border-border bg-card p-8 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary hover:-translate-y-1"
          >
            {/* Animated gradient background on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                <Beaker className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Lab
              </h2>
              
              <p className="text-muted-foreground mb-6">
                Explore experimental features and advanced tools. Coming soon!
              </p>
              
              <div className="inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                Explore
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
