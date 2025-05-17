import { useState } from "react";
import { db } from "./config";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

export function useContractAddress() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateContractAddress = async (ownerAddress, contractAddress) => {
    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!ownerAddress || !contractAddress) {
        throw new Error("Owner address and contract address are required");
      }

      // Validate address format
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (
        !addressRegex.test(ownerAddress) ||
        !addressRegex.test(contractAddress)
      ) {
        throw new Error("Invalid address format");
      }

      // Create or update document
      const addressRef = doc(db, "addresses", ownerAddress);
      await setDoc(
        addressRef,
        {
          contractAddress,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        success: true,
        message: "Address mapping updated successfully",
        data: { ownerAddress, contractAddress },
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getContractAddress = async (ownerAddress) => {
    try {
      setLoading(true);
      setError(null);

      if (!ownerAddress) {
        throw new Error("Owner address is required");
      }

      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(ownerAddress)) {
        throw new Error("Invalid address format");
      }

      const addressRef = doc(db, "addresses", ownerAddress);
      const addressDoc = await getDoc(addressRef);

      if (!addressDoc.exists()) {
        throw new Error("No contract address found for this owner");
      }

      return {
        success: true,
        data: addressDoc.data(),
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const addressesRef = collection(db, "addresses");
      const querySnapshot = await getDocs(addressesRef);

      const addresses = [];
      querySnapshot.forEach((doc) => {
        addresses.push({
          ownerAddress: doc.id,
          ...doc.data(),
        });
      });

      return {
        success: true,
        data: addresses,
        total: addresses.length,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateContractAddress,
    getContractAddress,
    getAllAddresses,
    loading,
    error,
  };
}
