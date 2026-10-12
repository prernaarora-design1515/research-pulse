import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <p className="font-mono text-[12px] uppercase text-neutral-500">(404)</p>
      <h1 className="mt-2 font-display text-6xl font-bold uppercase leading-[0.9] tracking-[-0.04em] text-neutral-900 sm:text-8xl dark:text-neutral-100">
        Nothing filed here
      </h1>
      <p className="mt-4 font-hand text-2xl text-neutral-500">this page wandered off the brief ✎</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-neutral-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform hover:-rotate-2 active:scale-90 dark:bg-neutral-100 dark:text-neutral-900"
      >
        Back to this week&rsquo;s brief
      </Link>
    </div>
  );
}
