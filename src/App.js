import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Statistics from './Statistics';  // Import at the top of your App.js file

function App() {
  function getRandomImageUrl() {
    const projectId = Math.floor(Math.random() * 50);  // Random project ID between 1 and 10
    const mintNumber = Math.floor(Math.random() * 0);  // Random mint number between 1 and 100
    const totalLength = 6;
    const currentLength = mintNumber.toString().length;
    const zerosToPad = totalLength - currentLength;
    const zeroPadding = '0'.repeat(zerosToPad);
    return {
      url: `https://artblocks-mainnet.s3.amazonaws.com/${projectId}${zeroPadding}${mintNumber}.png`,
      projectId: projectId.toString(),
      mintId: `${projectId}${zeroPadding}${mintNumber}`
    };
  }

  const [images, setImages] = useState({
    image1: getRandomImageUrl(),
    image2: getRandomImageUrl()
  });

  function trackSelection(selectedIndex) {
    const selectedImage = images[`image${selectedIndex}`];
    const opponentImage = images[`image${selectedIndex === 1 ? 2 : 1}`];

    updateElo(selectedImage.mintId, opponentImage.mintId, true); // Individual ELO update
    updateElo(selectedImage.projectId, opponentImage.projectId, true); // Project ELO update
    updateElo(opponentImage.mintId, selectedImage.mintId, false); // Individual ELO update
    updateElo(opponentImage.projectId, selectedImage.projectId, false); // Project ELO update

    setImages({
      image1: getRandomImageUrl(),
      image2: getRandomImageUrl()
    });
  }

  function updateElo(id, opponentId, won) {
    const idStats = JSON.parse(localStorage.getItem(`elo-${id}`)) || { elo: 1000, matches: 0 };
    const opponentStats = JSON.parse(localStorage.getItem(`elo-${opponentId}`)) || { elo: 1000, matches: 0 };

    const k = 32 / (1 + 0.005 * idStats.matches);  // Dynamic K-factor
    const expectedScoreId = 1 / (1 + Math.pow(10, (opponentStats.elo - idStats.elo) / 400));
    const scoreChange = k * (won ? 1 - expectedScoreId : 0 - expectedScoreId);

    idStats.elo += scoreChange;
    idStats.matches++;
    opponentStats.elo -= scoreChange; // Adjust opponent's ELO inversely
    opponentStats.matches++;

    localStorage.setItem(`elo-${id}`, JSON.stringify(idStats));
    localStorage.setItem(`elo-${opponentId}`, JSON.stringify(opponentStats));
  }

  function handleImageError(imageKey) {
    setImages(prevImages => ({
      ...prevImages,
      [imageKey]: getRandomImageUrl()
    }));
  }

  return (
    <Router>
      <div style={{ textAlign: 'center', paddingTop: '20px', paddingBottom: '10px', backgroundColor: 'black', minHeight: '100vh', color: 'white' }}>
        <header>
          <h1>ELO</h1>
          <nav style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ color: 'white', marginRight: '10px' }}>Home</Link>
            <Link to="/info" style={{ color: 'white', marginRight: '10px' }}>Info</Link>
            <Link to="/opt-in" style={{ color: 'white', marginRight: '10px' }}>Opt-in</Link>
            <Link to="/statistics" style={{ color: 'white' }}>Statistics</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<ImageDisplay images={images} onImageSelect={trackSelection} onImageError={handleImageError} />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/opt-in" element={<OptInPage />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </Router>
  );
}

function ImageDisplay({ images, onImageSelect, onImageError }) {
  const mintStats1 = JSON.parse(localStorage.getItem(`elo-${images.image1.mintId}`)) || { elo: 1000 };
  const mintStats2 = JSON.parse(localStorage.getItem(`elo-${images.image2.mintId}`)) || { elo: 1000 };
  const projectStats1 = JSON.parse(localStorage.getItem(`elo-${images.image1.projectId}`)) || { elo: 1000 };
  const projectStats2 = JSON.parse(localStorage.getItem(`elo-${images.image2.projectId}`)) || { elo: 1000 };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div style={{ width: '45%', textAlign: 'center' }}>
        <img src={images.image1.url} alt="Random Art 1" style={{ width: '100%', cursor: 'pointer' }}
          onClick={() => onImageSelect(1)} onError={() => onImageError('image1')} />
        <p style={{ color: 'white' }}>Mint ELO: {Math.round(mintStats1.elo)} | Project ELO: {Math.round(projectStats1.elo)}</p>
      </div>
      <div style={{ width: '45%', textAlign: 'center' }}>
        <img src={images.image2.url} alt="Random Art 2" style={{ width: '100%', cursor: 'pointer' }}
          onClick={() => onImageSelect(2)} onError={() => onImageError('image2')} />
        <p style={{ color: 'white' }}>Mint ELO: {Math.round(mintStats2.elo)} | Project ELO: {Math.round(projectStats2.elo)}</p>
      </div>
    </div>
  );
}

function InfoPage() {
  return <h2>Information Page</h2>;
}

function OptInPage() {
  return <h2>Opt-In Page</h2>;
}

export default App;
