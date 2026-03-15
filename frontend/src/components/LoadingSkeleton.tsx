export default function LoadingSkeleton() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      <div 
        className="skeleton" 
        style={{ height: '40px', width: '30%', borderRadius: '8px', backgroundColor: '#e2e8f0' }} 
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="skeleton" 
            style={{ height: '120px', borderRadius: '12px', backgroundColor: '#e2e8f0' }} 
          />
        ))}
      </div>

      <div 
        className="skeleton" 
        style={{ height: '400px', borderRadius: '16px', backgroundColor: '#e2e8f0', marginTop: '1rem' }} 
      />
    </div>
  );
}
