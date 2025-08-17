# photo_nft.py
from web3 import Web3
import json
import time

class PhotoNFT:
    def __init__(self, provider_url, contract_address, abi, wallet_address, private_key):
        print(f"Initializing PhotoNFT...")
        print(f"Provider URL: {provider_url}")
        print(f"Contract Address: {contract_address}")
        print(f"Wallet Address: {wallet_address}")
        
        # Connect to Flow EVM RPC
        self.w3 = Web3(Web3.HTTPProvider(provider_url))
        if not self.w3.is_connected():
            raise Exception("Web3 provider not connected!")
        
        print("✅ Web3 connected successfully")
        
        # Check network
        try:
            chain_id = self.w3.eth.chain_id
            block_number = self.w3.eth.block_number
            print(f"Connected to chain ID: {chain_id}, latest block: {block_number}")
        except Exception as e:
            print(f"Warning: Could not fetch network info: {e}")

        # Ensure addresses are checksumed
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.wallet_address = Web3.to_checksum_address(wallet_address)
        self.private_key = private_key

        # Validate wallet
        try:
            balance = self.w3.eth.get_balance(self.wallet_address)
            print(f"Wallet balance: {self.w3.from_wei(balance, 'ether')} ETH")
        except Exception as e:
            print(f"Warning: Could not fetch wallet balance: {e}")

        # Load the contract
        try:
            self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)
            print("✅ Contract loaded successfully")
            
            # Test contract connection by checking if it's a contract
            code = self.w3.eth.get_code(self.contract_address)
            if code == b'':
                raise Exception("No contract code found at this address!")
            print(f"✅ Contract code exists (length: {len(code)} bytes)")
            
        except Exception as e:
            print(f"❌ Contract loading failed: {e}")
            raise

    # ------------------------
    # Read-only functions
    # ------------------------
    def retrieve_photos(self, user_address):
        """Retrieve all photo hashes owned by a user"""
        try:
            user_address = Web3.to_checksum_address(user_address)
            print(f"Retrieving photos for user: {user_address}")
            
            result = self.contract.functions.retrievePhotos(user_address).call()
            print(f"Retrieved {len(result)} photos")
            return result
            
        except Exception as e:
            print(f"❌ retrieve_photos failed: {e}")
            raise

    def check_photo(self, photo_hash):
        """Check if a photo hash already exists"""
        try:
            print(f"Checking if photo hash exists: {photo_hash}")
            print(f"Hash length: {len(photo_hash)} characters")
            
            result = self.contract.functions.checkPhoto(photo_hash).call()
            print(f"checkPhoto result: {result}")
            return result
            
        except Exception as e:
            print(f"❌ check_photo failed: {e}")
            print(f"Error type: {type(e)}")
            return False

    def get_token_count(self):
        """Get the current token count (total number of minted NFTs)"""
        try:
            # Try multiple methods to get token count
            methods_to_try = [
                ('_tokenIds', 'Using _tokenIds counter'),
                ('totalSupply', 'Using totalSupply function'),
                ('tokenByIndex', 'Using enumerable extension')
            ]
            
            for method_name, description in methods_to_try:
                try:
                    if hasattr(self.contract.functions, method_name):
                        if method_name == '_tokenIds':
                            result = getattr(self.contract.functions, method_name)().call()
                        elif method_name == 'totalSupply':
                            result = getattr(self.contract.functions, method_name)().call()
                        else:
                            # For tokenByIndex, we'll try to find the highest index
                            continue
                            
                        print(f"✅ {description}: {result} total NFTs minted")
                        return result
                except:
                    continue
            
            # If contract methods don't work, we can manually count by trying token IDs
            print("Standard methods failed, attempting manual count...")
            count = 0
            max_attempts = 1000  # Reasonable upper limit
            
            for token_id in range(1, max_attempts + 1):
                try:
                    # Try to get token URI - if it exists, token exists
                    self.contract.functions.tokenURI(token_id).call()
                    count += 1
                except:
                    # If we hit 10 consecutive failures, assume we've reached the end
                    if token_id - count > 10:
                        break
            
            print(f"Manual count found: {count} total NFTs")
            return count
            
        except Exception as e:
            print(f"❌ Could not get token count: {e}")
            return 0

    def get_user_photo_count(self, user_address=None):
        """Get the number of photos owned by a specific user"""
        try:
            if user_address is None:
                user_address = self.wallet_address
            
            # Validate the address format before converting
            if not user_address or len(user_address) != 42 or not user_address.startswith('0x'):
                raise ValueError(f"Invalid address format: {user_address}")
            
            user_address = Web3.to_checksum_address(user_address)
            photos = self.retrieve_photos(user_address)
            count = len(photos)
            print(f"User {user_address} owns {count} photos")
            return count
            
        except Exception as e:
            print(f"❌ Could not get user photo count: {e}")
            return 0

    # ------------------------
    # State-changing functions
    # ------------------------
    def mint_nft(self, photo_hash, metadata_uri="https://example.com/metadata.json"):
        """
        Mints an NFT for this wallet using the photo hash.
        """
        print(f"=== MINTING NFT ===")
        print(f"Recipient: {self.wallet_address}")
        print(f"Photo hash: {photo_hash}")
        print(f"Metadata URI: {metadata_uri}")
        
        try:
            # Get current nonce
            nonce = self.w3.eth.get_transaction_count(self.wallet_address)
            print(f"Using nonce: {nonce}")

            # Get current gas price
            gas_price = self.w3.eth.gas_price
            print(f"Current gas price: {self.w3.from_wei(gas_price, 'gwei')} gwei")

            # Build transaction
            print("Building transaction...")
            tx = self.contract.functions.mintNFT(
                self.wallet_address,   # recipient
                metadata_uri,          # metadata URI  
                photo_hash             # photo hash
            ).build_transaction({
                'from': self.wallet_address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': max(gas_price, self.w3.to_wei('1', 'gwei'))  # Ensure minimum gas price
            })
            
            print(f"Transaction built. Gas limit: {tx['gas']}, Gas price: {tx['gasPrice']}")

            # Estimate gas to make sure transaction will work
            try:
                estimated_gas = self.contract.functions.mintNFT(
                    self.wallet_address,
                    metadata_uri,
                    photo_hash
                ).estimate_gas({'from': self.wallet_address})
                print(f"Estimated gas needed: {estimated_gas}")
                
                if estimated_gas > tx['gas']:
                    print(f"Warning: Gas limit might be too low. Recommended: {estimated_gas}")
                    
            except Exception as e:
                print(f"Gas estimation failed: {e}")
                print("This might indicate the transaction will fail!")

            # Sign transaction
            print("Signing transaction...")
            signed_tx = self.w3.eth.account.sign_transaction(tx, private_key=self.private_key)

            # Send transaction
            print("Sending transaction...")
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
            print(f"Transaction sent! Hash: {tx_hash.hex()}")

            # Wait for confirmation with timeout
            print("Waiting for transaction confirmation...")
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
            
            # Check transaction status
            if receipt.status == 0:
                print("❌ Transaction failed!")
                print(f"Gas used: {receipt.gasUsed}")
                raise Exception("Transaction failed - check contract requirements")
            else:
                print("✅ Transaction successful!")
                print(f"Gas used: {receipt.gasUsed}")
                print(f"Transaction hash: {receipt.transactionHash.hex()}")
                print(f"Block number: {receipt.blockNumber}")

            return receipt

        except Exception as e:
            print(f"❌ Minting failed: {e}")
            print(f"Error type: {type(e)}")
            raise

    def verify_mint_success(self, photo_hash):
        """Verify that a mint operation was successful"""
        print(f"Verifying mint success for hash: {photo_hash}")
        
        # Wait a moment for state to update
        time.sleep(2)
        
        # Check if hash now exists
        exists = self.check_photo(photo_hash)
        
        # Check user's photos
        photos = self.retrieve_photos(self.wallet_address)
        
        print(f"Hash exists after mint: {exists}")
        print(f"User now has {len(photos)} photos")
        
        # Get total count across all users
        total_count = self.get_token_count()
        
        return {
            'hash_exists': exists,
            'user_photo_count': len(photos),
            'user_photos': photos,
            'total_nft_count': total_count
        }

    # ------------------------
    # Utility functions
    # ------------------------
    def get_network_info(self):
        """Get information about the current network"""
        try:
            return {
                'chain_id': self.w3.eth.chain_id,
                'block_number': self.w3.eth.block_number,
                'gas_price': self.w3.eth.gas_price,
                'wallet_balance': self.w3.eth.get_balance(self.wallet_address)
            }
        except Exception as e:
            print(f"Could not get network info: {e}")
            return None

    def test_contract_connection(self):
        """Test basic contract connectivity"""
        print("=== Testing Contract Connection ===")
        
        try:
            # Test a simple read operation
            test_hash = "test123"
            exists = self.contract.functions.checkPhoto(test_hash).call()
            print(f"✅ Contract read test successful. Hash '{test_hash}' exists: {exists}")
            return True
        except Exception as e:
            print(f"❌ Contract read test failed: {e}")
            return False