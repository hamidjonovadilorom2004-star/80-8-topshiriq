import React, { useState } from 'react';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useReadContracts
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther, formatEther } from 'viem';
import RealEstateABI from '../artifacts/contracts/RealEstate.sol/RealEstate.json';

const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';

function App() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('browse');
  const [propId, setPropId] = useState('');
  const [propType, setPropType] = useState('Home');
  const [location, setLocation] = useState('');
  const [docHash, setDocHash] = useState('');
  const [price, setPrice] = useState('');

  // Get total properties
  const { data: count } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: RealEstateABI.abi,
    functionName: 'propertyCount',
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash });

  const handleRegister = (e) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RealEstateABI.abi,
      functionName: 'registerProperty',
      args: [propType, location, docHash],
    });
  };

  const handleBuy = (id, priceValue) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RealEstateABI.abi,
      functionName: 'buyProperty',
      args: [id],
      value: priceValue,
    });
  };

  const handleToggleSale = (e) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: RealEstateABI.abi,
      functionName: 'toggleSale',
      args: [BigInt(propId), true, parseEther(price)],
    });
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">EstateLedger 🏠</div>
        <ConnectButton />
      </header>

      <main className="glass-panel">
        <h1>On-Chain Real Estate</h1>
        <p className="description">Transparent property ownership, document management and global marketplace.</p>

        <div className="tab-buttons">
          <button onClick={() => setActiveTab('browse')} className={activeTab === 'browse' ? 'active' : ''}>Marketplace</button>
          <button onClick={() => setActiveTab('register')} className={activeTab === 'register' ? 'active' : ''}>Register Property</button>
          <button onClick={() => setActiveTab('manage')} className={activeTab === 'manage' ? 'active' : ''}>Manage & Sell</button>
        </div>

        <div className="content-area">
          {activeTab === 'browse' && (
            <div className="market-view">
              <h2>Recent Listings</h2>
              <div className="empty-state">
                <p>Browsing {count ? Number(count) : 0} registered properties...</p>
                <div className="grid">
                   {/* In real app, we iterate and show property cards */}
                   <div className="prop-card placeholder">
                      <h3>Luxury Office</h3>
                      <p>Tashkent City, Block A</p>
                      <p className="price">Price: 5.5 ETH</p>
                      <button onClick={() => handleBuy(1n, parseEther('5.5'))} className="btn-primary">Buy Now</button>
                   </div>
                   <div className="prop-card placeholder">
                      <h3>Rural Land</h3>
                      <p>Samarkand, Registan area</p>
                      <p className="price">Price: 2.1 ETH</p>
                      <button onClick={() => handleBuy(2n, parseEther('2.1'))} className="btn-primary">Buy Now</button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="form-box">
              <h2>Enroll New Property</h2>
              <form onSubmit={handleRegister}>
                <select value={propType} onChange={e => setPropType(e.target.value)}>
                  <option>Home</option>
                  <option>Land</option>
                  <option>Office</option>
                </select>
                <input placeholder="Physical Location" value={location} onChange={e => setLocation(e.target.value)} />
                <input placeholder="Document IPFS Hash" value={docHash} onChange={e => setDocHash(e.target.value)} />
                <button type="submit" className="btn-primary">Register in Blockchain</button>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="manage-box">
              <h2>Manage My Portfolio</h2>
              <form onSubmit={handleToggleSale}>
                <input placeholder="Property ID" value={propId} onChange={e => setPropId(e.target.value)} />
                <input placeholder="Listing Price in ETH" value={price} onChange={e => setPrice(e.target.value)} />
                <button type="submit" className="btn-secondary">List for Sale</button>
              </form>
              <div className="hint-box">
                <p>Transfer ownership and grant document access to potential buyers safely.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {isMining && <div className="loading-overlay">Confirming Transaction...</div>}
    </div>
  );
}

export default App;
