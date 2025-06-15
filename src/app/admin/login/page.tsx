
'use client';

import React from 'react';

// All previous imports like useForm, supabase, UI components, etc., are removed for this test.

export default function LoginPage() {
  // Client-side log to see if the component's render function is even reached.
  if (typeof window !== 'undefined') {
    console.log('LOGIN_PAGE_RENDER_TEST: Attempting to render simplified login page.');
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>Admin Login Page (Simplified Test)</h1>
        <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>
          If you see this, the basic page rendering for /admin/login is working.
        </p>
        <p style={{ fontSize: '14px', color: '#777' }}>
          The original form, Supabase logic, and styling have been temporarily removed for this test.
        </p>
        {/* Basic link to ensure routing isn't completely broken */}
        <a href="/" style={{display: 'inline-block', marginTop: '20px', color: 'blue', textDecoration: 'underline'}}>Go to Home (Test Link)</a>
      </div>
    </div>
  );
}
