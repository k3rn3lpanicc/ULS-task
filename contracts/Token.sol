// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IULSToken.sol";

contract ULSToken is ERC721, IULSToken, Ownable {
    
    uint256 counter = 1;
    string private _baseURIString;

    mapping (uint256 tokenId => uint256 state) public states;
    mapping (address user => uint256 corespondingTokenId) public reverseId;

    constructor(string memory _uri, string memory _name, string memory _symbol, address operator) ERC721(_name, _symbol) Ownable(operator) {
        _baseURIString = _uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseURIString;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (tokenId == 0) return string("");
        // hash tokenId and its coresponding state into a uint256 number called identifier
        bytes32 identifier = keccak256(abi.encodePacked(tokenId, states[tokenId]));
        // convert the uint256 number into a string
        return string(abi.encodePacked(_baseURI(), "/", identifier, ".json"));
    }

    function ULSsafeMint(address to) private returns (string memory) {
        if (balanceOf(to) != 0) revert AlreadyMinted();
        _safeMint(to, counter);
        reverseId[to] = counter;
        ++counter;
        return tokenURI(counter - 1);
    }

    function addChild(address parent, address child) public onlyOwner { 
        string memory childIdentifier = ULSsafeMint(child);
        if (reverseId[parent] == 0 && parent != address(0)) revert ParentDoesNotExist(parent);
        // emit an event for the backend to fetch & update the uri
        ++states[reverseId[parent]];
        string memory parentIdentifier = tokenURI(reverseId[parent]);
        emit AddChild(parent, child, childIdentifier, parentIdentifier);
    }
}