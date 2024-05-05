import React, { useState, useEffect } from 'react';

function Statistics() {
    const [stats, setStats] = useState({
        projects: [],
        mints: []
    });

    const [displayMode, setDisplayMode] = useState({
        type: 'projects',  // 'projects' or 'mints'
        ranking: 'top'     // 'top' or 'bottom'
    });

    useEffect(() => {
        const projectEloData = [];
        const mintEloData = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('elo-')) {
                const eloData = JSON.parse(localStorage.getItem(key));
                const [type, id] = key.split('-');
                if (id.includes("000")) { // Assuming mint IDs contain '000'
                    const projectId = id.substring(0, id.indexOf('000')); // Extract projectId
                    const mintId = id.substring(projectId.length);
                    mintEloData.push({ id, elo: eloData.elo, projectId, mintId });
                } else {
                    projectEloData.push({ id, elo: eloData.elo });
                }
            }
        }

        projectEloData.sort((a, b) => b.elo - a.elo);
        mintEloData.sort((a, b) => b.elo - a.elo);

        setStats({
            projects: projectEloData,
            mints: mintEloData
        });
    }, []);

    const toggleDisplay = (type, ranking) => {
        setDisplayMode({ type, ranking });
    };

    const getImageUrl = (projectId, mintId = "0") => {
        const totalLength = 6;
        const currentLength = mintId.toString().length;
        const zerosToPad = Math.max(0, totalLength - currentLength); // Prevent negative values
        const zeroPadding = '0'.repeat(zerosToPad);
        return `https://artblocks-mainnet.s3.amazonaws.com/${projectId}${zeroPadding}${mintId}.png`;
    };

    const renderEloList = (items, title) => {
        const filteredItems = items.length >= 5
            ? (displayMode.ranking === 'top' ? items.slice(0, 5) : items.slice(-5).reverse())
            : items;  // Check array length before slicing for bottom items

        return (
            <div>
                <h3>{title}</h3>
                <ul>
                    {filteredItems.map(item => (
                        <li key={item.id} style={{ listStyleType: 'none', margin: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            <img src={getImageUrl(item.projectId || item.id, item.mintId || '0')} alt="Project or Mint Image" style={{ width: '150px', height: '150px', marginRight: '30px' }} />
                            <p style={{ textAlign: 'center' }}>Elo: {Math.round(item.elo)} &nbsp;&nbsp;&nbsp; ProjectId: {item.projectId || item.id} &nbsp;&nbsp;&nbsp; Mint: {item.mintId || '0'}</p>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
                <button onClick={() => toggleDisplay('projects', 'top')} style={{ textDecoration: displayMode.type === 'projects' && displayMode.ranking === 'top' ? 'underline' : 'none', fontSize: '1.2rem' }}>Top Projects</button>
                <button onClick={() => toggleDisplay('projects', 'bottom')} style={{ textDecoration: displayMode.type === 'projects' && displayMode.ranking === 'bottom' ? 'underline' : 'none', fontSize: '1.2rem' }}>Bottom Projects</button>
                <button onClick={() => toggleDisplay('mints', 'top')} style={{ textDecoration: displayMode.type === 'mints' && displayMode.ranking === 'top' ? 'underline' : 'none', fontSize: '1.2rem' }}>Top Mints</button>
                <button onClick={() => toggleDisplay('mints', 'bottom')} style={{ textDecoration: displayMode.type === 'mints' && displayMode.ranking === 'bottom' ? 'underline' : 'none', fontSize: '1.2rem' }}>Bottom Mints</button>
            </div>
            {displayMode.type === 'projects' ? renderEloList(stats.projects, `${displayMode.ranking} Projects`) : renderEloList(stats.mints, `${displayMode.ranking} Mints`)}
        </div>
    );
}

export default Statistics;
