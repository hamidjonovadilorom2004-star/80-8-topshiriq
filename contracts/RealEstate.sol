// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RealEstate {
    struct Property {
        uint256 id;
        string propertyType; // "Home", "Land", "Office"
        string location;
        string documentHash; // IPFS or CID
        address payable owner;
        uint256 price;
        bool isForSale;
    }

    struct History {
        address from;
        address to;
        uint256 timestamp;
        uint256 price;
    }

    uint256 public propertyCount;
    mapping(uint256 => Property) public properties;
    mapping(uint256 => History[]) public propertyHistory;
    mapping(uint256 => mapping(address => bool)) private documentAccessPermissions;

    event PropertyRegistered(uint256 indexed id, string propertyType, address owner);
    event PropertySold(uint256 indexed id, address oldOwner, address newOwner, uint256 price);
    event SaleStatusChanged(uint256 indexed id, bool isForSale, uint256 price);
    event AccessGranted(uint256 indexed id, address indexed viewer);

    modifier onlyPropertyOwner(uint256 _id) {
        require(properties[_id].owner == msg.sender, "You do not own this property");
        _;
    }

    function registerProperty(
        string memory _type, 
        string memory _location, 
        string memory _docHash
    ) public {
        propertyCount++;
        properties[propertyCount] = Property({
            id: propertyCount,
            propertyType: _type,
            location: _location,
            documentHash: _docHash,
            owner: payable(msg.sender),
            price: 0,
            isForSale: false
        });

        propertyHistory[propertyCount].push(History({
            from: address(0),
            to: msg.sender,
            timestamp: block.timestamp,
            price: 0
        }));

        emit PropertyRegistered(propertyCount, _type, msg.sender);
    }

    function toggleSale(uint256 _id, bool _isForSale, uint256 _price) public onlyPropertyOwner(_id) {
        properties[_id].isForSale = _isForSale;
        properties[_id].price = _price;
        emit SaleStatusChanged(_id, _isForSale, _price);
    }

    function buyProperty(uint256 _id) public payable {
        Property storage p = properties[_id];
        require(p.isForSale, "Property is not for sale");
        require(msg.value >= p.price, "Insufficient payment");
        
        address payable oldOwner = p.owner;
        
        // Transfer funds to old owner
        oldOwner.transfer(msg.value);

        // Update ownership
        p.owner = payable(msg.sender);
        p.isForSale = false;

        // Record history
        propertyHistory[_id].push(History({
            from: oldOwner,
            to: msg.sender,
            timestamp: block.timestamp,
            price: msg.value
        }));

        emit PropertySold(_id, oldOwner, msg.sender, msg.value);
    }

    function grantAccess(uint256 _id, address _viewer) public onlyPropertyOwner(_id) {
        documentAccessPermissions[_id][_viewer] = true;
        emit AccessGranted(_id, _viewer);
    }

    function getDocumentHash(uint256 _id) public view returns (string memory) {
        require(
            msg.sender == properties[_id].owner || documentAccessPermissions[_id][msg.sender],
            "Unauthorized to view documents"
        );
        return properties[_id].documentHash;
    }

    function getHistory(uint256 _id) public view returns (History[] memory) {
        return propertyHistory[_id];
    }
}
