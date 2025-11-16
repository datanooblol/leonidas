# Next.js on AWS Amplify Deployment Guide

## Overview

AWS Amplify automatically selects "WEB" platform for Next.js apps. This guide covers SSG deployment with dynamic routing workarounds.

## Configuration Files

### 1. `amplify.yml` - Build Configuration

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/out
    files:
      - "**/*"
  cache:
    paths:
      - frontend/node_modules/**/*
      - frontend/.next/cache/**/*
```

### 2. `frontend/next.config.ts` - Static Export Configuration

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Required for static export
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "plotly.js": "plotly.js-dist-min",
    };
    return config;
  },
};

export default nextConfig;
```

## Dynamic Routing Problem & Solution

### The Problem

AWS Amplify has issues with Next.js dynamic routes like `/projects/[projectId]`:

- Causes 404 errors
- Build failures with static export
- Internal server errors

### The Solution: Query Parameters

Replace dynamic segments with query parameters.

**❌ Don't use:** `/projects/[projectId]/page.tsx`
**✅ Use instead:** `/project/page.tsx` with query params

### Implementation

#### 1. Create Static Route with Query Params

```tsx
// frontend/app/(private)/project/page.tsx
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("id");

  // Clean projectId (remove leading slash if present)
  const cleanProjectId = projectId?.startsWith("/")
    ? projectId.slice(1)
    : projectId;

  useEffect(() => {
    if (!cleanProjectId) {
      router.push("/dashboard");
      return;
    }

    // Your logic here
  }, [cleanProjectId, router]);

  // Your component JSX
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectContent />
    </Suspense>
  );
}
```

#### 2. Update Navigation

```tsx
// In your dashboard or other components
const handleSelectProject = (projectId: string) => {
  router.push(`/project?id=${projectId}`); // Query parameter approach
};
```

### Important Notes

1. **Suspense Boundary Required**: `useSearchParams()` must be wrapped in `<Suspense>` for static export
2. **Clean Project IDs**: Remove leading slashes from query parameters to avoid API URL issues
3. **Platform Type**: Amplify automatically selects "WEB" platform - no manual configuration needed

## File Structure

```
frontend/
├── app/
│   ├── (private)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── project/          # Static route with query params
│   │   │   └── page.tsx
│   │   └── login/
│   │       └── page.tsx
│   ├── page.tsx
│   └── layout.tsx
├── next.config.ts
└── package.json
```

## Deployment Steps

1. **Configure files** as shown above
2. **Push to GitHub** - Amplify auto-deploys
3. **Verify build** - Check Amplify console for successful deployment
4. **Test routes** - Ensure query parameter navigation works

## Key Benefits

- ✅ Works reliably on AWS Amplify
- ✅ Supports static export (`output: "export"`)
- ✅ No server-side rendering complexity
- ✅ Fast loading times with static assets
- ✅ SEO-friendly with proper meta tags

This approach provides a robust solution for Next.js apps with dynamic content on AWS Amplify's WEB platform.
