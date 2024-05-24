// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IULSToken.sol";

contract ULSOperator is Ownable, ReentrancyGuard {
    error RefererNotFound(address referer);
    error AlreadyRefered();
    error ZeroBalance();
    error SmallAmount();
    
    IULSToken public ulstoken;
    IERC20 public paymentToken;

    uint256 public ratio = 100;
    uint256 public k = 4400;
    address public masterWallet;
    address public remainingFundsWallet;
    
    mapping (address user => uint256 balance) public balances;
    mapping (address user => address referer) public refers;
    mapping (address referer => bool) public users;

    constructor(address _payToken, address _masterWallet, address _remainingFunds) Ownable(msg.sender) {
        paymentToken = IERC20(_payToken);
        masterWallet = _masterWallet;
        refers[_masterWallet] = address(0);
        users[_masterWallet] = true;
        remainingFundsWallet = _remainingFunds;
    }

    function setULSToken(address _ulsToken) public onlyOwner {
        ulstoken = IULSToken(_ulsToken);
        ulstoken.addChild(address(0), masterWallet);
    }

    function setRatio(uint256 _ratio) public onlyOwner {
        ratio = _ratio;
    }

    function getReferrer(address user) public view returns (address) {
        return refers[user];
    }

    function splitFunds(address to, uint256 amount) private {
        uint256 remainingAmount = amount;
        uint256 factor = 1;
        uint sl = 0;
        while (to != address(0)){
            sl = (amount * k) / (factor * 10000);
            balances[to] += sl;
            remainingAmount -= sl;
            to = refers[to];
            factor *= 2;
        }
        balances[remainingFundsWallet] += remainingAmount;
    }

    function purchase(address referer, uint256 amount) public {
        if (amount < 100e18) revert SmallAmount();
        if (refers[msg.sender] != address(0)) revert AlreadyRefered();
        refers[msg.sender] = referer;
        if (referer == address(0)) revert RefererNotFound(referer);
        if (users[referer] == false) revert RefererNotFound(referer);
        ulstoken.addChild(referer, msg.sender);
        if (!paymentToken.approve(msg.sender, amount)) revert("Not enough funds");
        paymentToken.transferFrom(msg.sender, address(this), amount);
        splitFunds(referer, amount);
        users[msg.sender] = true;
    }

    function withdraw() public nonReentrant{
        uint256 _balance = balances[msg.sender];
        if (_balance == 0) revert ZeroBalance();
        balances[msg.sender] = 0;
        paymentToken.transfer(msg.sender, _balance);
    }
}