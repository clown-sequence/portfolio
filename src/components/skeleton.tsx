const Skeleton = ({ className = "", animate = true }) => {
  return (
    <div className={`bg-gray-200 dark:bg-neutral-800 rounded ${animate ? 'animate-pulse' : ''} ${className}`} />
  );
};


export const ProjectSkeleton = () => (
  <div className="">

  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
        </div>
        
        
      </div>

    </div>
    
    </div>
);

export const AboutMeSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-neutral-800">
    {/* Header with Avatar */}
    <div className="flex items-center gap-6 mb-8">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  </div>
  
);

export const TestimonialSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <Skeleton className="w-16 h-16 rounded-full" />
        
        <div className="flex-1 space-y-2">
          {/* Name */}
          <Skeleton className="h-5 w-32" />
          {/* Role */}
          <Skeleton className="h-4 w-24" />
          {/* Company */}
          <Skeleton className="h-4 w-28" />
        </div>
        
        {/* Rating Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-4 h-4 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
);

export const ConnectSkeleton = () => (
  <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-neutral-800">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <Skeleton className="w-16 h-16 rounded-full" />
        
        <div className="flex-1 space-y-2">
          {/* Name */}
          <Skeleton className="h-5 w-32" />
          {/* Role */}
          <Skeleton className="h-4 w-24" />
          {/* Company */}
          <Skeleton className="h-4 w-28" />
        </div>
        
        {/* Rating Stars */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-4 h-4 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
);