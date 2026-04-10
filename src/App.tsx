import { useState, useEffect } from 'react';
import styles from './App.module.scss';
import { TonConnectButton, useTonConnect } from '@tonconnect/ui-react';
import { 
  UserOutlined, 
  TrophyOutlined, 
  LogoutOutlined, 
  ArrowLeftOutlined,
  WalletOutlined,
  CrownOutlined
} from '@ant-design/icons';

// Types
interface NumberNFT {
  id: string;
  number: string;
  tier: 'Basic' | 'Pattern' | 'Repeat' | 'Premium' | 'Legendary';
  style: string;
  identity: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  price: number;
  owner?: string;
}

// Sample NFT data
const NFT_DATA: NumberNFT[] = [
  { id: '1', number: '+321 102 3847', tier: 'Basic', style: 'Black Minimal', identity: 'Anonymous', rarity: 'Common', price: 0.5 },
  { id: '2', number: '+321 178 4421', tier: 'Basic', style: 'Neon Blue', identity: 'Builder', rarity: 'Common', price: 0.7 },
  { id: '3', number: '+321 325 9983', tier: 'Basic', style: 'Black Minimal', identity: 'Anonymous', rarity: 'Common', price: 0.5 },
  { id: '4', number: '+321 414 1212', tier: 'Pattern', style: 'Matrix Green', identity: 'Hacker', rarity: 'Uncommon', price: 1.5 },
  { id: '5', number: '+321 464 5656', tier: 'Pattern', style: 'Purple NFT', identity: 'Creator', rarity: 'Uncommon', price: 2.0 },
  { id: '6', number: '+321 515 5151', tier: 'Pattern', style: 'Matrix Green', identity: 'Hacker', rarity: 'Uncommon', price: 2.5 },
  { id: '7', number: '+321 600 1111', tier: 'Repeat', style: 'Red Aggressive', identity: 'Trader', rarity: 'Rare', price: 4.0 },
  { id: '8', number: '+321 655 6666', tier: 'Repeat', style: 'Purple NFT', identity: 'Degenerate', rarity: 'Rare', price: 5.0 },
  { id: '9', number: '+321 699 9999', tier: 'Repeat', style: 'Red Aggressive', identity: 'Trader', rarity: 'Rare', price: 6.0 },
  { id: '10', number: '+321 800 0000', tier: 'Premium', style: 'Gold Premium', identity: 'Investor', rarity: 'Epic', price: 15.0 },
  { id: '11', number: '+321 888 8888', tier: 'Premium', style: 'Ice Blue', identity: 'Whale', rarity: 'Epic', price: 20.0 },
  { id: '12', number: '+321 999 0000', tier: 'Premium', style: 'Gold Premium', identity: 'Investor', rarity: 'Epic', price: 18.0 },
  { id: '13', number: '+321 000 0000', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 100.0 },
  { id: '14', number: '+321 111 1111', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 120.0 },
  { id: '15', number: '+321 321 3210', tier: 'Legendary', style: 'Rainbow Rare', identity: 'Unique', rarity: 'Legendary', price: 80.0 },
];

const TIER_COLORS: Record<string, string> = {
  'Basic': '#22c55e',
  'Pattern': '#3b82f6',
  'Repeat': '#a855f7',
  'Premium': '#eab308',
  'Legendary': '#ef4444',
};

function App() {
  const { connected, wallet } = useTonConnect();
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedNumber, setSelectedNumber] = useState<NumberNFT | null>(null);
  const [ownedNumbers, setOwnedNumbers] = useState<NumberNFT[]>([]);

  // Check for connected wallet
  useEffect(() => {
    if (connected && wallet?.address) {
      // Load user's owned numbers (mock)
      const stored = localStorage.getItem('ownedNumbers');
      if (stored) {
        setOwnedNumbers(JSON.parse(stored));
      }
    }
  }, [connected, wallet]);

  const handleNumberClick = (nft: NumberNFT) => {
    setSelectedNumber(nft);
    setCurrentView('detail');
  };

  const handleBuy = async () => {
    if (!connected || !selectedNumber) return;
    
    // Mock purchase - in real app would use TON wallet to send transaction
    alert(`Purchase ${selectedNumber.number} for ${selectedNumber.price} TON`);
    
    const newOwned = [...ownedNumbers, selectedNumber];
    setOwnedNumbers(newOwned);
    localStorage.setItem('ownedNumbers', JSON.stringify(newOwned));
    
    setCurrentView('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('ownedNumbers');
    setOwnedNumbers([]);
    setCurrentView('home');
  };

  const renderBackButton = () => (
    currentView !== 'home' && (
      <button className={styles.backButton} onClick={() => {
        if (currentView === 'detail') {
          setCurrentView('gallery');
        } else {
          setCurrentView('home');
        }
        setSelectedNumber(null);
      }}>
        <ArrowLeftOutlined /> Back
      </button>
    )
  );

  const renderHome = () => (
    <div className={styles.home}>
      <div className={styles.logo}>
        <span className={styles.logoIcon}>📱</span>
        <h1>BM Numbers</h1>
        <p className={styles.tagline}>+321 — Your Anonymous Identity</p>
      </div>

      {!connected ? (
        <div className={styles.connectSection}>
          <p>Connect your TON Wallet to get started</p>
          <TonConnectButton />
        </div>
      ) : (
        <div className={styles.menuButtons}>
          <button className={styles.menuButton} onClick={() => setCurrentView('gallery')}>
            <span className={styles.menuIcon}>🔢</span>
            <span>Browse Numbers</span>
          </button>
          <button className={styles.menuButton} onClick={() => setCurrentView('profile')}>
            <span className={styles.menuIcon}>👤</span>
            <span>My Numbers</span>
            {ownedNumbers.length > 0 && <span className={styles.badge}>{ownedNumbers.length}</span>}
          </button>
        </div>
      )}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{NFT_DATA.length}</span>
          <span className={styles.statLabel}>Numbers</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>+321</span>
          <span className={styles.statLabel}>Prefix</span>
        </div>
      </div>
    </div>
  );

  const renderGallery = () => (
    <div className={styles.gallery}>
      <h2>Available Numbers</h2>
      <div className={styles.nftGrid}>
        {NFT_DATA.map((nft) => (
          <div 
            key={nft.id} 
            className={styles.nftCard}
            onClick={() => handleNumberClick(nft)}
          >
            <div className={styles.nftNumber}>{nft.number}</div>
            <div className={styles.nftTier} style={{ backgroundColor: TIER_COLORS[nft.tier] }}>
              {nft.tier}
            </div>
            <div className={styles.nftPrice}>{nft.price} TON</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedNumber) return null;
    
    return (
      <div className={styles.detail}>
        <div className={styles.detailCard}>
          <div className={styles.detailNumber}>{selectedNumber.number}</div>
          <div className={styles.detailTier} style={{ backgroundColor: TIER_COLORS[selectedNumber.tier] }}>
            {selectedNumber.tier}
          </div>
          
          <div className={styles.detailInfo}>
            <div className={styles.detailRow}>
              <span>Style</span>
              <span>{selectedNumber.style}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Identity</span>
              <span>{selectedNumber.identity}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Rarity</span>
              <span>{selectedNumber.rarity}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Price</span>
              <span className={styles.price}>{selectedNumber.price} TON</span>
            </div>
          </div>

          {connected ? (
            <button className={styles.buyButton} onClick={handleBuy}>
              Buy for {selectedNumber.price} TON
            </button>
          ) : (
            <p className={styles.connectHint}>Connect wallet to buy</p>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className={styles.profile}>
      <h2>My Numbers</h2>
      {ownedNumbers.length === 0 ? (
        <p className={styles.empty}>You don't own any numbers yet</p>
      ) : (
        <div className={styles.nftGrid}>
          {ownedNumbers.map((nft) => (
            <div key={nft.id} className={styles.nftCard} onClick={() => handleNumberClick(nft)}>
              <div className={styles.nftNumber}>{nft.number}</div>
              <div className={styles.nftTier} style={{ backgroundColor: TIER_COLORS[nft.tier] }}>
                {nft.tier}
              </div>
              <div className={styles.ownedBadge}>Owned</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.app}>
      {renderBackButton()}
      
      {currentView === 'home' && renderHome()}
      {currentView === 'gallery' && renderGallery()}
      {currentView === 'detail' && renderDetail()}
      {currentView === 'profile' && renderProfile()}

      {connected && currentView !== 'home' && (
        <div className={styles.bottomMenu}>
          <button className={styles.menuBtn} onClick={() => setCurrentView('home')}>
            <UserOutlined />
          </button>
          <button className={styles.menuBtn} onClick={() => setCurrentView('gallery')}>
            <WalletOutlined />
          </button>
          <button className={styles.menuBtn} onClick={() => setCurrentView('profile')}>
            <CrownOutlined />
          </button>
          <button className={styles.menuBtn} onClick={handleLogout}>
            <LogoutOutlined />
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
