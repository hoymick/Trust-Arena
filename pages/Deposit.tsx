
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MechCard from '../components/ui/MechCard';
import MechButton from '../components/ui/MechButton';
import TokenDisplay from '../components/ui/TokenDisplay';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';
import { TRUST_TOKEN_ADDRESS, VAULT_CONTRACT_ADDRESS, ERC20_ABI, VAULT_ABI } from '../utils/web3Config';

const Deposit: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  
  // Balances
  const [walletBalance, setWalletBalance] = useState<string>('0.00'); // Tokens in MetaMask
  const [arenaBalance, setArenaBalance] = useState<string>('0.00');   // Tokens in Arena Vault
  
  const [inputAmount, setInputAmount] = useState<string>('');
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'APPROVING' | 'DEPOSITING' | 'WITHDRAWING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  // Initialize Provider
  useEffect(() => {
    if ((window as any).ethereum) {
      const newProvider = new ethers.BrowserProvider((window as any).ethereum);
      setProvider(newProvider);
    }
  }, []);

  // Helper to format address
  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Connect Wallet
  const connectWallet = async () => {
    if (!provider) {
      setStatus('ERROR');
      setStatusMessage("MetaMask not detected. Please install.");
      return;
    }

    try {
      setStatus('CONNECTING');
      setStatusMessage("Requesting wallet access...");
      soundManager.play(SoundType.SERVO);

      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus('IDLE');
        setStatusMessage("Wallet Connected.");
        soundManager.play(SoundType.PING);
        loadBalances(accounts[0]);
      }
    } catch (err: any) {
      setStatus('ERROR');
      setStatusMessage(err.message || "Connection failed");
      soundManager.play(SoundType.IMPACT);
    }
  };

  // Load Balances
  const loadBalances = async (userAddress: string) => {
    if (!provider) return;
    try {
      const signer = await provider.getSigner();
      
      // 1. Get Wallet Balance (ERC20)
      if (TRUST_TOKEN_ADDRESS !== "0x0000000000000000000000000000000000000000") {
         const tokenContract = new ethers.Contract(TRUST_TOKEN_ADDRESS, ERC20_ABI, signer);
         const rawBalance = await tokenContract.balanceOf(userAddress);
         const decimals = await tokenContract.decimals();
         setWalletBalance(parseFloat(ethers.formatUnits(rawBalance, decimals)).toFixed(2));
      } else {
         setWalletBalance("1000.00"); // Demo/Placeholder
      }

      // 2. Get Arena/Vault Balance (Deposited/Winnings)
      if (VAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
         const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
         const rawVaultBalance = await vaultContract.getBalance(userAddress);
         // Assuming 18 decimals for vault balance
         setArenaBalance(parseFloat(ethers.formatUnits(rawVaultBalance, 18)).toFixed(2));
      } else {
         setArenaBalance("250.00"); // Demo/Placeholder
      }

    } catch (err) {
      console.error("Failed to load balances", err);
      // Fallback for UI demo
      setWalletBalance("0.00"); 
      setArenaBalance("0.00"); 
    }
  };

  // Handle Transaction Logic
  const handleTransaction = async () => {
    if (!account || !provider) return;
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setStatus('ERROR');
      setStatusMessage("Please enter a valid amount.");
      return;
    }

    try {
      const signer = await provider.getSigner();
      
      // Check config
      if (TRUST_TOKEN_ADDRESS.startsWith("0x00") && TRUST_TOKEN_ADDRESS.endsWith("0000")) {
         setStatus('ERROR');
         setStatusMessage("Contract addresses not configured in utils/web3Config.ts");
         return;
      }

      const tokenContract = new ethers.Contract(TRUST_TOKEN_ADDRESS, ERC20_ABI, signer);
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);

      const amountWei = ethers.parseUnits(inputAmount, 18);

      // --- DEPOSIT FLOW ONLY ---
      setStatus('APPROVING');
      setStatusMessage("Please approve the transaction in MetaMask...");
      soundManager.play(SoundType.SERVO);

      const approveTx = await tokenContract.approve(VAULT_CONTRACT_ADDRESS, amountWei);
      setStatusMessage("Waiting for approval confirmation...");
      await approveTx.wait();
      
      soundManager.play(SoundType.PING);
      setStatusMessage("Approval Successful. Initializing Deposit...");

      // 2. Deposit
      setStatus('DEPOSITING');
      const depositTx = await vaultContract.deposit(amountWei);
      setTxHash(depositTx.hash);
      setStatusMessage("Deposit submitted. Waiting for confirmation...");
      await depositTx.wait();

      setStatusMessage("Deposit Complete!");

      // Final Success State
      setStatus('SUCCESS');
      soundManager.play(SoundType.PING);
      setInputAmount('');
      loadBalances(account); // Refresh both balances

    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      setStatusMessage(err.reason || err.message || "Transaction failed");
      soundManager.play(SoundType.IMPACT);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="font-['Orbitron'] text-4xl font-bold text-white mb-2 tracking-tight">
          TRUST <span className="text-[#00A8FF]">DEPOSIT</span>
        </h1>
        <p className="font-['Quantico'] text-gray-400 tracking-widest text-sm">
          SECURE ASSET MANAGEMENT
        </p>
      </div>

      <MechCard title="Web3 Uplink" glowing={status === 'APPROVING' || status === 'DEPOSITING'}>
        <div className="flex flex-col items-center gap-6 p-4">
          
          {/* Wallet Info Bar - Visible if connected */}
          {account && (
            <div className="w-full flex items-center justify-between bg-black/40 border border-white/10 p-3 rounded mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-['Quantico'] text-[#00E5FF] text-sm">{formatAddress(account)}</span>
              </div>
              <div className="text-xs text-gray-500 uppercase">Connected</div>
            </div>
          )}

          {/* Connection Check / Form Area */}
          {!account ? (
            <div className="w-full text-center py-12 border border-dashed border-white/10 rounded-lg bg-black/20">
              <div className="mb-6 text-gray-400 font-['Exo_2'] text-lg">Connect your Ethereum wallet to deposit funds</div>
              <MechButton variant="primary" onClick={connectWallet} className="mx-auto min-w-[250px]">
                CONNECT WALLET
              </MechButton>
            </div>
          ) : (
            <div className="w-full animate-[fadeIn_0.5s_ease-out]">
              
              {/* Balance Display Panel */}
              <div className="bg-black/30 border border-white/5 rounded-lg p-4 mb-6 flex items-center justify-between">
                 <span className="font-['Quantico'] text-gray-400 uppercase text-xs tracking-widest">
                    Wallet Balance (Available)
                 </span>
                 <div className="text-right">
                    <span className="block text-white font-bold text-2xl font-mono">
                       {walletBalance} 
                    </span>
                    <span className="text-[#00E5FF] text-xs font-bold tracking-wider">TRUST TOKENS</span>
                 </div>
              </div>

              {/* Main Input Form */}
              <div className="space-y-6 mb-8">
                
                {/* AMOUNT INPUT */}
                <div>
                  <label className="block text-[#00A8FF] font-['Quantico'] text-xs uppercase tracking-wider mb-2">
                    Amount to Deposit
                  </label>
                  <div className="relative group">
                    <input 
                      type="number" 
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={status === 'APPROVING' || status === 'DEPOSITING'}
                      className="w-full bg-[#0A0A0F] border border-white/20 rounded p-4 text-2xl text-white font-['Orbitron'] focus:border-[#00E5FF] focus:outline-none focus:shadow-[0_0_15px_rgba(0,229,255,0.3)] transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-2">
                      <span className="text-gray-600 font-thin text-2xl">|</span>
                      <img src="/assets/trust.svg" className="w-6 h-6 opacity-80" alt="Trust Token" />
                      <span className="text-[#00E5FF] font-bold font-['Quantico']">TRUST</span>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTON */}
                <div className="pt-2">
                  <MechButton 
                    variant='primary' 
                    fullWidth 
                    onClick={handleTransaction}
                    disabled={status === 'APPROVING' || status === 'DEPOSITING' || !inputAmount}
                    sound={SoundType.CLICK}
                    className="h-[64px] text-lg" 
                  >
                    {status === 'APPROVING' ? 'APPROVING...' : 
                     status === 'DEPOSITING' ? 'DEPOSITING...' : 
                     'CONFIRM DEPOSIT'}
                  </MechButton>
                </div>
              </div>

              {/* Status Console / Notification Area */}
              <div className={`w-full rounded border p-4 font-mono text-sm relative overflow-hidden transition-all duration-300 ${
                status === 'ERROR' ? 'bg-red-900/20 border-red-500/50 text-red-300' :
                status === 'SUCCESS' ? 'bg-green-900/20 border-green-500/50 text-green-300' :
                status === 'IDLE' ? 'bg-black/40 border-white/5 text-gray-500' :
                'bg-[#00A8FF]/10 border-[#00A8FF]/30 text-[#00E5FF]'
              }`}>
                 <div className="absolute top-0 left-0 px-2 py-0.5 bg-black/50 text-[10px] uppercase tracking-widest border-b border-r border-white/10">
                   System Log
                 </div>
                 
                 <div className="mt-2 flex items-center gap-3">
                    {status === 'APPROVING' || status === 'DEPOSITING' || status === 'CONNECTING' ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <div className="w-4 h-4 flex items-center justify-center text-xs">
                        {status === 'SUCCESS' ? '✓' : status === 'ERROR' ? '!' : '>'}
                      </div>
                    )}
                    <span>{statusMessage || "Ready for transaction..."}</span>
                 </div>

                 {txHash && (
                   <div className="mt-2 ml-7 text-xs opacity-70 truncate">
                     TX: {txHash}
                   </div>
                 )}
              </div>

            </div>
          )}
        </div>
      </MechCard>
    </div>
  );
};

export default Deposit;
