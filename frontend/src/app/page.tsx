// Example for app router (app/page.js)
async function getBackendHealth() {
  try {
    // Ensure your Express backend is running and CORS is configured
    const res = await fetch('http://localhost:3001/api/health', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch backend health');
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return { status: 'DOWN', message: error.message };
  }
}

export default async function HomePage() {
  const healthData = await getBackendHealth();

  return (
    <main>
      <h1>Village Legal Entity Dashboard</h1>
      <p>Backend Status: {healthData.status} - {healthData.message}</p>
      {/* Ticket display will go here */}
    </main>
  );
}