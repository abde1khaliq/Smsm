/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chat/stream',
        destination: 'http://backend:8000/chat/stream',
      },
    ];
  },
};

module.exports = nextConfig;


export default nextConfig;
