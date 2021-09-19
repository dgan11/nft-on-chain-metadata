/**
Contract to create an SVGNFT when you pass in a premade (non-generative) svg
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// OpenZeppelin ERC721 Token library: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721URIStorage.sol
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Base 64 encoding library: https://github.com/OpenZeppelin/solidity-jwt/blob/master/contracts/Base64.sol
import "base64-sol/base64.sol";

// Dont reinvent the wheel can borrow from OpenZeppelin ERC721: https://docs.openzeppelin.com/contracts/4.x/
// This is the collection so this would be "Bored Apes" or "SFV NFT"
contract SVGNFT is ERC721URIStorage { // SVGNFT inherits from ERC721URIStorage

    // global variables
    uint256 public tokenCounter;
    event CreateSVGNFT(uint256 indexed tokenId, string tokenURI); // create an event evertime a token is created

    // constructor
    constructor() ERC721 ("SVG NFT", "svgNFT") {
        tokenCounter = 0;
    }

    // Mint function  -- Pass in an svg to the function ==> turn it into the token URI
    function create(string memory _svg) public {
        // Mint an NFT to whoever calls this function -- Use ERC721Storage built in function: _safeMint()
        _safeMint(msg.sender, tokenCounter);

        // Convert the svg to an imageURI -- This is not the token URI!!
        string memory imageURI = svgToImageURI(_svg);

        // Create the tokenURI now that we have the imageURI
        // Token URI looks like a JSON object that has an entry for the imageURI
        string memory tokenURI = formatTokenURI(imageURI);

        _setTokenURI(tokenCounter, tokenURI);
        emit CreateSVGNFT(tokenCounter, tokenURI); // emit an event upon creation

        tokenCounter++; // Everytime we mint get a new token count
    }

    /**
     Helper Function - take an SVG and create a distinct URI
     Steps Taken:
        - take the svg and base 64 encode it
        - add it to the string "data:image/svg+xml;base64,<Base64EncodingOfSVG>"
     */
    function svgToImageURI(string memory _svg) public pure returns (string memory){
        string memory baseURL = "data:image/svg+xml;base64,";

        // Call the Base64 libary encode() function
        string memory svgBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(_svg))));

        // How to concatenate strings in solidity
        string memory imageURI = string(abi.encodePacked(baseURL, svgBase64Encoded));
        return imageURI;
    }

    /**
    Helper Function - take an Image URI and create the full token URI JSON object
    Steps Taken:
        - Build a JSON object with all the fields we want in the metadata
        - has to return a base64 encoded object though
     */
     function formatTokenURI(string memory _imageURI) public pure returns (string memory) {
        
        // Base string
        string memory baseURL = "data:application/json;base64,";

        // Combine the baseURL with the tokenURI using string concat and return the full token URI
        return string(abi.encodePacked(
            baseURL,
            // Create the JSON Metadata object and convert it into Base64 encoding
            Base64.encode(
                bytes(abi.encodePacked(
                    '{"name": "SVG NFT", ', 
                    '"description": "An NFT based on an SVG!", ',
                    '"attributes": "", ',
                    '"image": "', _imageURI, '"}'
                )
            ))
        ));
    }
}