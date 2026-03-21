interface AvatarProps {
  url: string | null;
  name: string;
  size?: number;
  className?: string;
}

export default function Avatar({
  url,
  name,
  size = 32,
  className = "",
}: AvatarProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-camp-surface-hover font-medium text-camp-text-secondary ${className}`}
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
