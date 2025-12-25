'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/authStore';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated()) {
    return null;
  }

  return (
    <div style={{ backgroundColor: '#FAFAF7', fontFamily: 'Inter, system-ui, sans-serif', color: '#1E1E1E' }}>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '100vh', 
        padding: '48px 24px',
        position: 'relative'
      }}>
        {/* Top-left logo lockup */}
        <div style={{ position: 'absolute', top: '48px', left: '48px' }}>
          <Image src="/assets/logo_with_tagline.png" alt="BAND IT" width={280} height={120} priority />
        </div>

        {/* Centered hero content */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          maxWidth: '960px',
          margin: '0 auto'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '600', 
            lineHeight: '1.2', 
            marginBottom: '24px'
          }}>
            BAND together to imagine, decide, execute and learn.
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            lineHeight: '1.6', 
            marginBottom: '48px',
            maxWidth: '700px',
            color: '#4A4A4A'
          }}>
            BAND IT is a decision-to-execution system for groups or organizations that want collective power with structure, transparency, and accountability.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link 
              href="/register"
              style={{
                padding: '14px 32px',
                backgroundColor: '#D2691E',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Start a band
            </Link>
            <Link 
              href="#how-it-works"
              style={{
                padding: '14px 32px',
                backgroundColor: 'transparent',
                color: '#1E1E1E',
                border: '2px solid #1E1E1E',
                borderRadius: '8px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Learn how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2 - Founder Ant */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ 
          maxWidth: '960px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '24px' }}>
              Why collective power breaks down
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A' }}>
              Most groups have ideas and meetings, but responsibility blurs and execution stalls. BAND IT gives collective decisions structure, memory, and follow-through.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/assets/founder-ant.png" alt="" width={300} height={300} />
          </div>
        </div>
      </section>

      {/* Section 3 - Scout Ant */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ 
          maxWidth: '960px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/assets/scout-ant.png" alt="" width={300} height={300} />
          </div>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '24px' }}>
              Guidance without control
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A' }}>
              BAND IT helps groups explore options and understand tradeoffs while people remain responsible for decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 - Builder Ant */}
      <section style={{ padding: '96px 24px' }}>
        <div style={{ 
          maxWidth: '960px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '24px' }}>
              From decision to action
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A' }}>
              Approved decisions connect directly to real work, ownership, and execution.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/assets/builder-ant.png" alt="" width={300} height={300} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '96px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <Image src="/assets/logo_with_tagline.png" alt="BAND IT" width={280} height={120} />
          </div>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#4A4A4A', maxWidth: '600px', margin: '0 auto' }}>
            Build systems that let groups imagine, decide, execute, and learn together.
          </p>
        </div>
      </footer>
    </div>
  );
}