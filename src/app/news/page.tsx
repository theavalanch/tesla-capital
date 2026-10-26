'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Newspaper, ExternalLink, Calendar, ArrowRight } from 'lucide-react';

export default function NewsPage() {
  const articles = [
    {
      title: 'Tesla reports stronger-than-expected Q3 earnings, driven by energy and AI',
      source: 'Reuters Financial',
      date: 'October 18, 2026',
      category: 'Earnings',
      image: '/images/hero-car.jpg',
      snippet:
        'Tesla, Inc. surpassed Wall Street quarterly estimates as energy storage gross margins expanded to 30.5% and automotive cost-of-goods-sold dropped below $34,000 per vehicle.',
    },
    {
      title: 'New Cybercab prototype impresses at Tesla AI Day 2026',
      source: 'Bloomberg Technology',
      date: 'October 12, 2026',
      category: 'Autonomous AI',
      image: '/images/promo-road.jpg',
      snippet:
        'Demonstrating dedicated two-seater autonomous Cybercabs operating without steering wheels or pedals, Elon Musk detailed the unsupervised commercial robotaxi rollout roadmap.',
    },
    {
      title: 'Tesla Megapack energy deployments hit new all-time quarterly record',
      source: 'CNBC Clean Energy',
      date: 'October 8, 2026',
      category: 'Energy Storage',
      image: '/images/energy-megapack.jpg',
      snippet:
        'Lathrop and Shanghai Megafactories reached run-rate production capacity of 40 GWh annually, cementing Tesla as the undisputed global leader in grid stabilization infrastructure.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090C] text-[#F3F4F6] flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-mono text-[#E82127] uppercase tracking-wider mb-2">
            <Newspaper className="w-4 h-4" />
            <span>Tesla Wire & Corporate Disclosures</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Tesla Investor Newsroom</h1>
          <p className="text-sm text-gray-400 mt-1">
            Official operational updates, product milestones, and SEC regulatory filings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <div
              key={idx}
              className="rounded-3xl bg-[#0E1117] border border-white/5 overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all"
            >
              <div>
                <div className="aspect-[16/10] relative w-full overflow-hidden">
                  <img
                    src={art.image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                    {art.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                    <span className="font-semibold text-gray-400">{art.source}</span>
                    <span>•</span>
                    <span>{art.date}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-[#E82127] transition-colors leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">{art.snippet}</p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#E82127] hover:underline"
                >
                  <span>Trade On This News</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
