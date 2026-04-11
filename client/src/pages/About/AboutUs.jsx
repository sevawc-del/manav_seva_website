import React, { useEffect, useState } from 'react';
import { getAboutUs } from '../../utils/api';
import Loader from '../../components/Loader';
import MarkdownContent from '../../components/MarkdownContent';

const AboutUs = () => {
  const [aboutUs, setAboutUs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        const response = await getAboutUs();
        setAboutUs(response.data || null);
      } catch {
        setError('Failed to load About Us content.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUs();
  }, []);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 px-5 py-4 text-center text-slate-700">
          {error}
        </div>
      </div>
    );
  }

  const missionText =
    aboutUs?.mission ||
    'To provide comprehensive healthcare and education services to underserved communities, empowering individuals and families to lead healthier, more productive lives.';
  const visionText =
    aboutUs?.vision ||
    'A world where every individual has access to quality healthcare and education, regardless of their socioeconomic status.';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-6 py-7 text-white shadow-lg">
        <h1 className="text-3xl text-center font-bold md:text-left md:text-4xl">
          {aboutUs?.title || 'About Us'}
        </h1>
        <p className="mt-2 text-sm text-center text-sky-100 md:text-left md:text-base">
          Learn about our purpose, the communities we serve, and the long-term change we are building together.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-md">
        <div className="bg-gradient-to-r from-[var(--ngo-primary)] to-[var(--ngo-primary-strong)] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white">Our Identity</h2>
            <span className="rounded-full bg-white/25 px-2.5 py-1 text-xs font-semibold text-white">
              {aboutUs?.image ? 'Visual Story' : 'Content Overview'}
            </span>
          </div>
        </div>

        <div className="space-y-6 p-4 md:p-5">
          {aboutUs?.image ? (
            <img
              src={aboutUs.image}
              alt="About Us"
              className="mx-auto w-full max-w-5xl aspect-[16/9] max-h-[420px] rounded-2xl border border-slate-200 object-cover shadow-sm"
            />
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <article className="rounded-xl border border-[var(--ngo-border)] bg-slate-50 p-4 md:p-5">
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Mission
              </span>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Our Mission</h3>
              <div className="mt-2 text-slate-700">
                <MarkdownContent content={missionText} className="text-base leading-7" />
              </div>
            </article>

            <article className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 md:p-5">
              <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Vision
              </span>
              <h3 className="mt-3 text-xl font-semibold text-blue-900">Our Vision</h3>
              <div className="mt-2 text-slate-700">
                <MarkdownContent content={visionText} className="text-base leading-7" />
              </div>
            </article>
          </div>

          <article className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-3">
              <h2 className="text-xl font-semibold text-slate-900">About Us</h2>
            </div>
            <div className="p-4 md:p-5">
              <MarkdownContent
                content={aboutUs?.content || 'Content not available.'}
                className="text-[1.02rem] leading-8"
              />
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;


