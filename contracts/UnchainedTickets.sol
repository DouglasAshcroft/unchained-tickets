// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UnchainedTickets
 * @dev Advanced ERC1155 NFT contract for event tickets on Base blockchain
 * @notice Features:
 * - Royalty enforcement (ERC2981) for secondary sales
 * - Configurable ticket tiers (VIP, GA, etc.) with access control
 * - Perks tracking (meals, drinks, etc.) and consumption status
 * - Time-based resale restrictions (no sales during event)
 * - Automatic transformation to souvenir NFT after use
 * - Section and seat assignments
 * - Anti-counterfeiting through blockchain ownership
 */
contract UnchainedTickets is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply, ERC2981 {
    using Strings for uint256;

    // Contract metadata
    string public name = "Unchained Tickets";
    string public symbol = "UNCH";

    // Base URI for token metadata
    string private _baseURI;

    uint256 private constant TOKEN_ID_MULTIPLIER = 1_000_000;

    // Ticket tier types
    enum TicketTier {
        GENERAL_ADMISSION,
        VIP,
        PREMIUM,
        BACKSTAGE,
        CUSTOM
    }

    // Event management
    struct EventInfo {
        uint256 maxSupply;          // Maximum tickets for this event
        uint256 eventTimestamp;     // Event start time (Unix timestamp)
        uint256 eventEndTimestamp;  // Event end time (for resale restrictions)
        bool transferable;          // Can tickets be transferred before event?
        bool active;                // Is event active (not cancelled)?
        string metadataURI;         // IPFS or API URI for event metadata
        string souvenirMetadataURI; // Metadata URI for post-event souvenir NFT
        uint96 royaltyBps;          // Royalty in basis points (e.g., 500 = 5%)
        address royaltyRecipient;   // Who receives royalties
    }

    // Ticket tier configuration
    struct TierConfig {
        TicketTier tier;
        string tierName;            // e.g., "VIP", "General Admission"
        uint256 maxSupply;          // Max tickets for this tier
        uint256 priceCents;         // Price in cents (for reference)
        string[] accessAreas;       // Areas this tier can access
        string[] includedPerks;     // Perks included with tier
    }

    // Seat assignment (optional - for reserved seating)
    struct SeatAssignment {
        string section;
        string row;
        string seat;
        bool assigned;
    }

    // Perk tracking
    struct PerkConsumption {
        string perkName;
        uint256 maxQuantity;        // How many times can be redeemed
        uint256 consumed;           // How many times redeemed
    }

    // Ticket state for transformation
    enum TicketState {
        ACTIVE,      // Valid ticket, not yet used
        USED,        // Checked in, can still be at event
        SOUVENIR     // Event ended, transformed to collectible
    }

    // Mappings
    mapping(uint256 => EventInfo) public events;
    mapping(uint256 => bool) public usedTokens;
    mapping(uint256 => TicketState) public ticketStates;

    // Tier management: eventId => tierId => TierConfig
    mapping(uint256 => mapping(uint256 => TierConfig)) public eventTiers;
    mapping(uint256 => uint256) public eventTierCount; // Number of tiers per event

    // Seat assignments: eventId => tokenId => SeatAssignment
    mapping(uint256 => mapping(uint256 => SeatAssignment)) public seatAssignments;

    // Perk tracking: eventId => holder => perkName => consumption
    mapping(uint256 => mapping(address => mapping(string => PerkConsumption))) public perkTracking;

    // Token ID to tier mapping
    mapping(uint256 => uint256) public tokenToTier;
    // Token ID to event mapping
    mapping(uint256 => uint256) public tokenToEvent;

    // Event supply tracking
    mapping(uint256 => uint256) public eventActiveSupply;

    // Counter for unique token IDs within events
    mapping(uint256 => uint256) public eventTokenCounter;

    // Events
    event EventCreated(uint256 indexed eventId, uint256 maxSupply, uint256 eventTimestamp);
    event TierCreated(uint256 indexed eventId, uint256 indexed tierId, string tierName);
    event TicketMinted(uint256 indexed eventId, uint256 indexed tokenId, address indexed recipient, uint256 tierId);
    event TicketUsed(uint256 indexed eventId, address indexed owner);
    event TicketTransformed(uint256 indexed eventId, uint256 indexed tokenId, TicketState newState);
    event PerkConsumed(uint256 indexed eventId, address indexed holder, string perkName, uint256 quantity);
    event SeatAssigned(uint256 indexed eventId, uint256 indexed tokenId, string section, string row, string seat);
    event RoyaltyConfigured(uint256 indexed eventId, address recipient, uint96 royaltyBps);

    constructor(string memory baseURI_) ERC1155("") Ownable(msg.sender) {
        _baseURI = baseURI_;
    }

    /**
     * @dev Create a new event with ticket supply and royalty configuration
     */
    function createEvent(
        uint256 eventId,
        uint256 maxSupply,
        uint256 eventTimestamp,
        uint256 eventEndTimestamp,
        string memory metadataURI,
        string memory souvenirMetadataURI,
        address royaltyRecipient,
        uint96 royaltyBps
    ) external onlyOwner {
        require(events[eventId].maxSupply == 0, "Event already exists");
        require(maxSupply > 0, "Max supply must be greater than 0");
        require(eventTimestamp > block.timestamp, "Event must be in the future");
        require(eventEndTimestamp > eventTimestamp, "Event end must be after start");
        require(royaltyBps <= 10000, "Royalty cannot exceed 100%");

        events[eventId] = EventInfo({
            maxSupply: maxSupply,
            eventTimestamp: eventTimestamp,
            eventEndTimestamp: eventEndTimestamp,
            transferable: false,
            active: true,
            metadataURI: metadataURI,
            souvenirMetadataURI: souvenirMetadataURI,
            royaltyBps: royaltyBps,
            royaltyRecipient: royaltyRecipient
        });

        // Set default royalty for this event
        if (royaltyBps > 0 && royaltyRecipient != address(0)) {
            _setTokenRoyalty(eventId, royaltyRecipient, royaltyBps);
            emit RoyaltyConfigured(eventId, royaltyRecipient, royaltyBps);
        }

        emit EventCreated(eventId, maxSupply, eventTimestamp);
    }

    /**
     * @dev Create a ticket tier for an event
     */
    function createTier(
        uint256 eventId,
        string memory tierName,
        TicketTier tier,
        uint256 maxSupply,
        uint256 priceCents,
        string[] memory accessAreas,
        string[] memory includedPerks
    ) external onlyOwner {
        require(events[eventId].maxSupply > 0, "Event does not exist");

        uint256 tierId = eventTierCount[eventId];

        eventTiers[eventId][tierId] = TierConfig({
            tier: tier,
            tierName: tierName,
            maxSupply: maxSupply,
            priceCents: priceCents,
            accessAreas: accessAreas,
            includedPerks: includedPerks
        });

        eventTierCount[eventId]++;

        emit TierCreated(eventId, tierId, tierName);
    }

    /**
     * @dev Mint a ticket for a specific tier with optional seat assignment
     */
    function mintTicketWithTier(
        uint256 eventId,
        uint256 tierId,
        address recipient,
        string memory section,
        string memory row,
        string memory seat
    ) external onlyOwner returns (uint256) {
        require(events[eventId].active, "Event is not active");
        require(tierId < eventTierCount[eventId], "Invalid tier");
        require(recipient != address(0), "Invalid recipient address");

        TierConfig memory tierConfig = eventTiers[eventId][tierId];

        // Create unique token ID: eventId * 1000000 + counter
        require(
            eventActiveSupply[eventId] + 1 <= events[eventId].maxSupply,
            "Event sold out"
        );

        uint256 tokenId = (eventId * TOKEN_ID_MULTIPLIER) + eventTokenCounter[eventId];
        eventTokenCounter[eventId]++;

        tokenToTier[tokenId] = tierId;
        tokenToEvent[tokenId] = eventId;

        // Mint the ticket
        _mint(recipient, tokenId, 1, "");
        ticketStates[tokenId] = TicketState.ACTIVE;

        // Assign seat if provided
        if (bytes(section).length > 0) {
            seatAssignments[eventId][tokenId] = SeatAssignment({
                section: section,
                row: row,
                seat: seat,
                assigned: true
            });
            emit SeatAssigned(eventId, tokenId, section, row, seat);
        }

        // Initialize perks
        for (uint256 i = 0; i < tierConfig.includedPerks.length; i++) {
            string memory perkName = tierConfig.includedPerks[i];
            perkTracking[eventId][recipient][perkName] = PerkConsumption({
                perkName: perkName,
                maxQuantity: 1, // Default to 1, can be customized
                consumed: 0
            });
        }

        emit TicketMinted(eventId, tokenId, recipient, tierId);

        return tokenId;
    }

    /**
     * @dev Use a ticket (check-in) and optionally transform to souvenir
     */
    function useTicket(uint256 tokenId, address ticketHolder, bool transformToSouvenir) external onlyOwner {
        require(exists(tokenId), "Token does not exist");

        uint256 eventId = tokenToEvent[tokenId];
        require(events[eventId].maxSupply > 0, "Unknown event");
        require(balanceOf(ticketHolder, tokenId) > 0, "No ticket owned");
        require(!usedTokens[tokenId], "Ticket already used");
        require(ticketStates[tokenId] == TicketState.ACTIVE, "Ticket not active");

        usedTokens[tokenId] = true;

        if (transformToSouvenir) {
            ticketStates[tokenId] = TicketState.SOUVENIR;
            emit TicketTransformed(eventId, tokenId, TicketState.SOUVENIR);
        } else {
            ticketStates[tokenId] = TicketState.USED;
            emit TicketTransformed(eventId, tokenId, TicketState.USED);
        }

        emit TicketUsed(eventId, ticketHolder);
    }

    /**
     * @dev Consume a perk (e.g., redeem a free beer)
     */
    function consumePerk(
        uint256 eventId,
        address ticketHolder,
        string memory perkName,
        uint256 quantity
    ) external onlyOwner {
        PerkConsumption storage perk = perkTracking[eventId][ticketHolder][perkName];
        require(perk.maxQuantity > 0, "Perk not available");
        require(perk.consumed + quantity <= perk.maxQuantity, "Perk limit exceeded");

        perk.consumed += quantity;

        emit PerkConsumed(eventId, ticketHolder, perkName, quantity);
    }

    /**
     * @dev Check if holder can access a specific area
     */
    function canAccessArea(uint256 eventId, uint256 tokenId, string memory area) external view returns (bool) {
        require(exists(tokenId), "Token does not exist");
        require(tokenToEvent[tokenId] == eventId, "Token/event mismatch");

        uint256 tierId = tokenToTier[tokenId];
        TierConfig memory tierConfig = eventTiers[eventId][tierId];

        for (uint256 i = 0; i < tierConfig.accessAreas.length; i++) {
            if (keccak256(bytes(tierConfig.accessAreas[i])) == keccak256(bytes(area))) {
                return true;
            }
        }

        return false;
    }

    /**
     * @dev Override transfer to enforce resale restrictions
     * - Cannot transfer during event (between start and end time)
     * - Can transfer before or after event
     * - Royalties enforced on secondary sales via ERC2981
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 value,
        bytes memory data
    ) public override {
        // Allow minting and burning
        if (from == address(0) || to == address(0) || from == owner()) {
            super.safeTransferFrom(from, to, id, value, data);
            return;
        }

        uint256 eventId = tokenToEvent[id];
        EventInfo memory eventInfo = events[eventId];

        // Block transfers during the event
        require(
            block.timestamp < eventInfo.eventTimestamp || block.timestamp > eventInfo.eventEndTimestamp,
            "Cannot transfer tickets during event"
        );

        // Check if event allows transfers
        require(
            eventInfo.transferable || block.timestamp >= eventInfo.eventEndTimestamp,
            "Tickets are non-transferable before event ends"
        );

        super.safeTransferFrom(from, to, id, value, data);
    }

    /**
     * @dev Transform all tickets for an event to souvenirs (batch operation post-event)
     */
    function batchTransformToSouvenirs(uint256 eventId, uint256[] memory tokenIds) external onlyOwner {
        require(block.timestamp > events[eventId].eventEndTimestamp, "Event not ended");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (tokenToEvent[tokenId] != eventId) {
                continue;
            }

            if (ticketStates[tokenId] == TicketState.USED) {
                ticketStates[tokenId] = TicketState.SOUVENIR;
                emit TicketTransformed(eventId, tokenId, TicketState.SOUVENIR);
            }
        }
    }

    /**
     * @dev Get ticket state (ACTIVE, USED, SOUVENIR)
     */
    function getTicketState(uint256 tokenId) external view returns (TicketState) {
        return ticketStates[tokenId];
    }

    /**
     * @dev Get perk consumption status
     */
    function getPerkStatus(
        uint256 eventId,
        address holder,
        string memory perkName
    ) external view returns (uint256 maxQuantity, uint256 consumed) {
        PerkConsumption memory perk = perkTracking[eventId][holder][perkName];
        return (perk.maxQuantity, perk.consumed);
    }

    /**
     * @dev Get seat assignment for a token
     */
    function getSeatAssignment(uint256 eventId, uint256 tokenId)
        external
        view
        returns (string memory section, string memory row, string memory seat)
    {
        SeatAssignment memory assignment = seatAssignments[eventId][tokenId];
        require(assignment.assigned, "No seat assigned");
        return (assignment.section, assignment.row, assignment.seat);
    }

    /**
     * @dev Get tier information
     */
    function getTierInfo(uint256 eventId, uint256 tierId) external view returns (TierConfig memory) {
        require(tierId < eventTierCount[eventId], "Invalid tier");
        return eventTiers[eventId][tierId];
    }

    /**
     * @dev Update royalty configuration for an event
     */
    function updateRoyalty(uint256 eventId, address recipient, uint96 royaltyBps) external onlyOwner {
        require(events[eventId].maxSupply > 0, "Event does not exist");
        require(royaltyBps <= 10000, "Royalty cannot exceed 100%");

        events[eventId].royaltyRecipient = recipient;
        events[eventId].royaltyBps = royaltyBps;

        _setTokenRoyalty(eventId, recipient, royaltyBps);

        emit RoyaltyConfigured(eventId, recipient, royaltyBps);
    }

    /**
     * @dev Get token URI - returns souvenir metadata if transformed
     */
    function uri(uint256 tokenId) public view override returns (string memory) {
        uint256 eventId = tokenId / 1000000;
        require(events[eventId].maxSupply > 0, "Event does not exist");

        EventInfo memory eventInfo = events[eventId];

        // Return souvenir metadata if ticket is in souvenir state
        // Note: Need to check holder's state, but this is for general metadata
        if (bytes(eventInfo.souvenirMetadataURI).length > 0 &&
            block.timestamp > eventInfo.eventEndTimestamp) {
            return eventInfo.souvenirMetadataURI;
        }

        if (bytes(eventInfo.metadataURI).length > 0) {
            return eventInfo.metadataURI;
        }

        return string(abi.encodePacked(_baseURI, tokenId.toString()));
    }

    /**
     * @dev Set base URI
     */
    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURI = baseURI_;
    }

    /**
     * @dev Check if token exists
     */
    function exists(uint256 tokenId) public view override returns (bool) {
        return totalSupply(tokenId) > 0;
    }

    // Required overrides for multiple inheritance
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 tokenId = ids[i];
            uint256 amount = values[i];
            uint256 eventId = tokenToEvent[tokenId];
            if (eventId == 0) {
                eventId = tokenId / TOKEN_ID_MULTIPLIER;
            }

            if (from == address(0)) {
                eventActiveSupply[eventId] += amount;
            } else if (to == address(0)) {
                if (eventActiveSupply[eventId] >= amount) {
                    eventActiveSupply[eventId] -= amount;
                } else {
                    eventActiveSupply[eventId] = 0;
                }
            }
        }
    }
}
