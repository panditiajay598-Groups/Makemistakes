"use client";

interface SocialButtonsProps {
  label?: string;
  onClick?: () => void;
  callbackUrl?: string;
}

export default function SocialButtons({
  label = "Continue with Google",
}: SocialButtonsProps) {
  return (
    <p className="my-4 text-center text-xs text-zinc-500" role="status">
      {label} is currently unavailable. Please continue with email instead.
    </p>
  );
}
