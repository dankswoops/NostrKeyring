interface LoaderProps {
  size?: number;
}

export default function X({ size = 70 }: LoaderProps) {
  return (
    <div id='reloader' style={{ width: size, height: size }}>
      <div id='abloader'>
        <div id='loader'></div>
      </div>
    </div>
  );
};