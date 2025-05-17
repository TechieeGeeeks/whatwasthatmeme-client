import { db } from "./config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

// Function to add a transaction
export const addTransaction = async (fromAddress, toAddress, amount, method) => {
  try {
    const timestamp = new Date();
    const transaction = {
      fromAddress,
      toAddress,
      amount,
      status: "Processed",
      method,
      timestamp,
    };

    // Create sender's transaction
    const senderTx = {
      ...transaction,
      type: "sent",
    };

    // Create receiver's transaction
    const receiverTx = {
      ...transaction,
      type: "received",
    };

    // Add transactions to both addresses' documents
    await Promise.all([
      // Add to sender's document
      updateOrCreateAddressDoc(fromAddress, senderTx),
      // Add to receiver's document
      updateOrCreateAddressDoc(toAddress, receiverTx),
    ]);

    return {
      success: true,
      message: "Transaction added successfully",
    };
  } catch (error) {
    console.error("Error adding transaction: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Function to add claim transaction
export const addClaimTransaction = async (
  fromAddress,
  toAddress,
  amount,
  method,
  type
) => {
  try {
    const timestamp = new Date();
    const transaction = {
      fromAddress,
      toAddress,
      amount,
      type: type || "Claim Token",
      status: "Processed",
      method,
      timestamp,
    };

    // For claim transactions, only add to one address
    await updateOrCreateAddressDoc(fromAddress, transaction);

    return {
      success: true,
      message: "Transaction added successfully",
    };
  } catch (error) {
    console.error("Error adding transaction: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Function to get transactions for specific wallet addresses
export const getTransactions = async (walletAddresses) => {
  try {
    const [primaryAddress, secondaryAddress] = walletAddresses;
    const transactions = [];

    // Get transactions for both addresses
    const [primaryTxs, secondaryTxs] = await Promise.all([
      getAddressTransactions(primaryAddress),
      secondaryAddress ? getAddressTransactions(secondaryAddress) : Promise.resolve([]),
    ]);

    // Combine and sort all transactions
    transactions.push(...primaryTxs, ...secondaryTxs);

    // Sort by timestamp (newest first)
    transactions.sort((a, b) => {
      const timestampA = b.timestamp?.seconds || b.timestamp?.getTime() / 1000;
      const timestampB = a.timestamp?.seconds || a.timestamp?.getTime() / 1000;
      return timestampA - timestampB;
    });

    return {
      success: true,
      data: transactions,
    };
  } catch (error) {
    console.error("Error getting transactions: ", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Helper function to update or create an address document
async function updateOrCreateAddressDoc(address, transaction) {
  const addressDocRef = doc(collection(db, "hqTransactions"), address);
  const addressDoc = await getDoc(addressDocRef);

  if (!addressDoc.exists()) {
    // Create new document with first transaction
    await setDoc(addressDocRef, {
      transactions: [{ ...transaction, id: generateTransactionId() }],
    });
  } else {
    // Add transaction to existing document
    await updateDoc(addressDocRef, {
      transactions: arrayUnion({ ...transaction, id: generateTransactionId() }),
    });
  }
}

// Helper function to get transactions for an address
async function getAddressTransactions(address) {
  const addressDocRef = doc(collection(db, "hqTransactions"), address);
  const addressDoc = await getDoc(addressDocRef);

  if (!addressDoc.exists()) {
    return [];
  }

  return addressDoc.data().transactions || [];
}

// Helper function to generate transaction ID
function generateTransactionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}