
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   experimental: { serverActions: true },
//   images: {
//     remotePatterns: [
//       { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
//       { protocol: 'http', hostname: 'localhost', port: '8000' },
//     ],
//   }
// };
// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // If you call your Django API server-side using process.env.NEXT_PUBLIC_API_URL,
  // no extra rewrites are required. If you want a built-in proxy, you could add rewrites here.
  // experimental / images / etc. can go here as needed.
};

export default nextConfig;
