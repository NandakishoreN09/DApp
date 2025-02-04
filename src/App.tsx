import React, { useState } from 'react';
import { Wallet2, Vote, Timer, Users, CircuitBoard, BarChart3 } from 'lucide-react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  votes: number;
  endTime: Date;
}

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Example proposals data
  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: "Community Treasury Allocation",
      description: "Allocate 30% of treasury funds to community development initiatives",
      votes: 156,
      endTime: new Date(Date.now() + 172800000) // 48 hours from now
    },
    {
      id: 2,
      title: "Protocol Upgrade Implementation",
      description: "Implement the proposed v2.0 upgrade to improve transaction speed",
      votes: 89,
      endTime: new Date(Date.now() + 86400000) // 24 hours from now
    },
    {
      id: 3,
      title: "Governance Token Distribution",
      description: "Distribute governance tokens to active community members",
      votes: 204,
      endTime: new Date(Date.now() + 259200000) // 72 hours from now
    }
  ]);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this dApp');
      return;
    }

    setIsConnecting(true);

    try {
      // First check if we're already connected
      const accounts = await window.ethereum.request({ 
        method: 'eth_accounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } else {
        // If not connected, request connection
        const newAccounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        if (newAccounts && newAccounts.length > 0) {
          setWalletAddress(newAccounts[0]);
          setIsConnected(true);
        } else {
          throw new Error('No accounts found');
        }
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        // User rejected the connection request
        alert('Please connect your wallet to participate in voting');
      } else if (error.code === -32002) {
        // Connection request already pending
        alert('Please open MetaMask to complete the connection');
      } else {
        alert('Error connecting to MetaMask. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for account changes
  React.useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          setIsConnected(false);
          setWalletAddress('');
          setHasVoted(false);
          setSelectedProposal(null);
        } else {
          // Account changed
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleVote = (proposalId: number) => {
    if (!isConnected) {
      alert('Please connect your wallet to vote');
      return;
    }
    if (hasVoted) {
      alert('You have already voted');
      return;
    }
    setSelectedProposal(proposalId);
    setHasVoted(true);
  };

  const formatTimeLeft = (endTime: Date) => {
    const now = new Date();
    const timeLeft = endTime.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-fuchsia-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-75"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse-slow delay-150"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Vote className="w-8 h-8 text-cyan-400" />
          <h1 className="text-2xl font-orbitron font-bold neon-text">
            CryptoVote
          </h1>
        </div>
        
        {isConnected ? (
          <div className="wallet-badge flex items-center space-x-2">
            <Wallet2 className="w-4 h-4" />
            <span>{`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}</span>
          </div>
        ) : (
          <button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className={`neon-button flex items-center space-x-2 ${isConnecting ? 'opacity-50 cursor-wait' : ''}`}
          >
            <Wallet2 className="w-5 h-5" />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 animate-glow">
            Decentralized Voting
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Shape the future of our protocol through transparent and secure voting
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="neon-card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Proposals</p>
              <p className="text-2xl font-orbitron">{proposals.length}</p>
            </div>
            <CircuitBoard className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="neon-card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Votes Cast</p>
              <p className="text-2xl font-orbitron">
                {proposals.reduce((acc, curr) => acc + curr.votes, 0)}
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-fuchsia-400" />
          </div>
          <div className="neon-card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Voters</p>
              <p className="text-2xl font-orbitron">449</p>
            </div>
            <Users className="w-8 h-8 text-lime-400" />
          </div>
        </div>

        {/* Proposals */}
        <div className="space-y-6">
          <h3 className="text-2xl font-orbitron mb-8">Active Proposals</h3>
          {proposals.map((proposal) => (
            <div key={proposal.id} className="neon-card">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-xl font-orbitron text-cyan-400">
                  {proposal.title}
                </h4>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Timer className="w-4 h-4" />
                  <span>{formatTimeLeft(proposal.endTime)} left</span>
                </div>
              </div>
              <p className="text-gray-300 mb-6">{proposal.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-fuchsia-400" />
                    <span className="text-gray-400">{proposal.votes} votes</span>
                  </div>
                </div>
                <button
                  onClick={() => handleVote(proposal.id)}
                  disabled={!isConnected || hasVoted}
                  className={`neon-button ${
                    selectedProposal === proposal.id
                      ? 'border-lime-400 text-lime-400'
                      : hasVoted
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {selectedProposal === proposal.id
                    ? 'Voted'
                    : hasVoted
                    ? 'Already Voted'
                    : 'Vote'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>© 2024 CryptoVote. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;