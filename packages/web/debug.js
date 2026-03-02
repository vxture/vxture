async function checkDataFetching() {
  try {
    console.log('Checking hero data...');
    const response = await fetch('http://localhost:3001/data/pages/home/sections/hero.zh-CN.json');
    if (response.ok) {
      const data = await response.json();
      console.log('Hero data fetched successfully:', data);
    } else {
      console.error('Failed to fetch hero data:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error fetching hero data:', error);
  }
}

checkDataFetching();
