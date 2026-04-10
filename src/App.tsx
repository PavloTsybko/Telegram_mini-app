import { useState, useEffect } from 'react';
import styles from './App.module.scss';
import { init, useSignalClient } from '@twa-dev/sdk';
import { Button, MainButton, BackButton } from '@twa-dev/types';

// Initialize Telegram SDK
init();

// NFT Number interface
interface NFTNumber {
  id: string;
  number: string;
  tier: 'Basic' | 'Pattern' | 'Repeat' | 'Premium' | 'Legendary';
  style: string;
  identity: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  owner: string | null;
  minted: boolean;
}

// Sample NFT data (will come from API)
const NFT_COLLECTION: NFTNumber[] = [
  { id: '1', number: '+321 102 3847', tier: 'Basic', style: 'Black Minimal', identity: 'Anonymous', rarity: 'Common', price: 0.5, owner: null, minted: false },
  { id: '2', number: '+321 178 4421', tier: 'Basic', style: 'Neon Blue', identity: 'Builder', rarity: 'Common', price: 0.5, owner: null, minted: false },
  { id: '3', number: '+321 325 9983', tier: 'Basic', style: 'Black Minimal', identity: 'Anonymous', rarity: 'Common', price: 0.5, owner: null, minted: false },
  { id: '4', number: '+321 414 1212', tier: 'Pattern', style: 'Matrix Green', identity: 'Hacker', rarity: 'Uncommon', price: 1, owner: null, minted: false },
  { id: '5', number: '+321 464 5656', tier: 'Pattern', style: 'Purple NFT', identity: 'Creator', rarity: 'Uncommon', price: 1, owner: null, minted: false },
  { id: '6', number: '+321 515 5151', tier: 'Pattern', style: 'Matrix Green', identity: 'Hacker', rarity: 'Uncommon', price: 1, owner: null, minted: false },
  { id: '7', number: '+321 600 1111', tier: 'Repeat', style: 'Red Aggressive', identity: 'Trader', rarity: 'Rare', price: 3, owner: null, minted: false },
  { id: '8', number: '+321 655 6666', tier: 'Repeat', style: 'Purple NFT', identity: 'Degenerate', rarity: 'Rare', price: 3, owner: null, minted: false },
  { id: '9', number: '+321 699 9999', tier: 'Repeat', style: 'Red Aggressive', identity: 'Trader', rarity: 'Rare', price: 3, owner: null, minted: false },
  { id: '10', number: '+321 800 0000', tier: 'Premium', style: 'Gold Premium', identity: 'Investor', rarity: 'Epic', price: 8, owner: null, minted: false },
  { id: '11', number: '+321 888 8888', tier: 'Premium', style: 'Ice Blue', identity: 'Whale', rarity: 'Epic', price: 8, owner: null, minted: false },
  { id: '12', number: '+321 999 0000', tier: 'Premium', style: 'Gold Premium', identity: 'Investor', rarity: 'Epic', price: 8, owner: null, minted: false },
  { id: '13', number: '+321 000 0000', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 25, owner: null, minted: false },
  { id: '14', number: '+321 111 1111', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 25, owner: null, minted: false },
  { id: '15', number: '+321 123 1234', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 25, owner: null, minted: false },
];

type View = 'home' | 'collection' | 'mint' | 'mynfts';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFTNumber | null>(null);
  const [myNFTs, setMyNFTs] = useState<NFTNumber[]>([]);

  // Try to get wallet from Telegram
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        // User is logged in via Telegram
        console.log('Telegram user:', user);
      }
    }
  }, []);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check for TON Wallet
      if ((window as any).tonereum) {
        const account = await (window as any).tonereum.connect();
        setWalletAddress(account.address);
      } else if ((window as any).tonkeeper) {
        const account = await (window as any).tonkeeper.send('ton_requestAccounts');
        setWalletAddress(account[0]);
      } else {
        // Open TON Wallet link
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.openLink('https://wallet.tonkeeper.com/connect');
        }
      }
    } catch (e) {
      console.error('Wallet connection failed:', e);
    }
    setIsConnecting(false);
  };

  const handleMint = async (nft: NFTNumber) => {
    if (!walletAddress) {
      connectWallet();
      return;
    }
    setSelectedNFT(nft);
    // In real app: trigger TON transaction
    alert(`Minting ${nft.number} for ${nft.price} TON`);
  };

  const goBack = () => {
    if (selectedNFT) {
      setSelectedNFT(null);
      return;
    }
    if (currentView !== 'home') {
      setCurrentView('home');
    }
  };

  const renderHome = () => (
    <div className={styles.home}>
      <div className={styles.logo}>+321</div>
      <h1>BM Numbers</h1>
      <p className={styles.subtitle}>Bitcoin Man Anonymous Numbers</p>
      <p className={styles.desc}>NFT collection of unique +321 numbers on TON blockchain</p>
      
      {!walletAddress ? (
        <button className={styles.connectBtn} onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className={styles.walletInfo}>
          <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
        </div>
      )}

      <div className={styles.menu}>
        <button className={styles.menuBtn} onClick={() => setCurrentView('collection')}>
          📦 Collection
        </button>
        <button className={styles.menuBtn} onClick={() => setCurrentView('mint')}>
          🧩 Mint
        </button>
        <button className={styles.menuBtn} onClick={() => setCurrentView('mynfts')}>
          💎 My NFTs
        </button>
      </div>
    </div>
  );

  const renderCollection = () => {
    const tiers = ['Basic', 'Pattern', 'Repeat', 'Premium', 'Legendary'];
    return (
      <div className={styles.collection}>
        <h2>Collection</h2>
        <div className={styles.nftGrid}>
          {NFT_COLLECTION.map(nft => (
            <div 
              key={nft.id} 
              className={`${styles.nftCard} ${styles[nft.tier.toLowerCase()]}`}
              onClick={() => setSelectedNFT(nft)}
            >
              <div className={styles.nftNumber}>{nft.number}</div>
              <div className={styles.nftTier}>{nft.tier}</div>
              <div className={styles.nftStyle}>{nft.style}</div>
              <div className={styles.nftPrice}>{nft.price} TON</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMint = () => {
    const available = NFT_COLLECTION.filter(n => !n.minted);
    return (
      <div className={styles.mint}>
        <h2>Available to Mint</h2>
        <div className={styles.nftGrid}>
          {available.map(nft => (
            <div 
              key={nft.id} 
              className={`${styles.nftCard} ${styles[nft.tier.toLowerCase()]}`}
              onClick={() => handleMint(nft)}
            >
              <div className={styles.nftNumber}>{nft.number}</div>
              <div className={styles.nftTier}>{nft.tier}</div>
              <div className={styles.nftPrice}>{nft.price} TON</div>
              <button className={styles.mintBtn}>Mint</button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMyNFTs = () => (
    <div className={styles.mynfts}>
      <h2>My NFTs</h2>
      {myNFTs.length === 0 ? (
        <p>You don't have any NFTs yet. Mint some from the collection!</p>
      ) : (
        <div className={styles.nftGrid}>
          {myNFTs.map(nft => (
            <div key={nft.id} className={`${styles.nftCard} ${styles[nft.tier.toLowerCase()]}`}>
              <div className={styles.nftNumber}>{nft.number}</div>
              <div className={styles.nftTier}>{nft.tier}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNFTDetail = () => {
    if (!selectedNFT) return null;
    return (
      <div className={styles.detail}>
        <button className={styles.backBtn} onClick={goBack}>← Back</button>
        <div className={`${styles.nftCard} ${styles[selectedNFT.tier.toLowerCase()]}`}>
          <div className={styles.nftNumber}>{selectedNFT.number}</div>
        </div>
        <div className={styles.nftInfo}>
          <p><strong>Tier:</strong> {selectedNFT.tier}</p>
          <p><strong>Style:</strong> {selectedNFT.style}</p>
          <p><strong>Identity:</strong> {selectedNFT.identity}</p>
          <p><strong>Rarity:</strong> {selectedNFT.rarity}</p>
          <p><strong>Price:</strong> {selectedNFT.price} TON</p>
        </div>
        <button className={styles.mintBtn} onClick={() => handleMint(selectedNFT)}>
          Mint for {selectedNFT.price} TON
        </button>
      </div>
    );
  };

  return (
    <div className={styles.app}>
      {(currentView !== 'home' || selectedNFT) && (
        <button className={styles.backBtn} onClick={goBack}>← Back</button>
      )}
      
      {currentView === 'home' && renderHome()}
      {currentView === 'collection' && renderCollection()}
      {currentView === 'mint' && renderMint()}
      {currentView === 'mynfts' && renderMyNFTs()}
      {selectedNFT && renderNFTDetail()}
    </div>
  );
}

export default App;
