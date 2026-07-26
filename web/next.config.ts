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

module.exports = {
  allowedDevOrigins: ['127.0.0.1'],
}

module.exports = nextConfig;


export default nextConfig;
