// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IULSToken{
    error ZeroTokenId();
    error AlreadyMinted();
    error ParentDoesNotExist(address parent);

    event AddChild(address parent, address child, string childIdentifier, string parentIdentifier, string parentFormerURI);

    function addChild(address parent, address child) external;
}