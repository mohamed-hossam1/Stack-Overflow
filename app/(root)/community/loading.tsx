export default function Loading() {
  return (
    <div className="animate-pulse mt-10">
      <div className="flex flex-wrap gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="card-wrapper rounded-[10px] p-9 h-44 w-[260px] bg-light-800 dark:bg-dark-300"
          />
        ))}
      </div>
    </div>
  );
}
