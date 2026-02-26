'use client';

import React from 'react';
import Link from 'next/link';
import { HomeIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppRoutes } from '@/constants/AppRoutes';

interface ParticlesProps {
  className?: string;
  quantity?: number;
}

const Particles = ({ className = '', quantity = 50 }: ParticlesProps) => (
  <div
    className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
  >
    {[...Array(quantity)].map((_, index) => (
      <div
        key={index}
        className="absolute w-1.5 h-1.5 bg-primary/45 rounded-full"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`
        }}
      />
    ))}
  </div>
);

const NotFoundPage = () => (
  <div className="relative min-h-screen flex items-center justify-center px-6 py-12 bg-white text-foreground overflow-hidden">
    <Particles quantity={70} className="pointer-events-none" />
    <div className="relative text-center max-w-2xl mx-auto z-10">
      {/* 404 Illustration */}
      <div className="mb-8 select-none animate-bounce-slow">
        <svg
          className="w-48 h-48 md:w-64 md:h-64 mx-auto text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15h8" />
          <path d="M9 9h.01" />
          <path d="M15 9h.01" />
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground animate-fade-in">
        404
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground animate-fade-in-up">
        Oops! Page Not Found
      </h2>
      <p className="mb-8 text-base md:text-lg text-muted-foreground animate-fade-in-up delay-100">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center animate-fade-in-up delay-200">
        <Button asChild size="lg" className="gap-2 capitalize w-full sm:w-auto">
          <Link href={AppRoutes.HOME}>
            <HomeIcon className="w-5 h-5" />
            Back to Home
          </Link>
        </Button>

        <Button
          onClick={() => window.history.back()}
          variant="outline"
          size="lg"
          className="gap-2 w-full sm:w-auto hover:bg-gray-50/80"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    </div>
  </div>
);

export default NotFoundPage;
