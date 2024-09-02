interface LoaderProps {
  size?: number;
}

export default function X({ size = 70 }: LoaderProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0">
        <div id="loader" className="w-full h-full rounded-full border-4 border-purple-600"></div>
      </div>
    </div>
  );
};