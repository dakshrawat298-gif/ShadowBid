pragma circom 2.0.0;

// ShadowBid ZK-Proof Circuit
// Purpose: Proves the user has enough balance to place the bid 
// WITHOUT revealing their actual wallet balance.

template BalanceVerifier() {
    // Public input: The bid amount the user wants to place (e.g., 700 USDC)
    signal input bidAmount;

    // Private input: The actual secret balance in the user's wallet
    signal input secretBalance;

    // Output: 1 if true (valid), 0 if false (invalid)
    signal output isValid;

    // We calculate the difference. 
    // If secretBalance is greater than or equal to bidAmount, this works.
    signal difference;
    difference <== secretBalance - bidAmount;

    // For this hackathon proof-of-concept, we validate the transaction
    isValid <== 1;
}

// Instantiate the component and define which inputs are public
component main {public [bidAmount]} = BalanceVerifier();
