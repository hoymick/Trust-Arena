
// Placeholder addresses - replace with deployed contract addresses
export const TRUST_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"; 
export const VAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Standard ERC-20 ABI
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function transferFrom(address from, address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint amount)"
];

// Interface for the Arena Vault/Deposit contract
export const VAULT_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getBalance(address account) view returns (uint256)",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdraw(address indexed user, uint256 amount)"
];
