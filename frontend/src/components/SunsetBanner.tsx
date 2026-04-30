export default function SunsetBanner() {
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-sky-900/20 via-transparent to-gold-900/10 px-4 py-3">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm text-gray-400">
          <span className="text-sky-300 font-bold">$HODL is sunset.</span>
          {' '}This site is a permanent record of the diamond hands who held to the end.
        </p>
      </div>
    </div>
  );
}
