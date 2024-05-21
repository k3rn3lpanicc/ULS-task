// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IULSToken.sol";

contract ULSOperator is Ownable {
    IULSToken public ulstoken;
    IERC20 public paymentToken;

    mapping (address user => uint256 balance) public balances;
    uint256 public ratio = 100;
    error RefererNotFound(address referer);

    mapping (address user => address referer) public refers;
    mapping (address referer => bool) public users;


    constructor(address _payToken, address _ulsToken, address masterWallet) Ownable(msg.sender) {
        paymentToken = IERC20(_payToken);
        ulstoken = IULSToken(_ulsToken);
        refers[masterWallet] = address(0);
        users[masterWallet] = true;
    }

    function getReferrer(address user) public view returns (address) {
        return refers[user];
    }

    function setReferrer(address referer) public {
        refers[msg.sender] = referer;
    }

    function splitFunds(address to, uint256 amount) private {
        uint256 totalAmountDistributed = amount * ratio / 10000;
        while (to != address(0)){
            balances[to] += totalAmountDistributed;
            balances[to] -= (totalAmountDistributed * ratio) / 10000;
            totalAmountDistributed = (totalAmountDistributed * ratio) / 10000;
            if (refers[to] == address(0)){
                balances[to] += totalAmountDistributed;
            }
            to = refers[to];
        }
    }

    function purchase(address referer, uint256 amount) public {
        if (referer == address(0)) revert RefererNotFound(referer);
        if (users[referer] == false) revert RefererNotFound(referer);
        if (!paymentToken.approve(msg.sender, amount)) revert("Not enough funds");
        paymentToken.transferFrom(msg.sender, address(this), amount);
        splitFunds(referer, amount);
        ulstoken.addChild(referer, msg.sender);
        users[msg.sender] = true;
    }

    function withdraw() public {
        paymentToken.transfer(msg.sender, balances[msg.sender]);
    }
}