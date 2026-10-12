// Shared SVG filters referenced from CSS (url(#pencil)) and components.
export default function SketchDefs() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" />
        </filter>
      </defs>
    </svg>
  );
}
