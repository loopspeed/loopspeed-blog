import { ReactNode } from "react";

import BlogBackgroundCanvas from "@/components/blog/blogBackground/BlogBackground";

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <BlogBackgroundCanvas />
      {children}
    </>
  );
}
