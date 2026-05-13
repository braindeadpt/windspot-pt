export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-base p-4 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-3xl mx-auto space-y-4 pt-8">
        <div className="h-10 bg-surface-1 rounded w-3/4 mx-auto" />
        <div className="h-5 bg-surface-1 rounded w-1/2 mx-auto" />
      </div>
      
      {/* Grid skeleton */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-surface-1 rounded-lg" />
        ))}
      </div>
      
      {/* Footer skeleton */}
      <div className="max-w-xl mx-auto pt-8">
        <div className="h-4 bg-surface-1 rounded w-1/3 mx-auto" />
      </div>
    </div>
  );
}