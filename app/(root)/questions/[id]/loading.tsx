export default function Loading() {
  return (
    <div className="animate-pulse space-y-8 mt-10">
      <div className="card-wrapper rounded-[10px] p-9 space-y-4">
        <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-1/4" />
        <div className="h-8 bg-light-800 dark:bg-dark-300 rounded w-3/4" />
        <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-full" />
        <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-5/6" />
        <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-2/3" />
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="card-wrapper rounded-[10px] p-9 space-y-3"
        >
          <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-1/5" />
          <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-full" />
          <div className="h-4 bg-light-800 dark:bg-dark-300 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}
