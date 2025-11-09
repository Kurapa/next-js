// src/components/marketplace/CategoryCard.tsx
"use client";

import { ArrowRight, Info } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  href: string;
  badge?: string;
  info?: string;
}

export default function CategoryCard({
  title,
  description,
  icon,
  gradient,
  href,
  badge,
  info,
}: CategoryCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className={`relative bg-gradient-to-br ${gradient} rounded-3xl p-8 text-white cursor-pointer overflow-hidden group hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl`}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="relative z-10">
        {/* Badge */}
        {badge && (
          <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-semibold">
            {badge}
          </div>
        )}

        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-3xl font-bold mb-3">{title}</h3>
        <p className="text-white/90 text-lg mb-6 leading-relaxed">{description}</p>

        {/* Info */}
        {info && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90">{info}</p>
            </div>
          </div>
        )}

        {/* Button */}
        <button className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all group-hover:gap-4">
          <span>Explore Now</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Decorative Element */}
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
          <div className="absolute inset-0 animate-pulse">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}