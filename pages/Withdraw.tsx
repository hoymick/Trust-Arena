
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MechCard from '../components/ui/MechCard';
import MechButton from '../components/ui/MechButton';
import { soundManager } from '../utils/sound';
import { SoundType } from '../types';
import { TRUST_TOKEN_ADDRESS, VAULT_CONTRACT_ADDRESS, VAULT_ABI } from '../utils/web3Config';

const Withdraw: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [arenaBalance, setArenaBalance] = useState<string>('0.00');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [status, setStatus] = useState<'IDLE' | 'CONNECTING' | 'WITHDRAWING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [txHash, setTxHash] = useState<string>('');

  useEffect(() => {
    if ((window as any).ethereum) {
      setProvider(new ethers.BrowserProvider((window as any).ethereum));
    }
  }, []);

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const connectWallet = async () => {
    if (!provider) {
      setStatus('ERROR');
      setStatusMessage("MetaMask not detected.");
      return;
    }
    try {
      setStatus('CONNECTING');
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus('IDLE');
        soundManager.play(SoundType.PING);
        loadBalance(accounts[0]);
      }
    } catch (err: any) {
      setStatus('ERROR');
      setStatusMessage(err.message);
    }
  };

  const loadBalance = async (userAddr: string) => {
    if (!provider) return;
    try {
      const signer = await provider.getSigner();
      if (VAULT_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
         const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
         const rawBal = await vaultContract.getBalance(userAddr);
         setArenaBalance(parseFloat(ethers.formatUnits(rawBal, 18)).toFixed(2));
      } else {
         setArenaBalance("250.00"); // Placeholder
      }
    } catch (e) {
      console.error(e);
      setArenaBalance("0.00");
    }
  };

  const handleWithdraw = async () => {
    if (!account || !withdrawAmount) return;
    try {
      setStatus('WITHDRAWING');
      soundManager.play(SoundType.SERVO);
      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_CONTRACT_ADDRESS, VAULT_ABI, signer);
      const tx = await vaultContract.withdraw(ethers.parseUnits(withdrawAmount, 18));
      setStatusMessage("Transaction submitted...");
      setTxHash(tx.hash);
      await tx.wait();
      setStatus('SUCCESS');
      setStatusMessage("Withdrawal Successful!");
      soundManager.play(SoundType.PING);
      loadBalance(account);
      setWithdrawAmount('');
    } catch (err: any) {
      setStatus('ERROR');
      setStatusMessage(err.reason || err.message);
      soundManager.play(SoundType.IMPACT);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="font-['Orbitron'] text-4xl font-bold text-white mb-2 tracking-tight">
          TRUST <span className="text-[#8A2BE2]">WITHDRAWAL</span>
        </h1>
        <p className="font-['Quantico'] text-gray-400 tracking-widest text-sm">SECURE VAULT ACCESS</p>
      </div>

      <MechCard title="Vault Output" glowing={status === 'WITHDRAWING'}>
        <div className="flex flex-col items-center gap-6 p-4">
          {!account ? (
             <div className="py-12 text-center">
                <p className="text-gray-400 mb-6">Connect wallet to access funds</p>
                <MechButton variant="primary" onClick={connectWallet}>CONNECT WALLET</MechButton>
             </div>
          ) : (
             <div className="w-full space-y-6">
                <div className="bg-black/30 border border-white/5 p-4 rounded flex justify-between items-center">
                   <span className="font-['Quantico'] text-xs text-gray-400 uppercase">Available in Vault</span>
                   <div className="text-right">
                      <div className="text-2xl font-mono font-bold">{arenaBalance}</div>
                      <div className="text-[#8A2BE2] text-xs font-bold">TRUST TOKENS</div>
                   </div>
                </div>

                <div>
                   <label className="block text-[#8A2BE2] text-xs font-['Quantico'] uppercase mb-2">Withdraw Amount</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        value={withdrawAmount} 
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="w-full bg-[#0A0A0F] border border-white/20 rounded p-4 text-2xl text-white font-['Orbitron'] focus:border-[#8A2BE2] outline-none"
                        placeholder="0.00"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <img src="/assets/trust.svg" className="w-6 h-6" alt="Trust Token" />
                         <span className="text-[#8A2BE2] font-bold font-['Quantico']">TRUST</span>
                      </div>
                   </div>
                   <div className="mt-2 text-right">
                      <button onClick={() => setWithdrawAmount(arenaBalance)} className="text-xs text-gray-500 hover:text-white underline">Max Amount</button>
                   </div>
                </div>

                <MechButton variant="primary" fullWidth onClick={handleWithdraw} disabled={status === 'WITHDRAWING'}>
                   {status === 'WITHDRAWING' ? 'PROCESSING...' : 'INITIATE WITHDRAWAL'}
                </MechButton>

                {statusMessage && (
                   <div className={`p-3 border rounded text-sm font-mono ${status === 'ERROR' ? 'border-red-500 bg-red-900/20 text-red-300' : 'border-[#8A2BE2] bg-[#8A2BE2]/10 text-[#8A2BE2]'}`}>
                      {statusMessage}
                   </div>
                )}
             </div>
          )}
        </div>
      </MechCard>
    </div>
  );
};

export default Withdraw;
