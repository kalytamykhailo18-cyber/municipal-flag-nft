"""
IPFS Upload Script for Municipal Flag NFT Game.

Uploads generated images and metadata to IPFS via Pinata.
"""
import os
import json
import requests
from pathlib import Path
from typing import Dict, Optional, Tuple
from tqdm import tqdm

from config import Config

# Ensure output directories exist
Config.ensure_directories()


class PinataUploader:
    """Upload files to IPFS using Pinata."""

    def __init__(self):
        self.api_key = os.getenv("PINATA_API_KEY", "")
        self.api_secret = os.getenv("PINATA_API_SECRET", "")
        self.jwt = os.getenv("PINATA_JWT", "")

        if not (self.api_key and self.api_secret) and not self.jwt:
            raise ValueError(
                "Pinata credentials not found. "
                "Set PINATA_API_KEY and PINATA_API_SECRET, or PINATA_JWT in .env"
            )

        self.base_url = "https://api.pinata.cloud"

    def _get_headers(self, for_upload: bool = False) -> Dict[str, str]:
        """Get headers for API requests."""
        if self.jwt:
            headers = {"Authorization": f"Bearer {self.jwt}"}
        else:
            headers = {
                "pinata_api_key": self.api_key,
                "pinata_secret_api_key": self.api_secret
            }

        if not for_upload:
            headers["Content-Type"] = "application/json"

        return headers

    def test_authentication(self) -> bool:
        """Test if Pinata credentials are valid."""
        try:
            response = requests.get(
                f"{self.base_url}/data/testAuthentication",
                headers=self._get_headers()
            )
            return response.status_code == 200
        except Exception as e:
            print(f"Authentication test failed: {e}")
            return False

    def upload_file(self, file_path: Path, name: Optional[str] = None) -> Optional[str]:
        """
        Upload a file to IPFS.

        Args:
            file_path: Path to the file to upload
            name: Optional name for the file on Pinata

        Returns:
            IPFS hash (CID) or None if failed
        """
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return None

        try:
            with open(file_path, 'rb') as file:
                files = {'file': (file_path.name, file)}

                metadata = {
                    "name": name or file_path.name,
                    "keyvalues": {
                        "project": "municipal-flag-nft",
                        "type": "image" if file_path.suffix in ['.png', '.jpg', '.jpeg'] else "metadata"
                    }
                }

                response = requests.post(
                    f"{self.base_url}/pinning/pinFileToIPFS",
                    files=files,
                    data={
                        "pinataMetadata": json.dumps(metadata),
                        "pinataOptions": json.dumps({"cidVersion": 1})
                    },
                    headers=self._get_headers(for_upload=True)
                )

                if response.status_code == 200:
                    return response.json()["IpfsHash"]
                else:
                    print(f"Upload failed: {response.status_code} - {response.text}")
                    return None

        except Exception as e:
            print(f"Error uploading file: {e}")
            return None

    def upload_json(self, data: Dict, name: str) -> Optional[str]:
        """
        Upload JSON data directly to IPFS.

        Args:
            data: Dictionary to upload as JSON
            name: Name for the JSON file

        Returns:
            IPFS hash (CID) or None if failed
        """
        try:
            payload = {
                "pinataContent": data,
                "pinataMetadata": {
                    "name": name,
                    "keyvalues": {
                        "project": "municipal-flag-nft",
                        "type": "metadata"
                    }
                },
                "pinataOptions": {
                    "cidVersion": 1
                }
            }

            response = requests.post(
                f"{self.base_url}/pinning/pinJSONToIPFS",
                json=payload,
                headers=self._get_headers()
            )

            if response.status_code == 200:
                return response.json()["IpfsHash"]
            else:
                print(f"Upload failed: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"Error uploading JSON: {e}")
            return None


def upload_all_to_ipfs():
    """Upload all images and metadata to IPFS."""
    print("=" * 60)
    print("Municipal Flag NFT - IPFS Upload")
    print("=" * 60)

    # Initialize uploader
    uploader = PinataUploader()

    # Test authentication
    print("\nTesting Pinata authentication...")
    if not uploader.test_authentication():
        print("ERROR: Pinata authentication failed!")
        print("Please check your PINATA_API_KEY and PINATA_API_SECRET in .env")
        return

    print("Authentication successful!")

    # Load metadata
    metadata_file = Config.METADATA_DIR / "all_metadata.json"
    if not metadata_file.exists():
        print(f"\nERROR: Metadata file not found: {metadata_file}")
        print("Please run generate_flags.py first")
        return

    with open(metadata_file, 'r') as f:
        all_metadata = json.load(f)

    print(f"\nFound {len(all_metadata)} flags to upload")

    # Track uploads
    upload_mapping = []
    images_uploaded = 0
    metadata_uploaded = 0
    failed = 0

    # Upload images first
    print("\n--- Uploading Images ---")
    for item in tqdm(all_metadata, desc="Images"):
        image_path = Config.OUTPUT_DIR / item["image_filename"]

        if not image_path.exists():
            tqdm.write(f"  SKIP: {item['image_filename']} (not found)")
            failed += 1
            continue

        # Upload image
        image_hash = uploader.upload_file(image_path, f"flag_{item['flag_id']}.png")

        if image_hash:
            item["image_ipfs_hash"] = image_hash
            images_uploaded += 1
        else:
            tqdm.write(f"  FAIL: {item['image_filename']}")
            failed += 1

    print(f"\nImages uploaded: {images_uploaded}/{len(all_metadata)}")

    # Update metadata with image hashes and upload
    print("\n--- Uploading Metadata ---")
    gateway = os.getenv("REACT_APP_IPFS_GATEWAY", "https://gateway.pinata.cloud/ipfs")

    for item in tqdm(all_metadata, desc="Metadata"):
        if "image_ipfs_hash" not in item:
            continue

        # Update metadata with IPFS image URL
        metadata = item["metadata"]
        metadata["image"] = f"ipfs://{item['image_ipfs_hash']}"

        # Upload metadata JSON
        metadata_hash = uploader.upload_json(metadata, f"metadata_{item['flag_id']}.json")

        if metadata_hash:
            item["metadata_ipfs_hash"] = metadata_hash
            metadata_uploaded += 1

            upload_mapping.append({
                "flag_id": item["flag_id"],
                "image_filename": item["image_filename"],
                "image_ipfs_hash": item["image_ipfs_hash"],
                "image_url": f"{gateway}/{item['image_ipfs_hash']}",
                "metadata_ipfs_hash": metadata_hash,
                "metadata_url": f"{gateway}/{metadata_hash}"
            })
        else:
            tqdm.write(f"  FAIL: metadata for flag {item['flag_id']}")
            failed += 1

    # Save upload mapping
    mapping_file = Config.OUTPUT_DIR / "ipfs_mapping.json"
    with open(mapping_file, 'w') as f:
        json.dump(upload_mapping, f, indent=2)

    # Also save to backend directory for easy import
    backend_mapping_file = Config.ROOT_DIR / "backend" / "ipfs_mapping.json"
    with open(backend_mapping_file, 'w') as f:
        json.dump(upload_mapping, f, indent=2)

    # Summary
    print("\n" + "=" * 60)
    print("Upload Complete!")
    print("=" * 60)
    print(f"  Images uploaded:   {images_uploaded}")
    print(f"  Metadata uploaded: {metadata_uploaded}")
    print(f"  Failed:            {failed}")
    print(f"\nMapping saved to:")
    print(f"  {mapping_file}")
    print(f"  {backend_mapping_file}")

    # Print sample URLs
    if upload_mapping:
        print("\nSample URLs:")
        sample = upload_mapping[0]
        print(f"  Image:    {sample['image_url']}")
        print(f"  Metadata: {sample['metadata_url']}")


def verify_uploads():
    """Verify that uploads are accessible."""
    print("=" * 60)
    print("Verifying IPFS Uploads")
    print("=" * 60)

    mapping_file = Config.OUTPUT_DIR / "ipfs_mapping.json"
    if not mapping_file.exists():
        print("No upload mapping found. Run upload first.")
        return

    with open(mapping_file, 'r') as f:
        upload_mapping = json.load(f)

    print(f"\nChecking {len(upload_mapping)} uploads...")

    accessible = 0
    failed = 0

    for item in tqdm(upload_mapping[:5], desc="Verifying"):  # Check first 5
        try:
            response = requests.head(item["image_url"], timeout=10)
            if response.status_code == 200:
                accessible += 1
            else:
                failed += 1
                tqdm.write(f"  FAIL: Flag {item['flag_id']} - Status {response.status_code}")
        except Exception as e:
            failed += 1
            tqdm.write(f"  FAIL: Flag {item['flag_id']} - {e}")

    print(f"\nVerification complete: {accessible} accessible, {failed} failed")


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--verify":
        verify_uploads()
    else:
        upload_all_to_ipfs()
