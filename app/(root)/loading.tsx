export default function Loading() {
  return (
    <div className="animate-pulse space-y-6 mt-10">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="card-wrapper rounded-[10px] p-9 h-48 bg-light-800 dark:bg-dark-300"
        />
      ))}
    </div>
  );
}
