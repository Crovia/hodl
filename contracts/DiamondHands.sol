// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * DiamondHands - 10% Buy Tax / 10% Sell Tax
 * Taxes collected to a pool, redistributed via airdrops every 10 days.
 * No burns. Ever. Diamond hands get rewarded.
 */
contract DiamondHands is ERC20, Ownable {
    uint256 public constant BUY_TAX = 10; // 10%
    uint256 public constant SELL_TAX = 10; // 10%
    uint256 public constant TAX_DENOMINATOR = 100;

    address public taxWallet;
    address public pair; // DEX pair address

    mapping(address => bool) public isExcludedFromTax;

    event TaxCollected(address indexed from, uint256 amount, bool isBuy);
    event PairUpdated(address indexed pair);
    event TaxWalletUpdated(address indexed wallet);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        address taxWallet_
    ) ERC20(name_, symbol_) Ownable(msg.sender) {
        require(taxWallet_ != address(0), "Invalid tax wallet");
        taxWallet = taxWallet_;

        isExcludedFromTax[msg.sender] = true;
        isExcludedFromTax[taxWallet_] = true;
        isExcludedFromTax[address(this)] = true;

        _mint(msg.sender, totalSupply_ * 10 ** decimals());
    }

    function setPair(address pair_) external onlyOwner {
        require(pair_ != address(0), "Invalid pair");
        pair = pair_;
        emit PairUpdated(pair_);
    }

    function setTaxWallet(address wallet_) external onlyOwner {
        require(wallet_ != address(0), "Invalid wallet");
        taxWallet = wallet_;
        emit TaxWalletUpdated(wallet_);
    }

    function setExcludedFromTax(address account, bool excluded) external onlyOwner {
        isExcludedFromTax[account] = excluded;
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        if (amount == 0 || isExcludedFromTax[from] || isExcludedFromTax[to]) {
            super._update(from, to, amount);
            return;
        }

        uint256 taxAmount = 0;

        // Buy: transfer from pair
        if (from == pair) {
            taxAmount = (amount * BUY_TAX) / TAX_DENOMINATOR;
            emit TaxCollected(to, taxAmount, true);
        }
        // Sell: transfer to pair
        else if (to == pair) {
            taxAmount = (amount * SELL_TAX) / TAX_DENOMINATOR;
            emit TaxCollected(from, taxAmount, false);
        }

        if (taxAmount > 0) {
            super._update(from, taxWallet, taxAmount);
            amount -= taxAmount;
        }

        super._update(from, to, amount);
    }
}
